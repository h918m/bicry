"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeWallet = exports.controllers = void 0;
// userWalletController.ts
const ethers_1 = require("ethers");
const queries_1 = require("~~/http/wallets/queries");
const types_1 = require("~~/types");
const queries_2 = require("../../../../http/wallets/queries");
const logger_1 = require("../../../../logger");
const utils_1 = require("../../../../utils");
const encrypt_1 = require("../../../../utils/encrypt");
const passwords_1 = require("../../../../utils/passwords");
const prisma_1 = __importDefault(require("../../../../utils/prisma"));
const queries_3 = require("../../admin/custodial/queries");
const utils_2 = require("../../utils");
const wallet_1 = require("../../utils/wallet");
const queries_4 = require("../tokens/queries");
const queries_5 = require("./queries");
const logger = (0, logger_1.createLogger)('Ecosystem Wallets');
const transactionQueue = new Map();
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query, ____, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            const { transactions, addresses } = query;
            return await (0, queries_5.getWallets)(user.id, transactions === 'true', addresses === 'true');
        }
        catch (error) {
            throw new Error(`Failed to fetch user wallets: ${error.message}`);
        }
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            return await (0, queries_5.getWallet)(user.id, params.currency);
        }
        catch (error) {
            throw new Error(`Failed to fetch user wallet: ${error.message}`);
        }
    }),
    store: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            const { currency } = params;
            const wallet = await (0, exports.storeWallet)(user, currency);
            return wallet;
        }
        catch (error) {
            logger.error(`Failed to create wallet: ${error.message}`);
            throw new Error(`Failed to create wallet: ${error.message}`);
        }
    }),
    withdraw: (0, utils_1.handleController)(async (_, __, params, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            return await storeWithdrawal(params, body, user);
        }
        catch (error) {
            if (error.code === 'INSUFFICIENT_FUNDS') {
                console.log('You do not have enough Ether to perform this transaction.');
            }
            throw new Error(`Failed to withdraw: ${error.message}`);
        }
    }),
    transfer: (0, utils_1.handleController)(async (_, __, params, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            const { uuid } = params;
            const { currency, amount } = body;
            const senderWallet = await (0, queries_5.getWallet)(user.id, currency);
            if (!senderWallet) {
                throw new Error('User wallet not found');
            }
            const recipientAccount = await prisma_1.default.user.findFirst({
                where: { uuid },
            });
            let recipientWallet = (await (0, queries_5.getWalletByUuid)(uuid));
            if (!recipientWallet) {
                recipientWallet = await (0, exports.storeWallet)(recipientAccount, currency);
            }
            if (senderWallet.balance < amount) {
                throw new Error('Insufficient funds');
            }
            // TODO: addresses balance and private ledger
            await prisma_1.default.$transaction([
                prisma_1.default.wallet.update({
                    where: { id: senderWallet.id },
                    data: { balance: senderWallet.balance - amount },
                }),
                prisma_1.default.wallet.update({
                    where: { id: recipientWallet.id },
                    data: { balance: recipientWallet.balance + amount },
                }),
                prisma_1.default.transaction.create({
                    data: {
                        uuid: (0, passwords_1.makeUuid)(),
                        user_id: user.id,
                        wallet_id: senderWallet.id,
                        type: types_1.TransactionType.OUTGOING_TRANSFER,
                        status: 'COMPLETED',
                        amount,
                        description: `${types_1.TransactionType.OUTGOING_TRANSFER} of ${amount} ${currency}`,
                        fee: 0,
                    },
                }),
                prisma_1.default.transaction.create({
                    data: {
                        uuid: (0, passwords_1.makeUuid)(),
                        user_id: recipientAccount.id,
                        wallet_id: recipientWallet.id,
                        type: types_1.TransactionType.INCOMING_TRANSFER,
                        status: 'COMPLETED',
                        amount,
                        description: `${types_1.TransactionType.INCOMING_TRANSFER} of ${amount} ${currency}`,
                        fee: 0,
                    },
                }),
            ]);
            return { message: 'Transfer successful' };
        }
        catch (error) {
            throw new Error(`Failed to transfer: ${error.message}`);
        }
    }),
    depositAddress: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            const { chain } = params;
            const wallets = await (0, queries_3.getActiveCustodialWallets)(chain);
            if (!wallets || wallets.length === 0) {
                throw new Error('User wallet not found');
            }
            // Pick random wallet and return its address
            const randomIndex = Math.floor(Math.random() * wallets.length);
            const selectedWallet = wallets[randomIndex];
            const address = selectedWallet.address;
            return address;
        }
        catch (error) {
            throw new Error(`Failed to fetch deposit address: ${error.message}`);
        }
    }),
};
const storeWallet = async (user, currency) => {
    // Fetch all enabled tokens for the given currency
    const tokens = await (0, queries_4.getActiveTokensByCurrency)(currency);
    if (!tokens.length) {
        logger.error('No enabled tokens found for this currency');
        throw new Error('No enabled tokens found for this currency');
    }
    try {
        (0, encrypt_1.encrypt)('test');
    }
    catch (error) {
        logger.error('Encryption key is not set');
        throw new Error('Wallet creation failed, please contact support');
    }
    // Start a transaction
    return await prisma_1.default.$transaction(async (prisma) => {
        // Create a single wallet first
        const newWallet = await prisma.wallet.create({
            data: {
                uuid: (0, passwords_1.makeUuid)(),
                user_id: user.id,
                type: 'ECO',
                currency,
                balance: 0,
                inOrder: 0,
                addresses: {},
                status: false,
            },
        });
        const addresses = {};
        // Loop through each token to populate wallet data
        for (const token of tokens) {
            try {
                const { chain, network, contractType } = token;
                if (contractType === 'PERMIT') {
                    // Fetch and check the Master Wallet for each chain
                    const masterWallet = await prisma.ecosystem_master_wallet.findFirst({
                        where: { chain, status: 'ACTIVE' },
                    });
                    if (!masterWallet || !masterWallet.data) {
                        logger.warn(`Skipping chain ${chain} - Master wallet not found or not enabled`);
                        continue;
                    }
                    let nextIndex;
                    // Atomically increment the last index used for the chain, or initialize it
                    if (masterWallet.last_index !== null &&
                        masterWallet.last_index !== undefined) {
                        const updatedMasterWallet = await prisma.ecosystem_master_wallet.update({
                            where: { id: masterWallet.id },
                            data: {
                                last_index: {
                                    increment: 1,
                                },
                            },
                            select: {
                                last_index: true,
                            },
                        });
                        nextIndex = updatedMasterWallet.last_index;
                    }
                    else {
                        await prisma.ecosystem_master_wallet.update({
                            where: { id: masterWallet.id },
                            data: {
                                last_index: 1,
                            },
                        });
                        nextIndex = 1;
                    }
                    // Decrypt the master wallet data
                    const decryptedMasterData = JSON.parse((0, encrypt_1.decrypt)(masterWallet.data));
                    const hdNode = ethers_1.ethers.HDNodeWallet.fromPhrase(decryptedMasterData.mnemonic);
                    if (!('privateKey' in hdNode)) {
                        throw new Error('The extended key does not contain private key information.');
                    }
                    // Generate BIP44 compliant path
                    const completePath = `m/44'/60'/0'/0/${nextIndex}`;
                    const childNode = hdNode.derivePath(completePath);
                    // Prepare and encrypt child wallet data
                    const childWalletData = {
                        address: childNode.address,
                        publicKey: childNode.publicKey,
                        privateKey: childNode.privateKey,
                    };
                    const encryptedChildData = (0, encrypt_1.encrypt)(JSON.stringify(childWalletData));
                    // Prepare the address entry for this chain
                    addresses[chain] = {
                        address: childNode.address,
                        network,
                        balance: 0,
                    };
                    // Create the wallet data entry
                    await prisma.wallet_data.create({
                        data: {
                            wallet_id: newWallet.id,
                            currency,
                            chain,
                            balance: 0,
                            index: nextIndex,
                            data: encryptedChildData,
                        },
                    });
                    const networkEnvVar = `${chain}_NETWORK`;
                    const networkValue = process.env[networkEnvVar];
                    // Initialize pv for the new wallet
                    await prisma.ecosystem_private_ledger.create({
                        data: {
                            wallet_id: newWallet.id,
                            index: nextIndex,
                            currency,
                            chain,
                            offchain_difference: 0,
                            network: networkValue,
                        },
                    });
                }
                else if (contractType === 'NO_PERMIT') {
                    addresses[chain] = {
                        balance: 0,
                    };
                }
                else if (contractType === 'NATIVE') {
                    const wallet = ethers_1.ethers.Wallet.createRandom();
                    // Derive the HDNode from the wallet's mnemonic
                    const hdNode = ethers_1.ethers.HDNodeWallet.fromPhrase(wallet.mnemonic.phrase);
                    const xprv = hdNode.extendedKey;
                    const xpub = hdNode.neuter().extendedKey;
                    const mnemonic = hdNode.mnemonic.phrase;
                    const address = hdNode.address;
                    const publicKey = hdNode.publicKey;
                    const privateKey = hdNode.privateKey;
                    const path = hdNode.path;
                    const chainCode = hdNode.chainCode;
                    const walletDetails = {
                        mnemonic,
                        publicKey,
                        privateKey,
                        xprv,
                        xpub,
                        chainCode,
                        path,
                    };
                    addresses[currency] = {
                        address,
                        network,
                        balance: 0,
                    };
                    // Encrypt and store the wallet data
                    const encryptedWalletData = (0, encrypt_1.encrypt)(JSON.stringify(walletDetails));
                    // Create the wallet data entry
                    await prisma.wallet_data.create({
                        data: {
                            wallet_id: newWallet.id,
                            currency,
                            chain,
                            balance: 0,
                            data: encryptedWalletData,
                            index: 0,
                        },
                    });
                }
            }
            catch (error) {
                logger.error(`Failed to create wallet for token ${token.name}: ${error.message}`);
            }
        }
        // Check if any addresses were successfully created
        if (Object.keys(addresses).length === 0) {
            logger.error('Failed to create any addresses for the wallet');
            throw new Error('Failed to create any addresses for the wallet');
        }
        const updatedWallet = await prisma.wallet.update({
            where: { id: newWallet.id },
            data: { status: true, addresses },
        });
        return updatedWallet;
    });
};
exports.storeWallet = storeWallet;
async function populateInitialQueue() {
    try {
        const pendingTransactions = await (0, queries_5.getPendingTransactions)();
        pendingTransactions.forEach((transaction) => {
            transactionQueue.set(transaction.uuid, transaction);
        });
    }
    catch (error) {
        logger.error(`Failed to populate initial queue: ${error.message}`);
    }
}
async function processPendingWithdrawals() {
    if (transactionQueue.size === 0) {
        return;
    }
    const [uuid, transaction] = transactionQueue.entries().next().value;
    transactionQueue.delete(uuid);
    try {
        await handleWithdrawal(transaction.uuid, transaction.wallet_id, transaction.metadata?.chain, transaction.amount, transaction.metadata?.toAddress);
    }
    catch (error) {
        logger.error(`Failed to process transaction: ${error.message}`);
        await (0, queries_5.refundUser)(transaction);
    }
}
function processQueue() {
    processPendingWithdrawals().then(() => {
        setImmediate(processQueue);
    });
}
populateInitialQueue().then(() => {
    processQueue();
});
const calculateWithdrawalFee = (amount, currencyWithdrawalFee, minimumWithdrawalFee) => {
    const calculatedFee = amount * currencyWithdrawalFee;
    return Math.max(calculatedFee, minimumWithdrawalFee);
};
const storeWithdrawal = async (params, body, user) => {
    const { uuid } = params;
    const { amount, chain, toAddress } = body;
    (0, wallet_1.validateAddress)(toAddress);
    const userWallet = await (0, queries_2.getWallet)(uuid);
    if (!userWallet) {
        throw new Error('User wallet not found');
    }
    const token = await (0, queries_4.getToken)(chain, userWallet.currency);
    if (!token) {
        throw new Error('Token not found');
    }
    const currencyWithdrawalFee = token.fees?.withdrawal ?? 0;
    const minimumWithdrawalFee = token.fees?.min_withdrawal ?? 0;
    // Calculate the withdrawal fee
    const withdrawalFee = calculateWithdrawalFee(amount, currencyWithdrawalFee, minimumWithdrawalFee);
    // Calculate the total amount to be deducted
    const totalAmount = amount + withdrawalFee;
    if (token.contractType === 'PERMIT') {
        const walletData = await (0, queries_5.getWalletData)(userWallet.id, chain);
        if (!walletData) {
            throw new Error('Wallet data not found');
        }
        await (0, wallet_1.checkAvailableFunds)(userWallet, walletData, totalAmount);
    }
    else {
        if (userWallet.balance < amount) {
            throw new Error('Insufficient funds');
        }
    }
    const { currency } = userWallet;
    await (0, queries_5.decrementWalletBalance)(userWallet, chain, totalAmount);
    const transaction = await (0, queries_5.createPendingTransaction)(user.id, userWallet.id, currency, chain, amount, toAddress, withdrawalFee);
    transactionQueue.set(transaction.uuid, transaction);
    return { message: 'Withdrawal request received', ...transaction };
};
const handleWithdrawal = async (uuid, walletId, chain, amount, toAddress) => {
    (0, wallet_1.validateAddress)(toAddress);
    const provider = (0, utils_2.initializeProvider)(chain);
    const userWallet = await (0, queries_1.getWalletById)(walletId);
    const { currency } = userWallet;
    const { contract, contractAddress, gasPayer, contractType, tokenDecimals } = await (0, wallet_1.initializeContracts)(chain, currency, provider);
    const amountEth = ethers_1.ethers.parseUnits(amount.toString(), tokenDecimals);
    let walletData, actualTokenOwner, alternativeWalletUsed, transaction, alternativeWallet;
    if (contractType === 'PERMIT') {
        walletData = await (0, queries_5.getWalletData)(walletId, chain);
        const ownerData = await (0, wallet_1.getAndValidateTokenOwner)(walletData, amountEth, contract, provider);
        actualTokenOwner = ownerData.actualTokenOwner;
        alternativeWalletUsed = ownerData.alternativeWalletUsed;
        alternativeWallet = ownerData.alternativeWallet;
        try {
            await (0, wallet_1.executePermit)(contract, contractAddress, gasPayer, actualTokenOwner, amountEth, provider);
        }
        catch (error) {
            logger.error(`Failed to execute permit: ${error.message}`);
            throw new Error(`Failed to execute permit: ${error.message}`);
        }
        try {
            transaction = await (0, wallet_1.executeWithdrawal)(contract, contractAddress, gasPayer, actualTokenOwner, toAddress, amountEth, provider);
        }
        catch (error) {
            logger.error(`Failed to execute withdrawal: ${error.message}`);
            throw new Error(`Failed to execute withdrawal: ${error.message}`);
        }
    }
    else if (contractType === 'NO_PERMIT') {
        const isNative = utils_2.chainConfigs[chain].currency === currency;
        try {
            transaction = await (0, wallet_1.executeNoPermitWithdrawal)(chain, contractAddress, gasPayer, toAddress, amountEth, provider, isNative);
        }
        catch (error) {
            logger.error(`Failed to execute withdrawal: ${error.message}`);
            throw new Error(`Failed to execute withdrawal: ${error.message}`);
        }
    }
    else if (contractType === 'NATIVE') {
        try {
            walletData = await (0, queries_5.getWalletData)(walletId, chain);
            const payer = await (0, wallet_1.getAndValidateNativeTokenOwner)(walletData, amountEth, provider);
            transaction = await (0, wallet_1.executeNativeWithdrawal)(payer, toAddress, amountEth, provider);
        }
        catch (error) {
            logger.error(`Failed to execute withdrawal: ${error.message}`);
            throw new Error(`Failed to execute withdrawal: ${error.message}`);
        }
    }
    if (transaction && transaction.hash) {
        // Checking the transaction status
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
            try {
                const txReceipt = await provider.getTransactionReceipt(transaction.hash);
                if (txReceipt && txReceipt.status === 1) {
                    if (alternativeWalletUsed) {
                        await (0, queries_5.updateAlternativeWallet)(currency, chain, amount);
                        // Deduct from the wallet that was used for withdrawal
                        await updatePrivateLedger(alternativeWallet.wallet_id, alternativeWallet.index, currency, chain, amount);
                        // Add to the wallet that initiated the withdrawal
                        await updatePrivateLedger(walletId, walletData.index, currency, chain, -amount);
                    }
                    await prisma_1.default.transaction.update({
                        where: { uuid },
                        data: {
                            status: 'COMPLETED',
                            description: `Withdrawal of ${amount} ${currency} to ${toAddress}`,
                            reference_id: transaction.hash,
                        },
                    });
                    if (contractType === 'PERMIT') {
                        await updatePrivateLedger(walletId, walletData.index, currency, chain, -amount);
                    }
                    return true;
                }
                else {
                    attempts += 1;
                    await (0, utils_2.delay)(5000);
                }
            }
            catch (error) {
                logger.error(`Failed to check transaction status: ${error.message}`);
                // TODO: Inform admin about this
                attempts += 1;
                await (0, utils_2.delay)(5000);
            }
        }
        // If loop exits, mark transaction as failed
        logger.error(`Transaction ${transaction.hash} failed after ${maxAttempts} attempts.`);
    }
    throw new Error('Transaction failed');
};
async function getPrivateLedger(walletId, index, currency, chain) {
    // If not found, create a new ledger entry
    const networkEnvVar = `${chain}_NETWORK`;
    const networkValue = process.env[networkEnvVar];
    // Try to find the existing ledger entry
    return (await prisma_1.default.ecosystem_private_ledger.findFirst({
        where: {
            wallet_id: walletId,
            index,
            currency,
            chain,
            network: networkValue,
        },
    }));
}
async function updatePrivateLedger(walletId, index, currency, chain, amount) {
    // Fetch or create the ledger entry
    const ledger = await getPrivateLedger(walletId, index, currency, chain);
    // Update the offchain_difference
    const newOffchainDifference = (ledger?.offchain_difference ?? 0) + amount;
    const networkEnvVar = `${chain}_NETWORK`;
    const networkValue = process.env[networkEnvVar];
    await prisma_1.default.ecosystem_private_ledger.upsert({
        where: {
            private_ledger_unique: {
                wallet_id: walletId,
                index,
                currency,
                chain,
                network: networkValue,
            },
        },
        update: {
            offchain_difference: newOffchainDifference,
        },
        create: {
            wallet_id: walletId,
            index,
            currency,
            chain,
            offchain_difference: newOffchainDifference,
            network: networkValue,
        },
    });
}
async function normalizePrivateLedger(walletId) {
    // Fetch all ledger entries for this wallet
    const ledgers = await getAllPrivateLedgersForWallet(walletId);
    let positiveDifferences = [];
    let negativeDifferences = [];
    // Separate ledgers with positive and negative offchain_difference
    for (const ledger of ledgers) {
        if (ledger.offchain_difference > 0) {
            positiveDifferences.push(ledger);
        }
        else if (ledger.offchain_difference < 0) {
            negativeDifferences.push(ledger);
        }
    }
    // Sort the ledgers to optimize the normalization process
    positiveDifferences = positiveDifferences.sort((a, b) => b.offchain_difference - a.offchain_difference);
    negativeDifferences = negativeDifferences.sort((a, b) => a.offchain_difference - b.offchain_difference);
    // Normalize
    for (const posLedger of positiveDifferences) {
        for (const negLedger of negativeDifferences) {
            const amountToNormalize = Math.min(posLedger.offchain_difference, -negLedger.offchain_difference);
            if (amountToNormalize === 0) {
                continue;
            }
            // Update the ledgers
            await prisma_1.default.ecosystem_private_ledger.update({
                where: { id: posLedger.id },
                data: {
                    offchain_difference: posLedger.offchain_difference - amountToNormalize,
                },
            });
            await prisma_1.default.ecosystem_private_ledger.update({
                where: { id: negLedger.id },
                data: {
                    offchain_difference: negLedger.offchain_difference + amountToNormalize,
                },
            });
            // Update the in-memory objects to reflect the changes
            posLedger.offchain_difference -= amountToNormalize;
            negLedger.offchain_difference += amountToNormalize;
            // If one of the ledgers has been fully normalized, break out of the loop
            if (posLedger.offchain_difference === 0 ||
                negLedger.offchain_difference === 0) {
                break;
            }
        }
    }
}
async function getAllPrivateLedgersForWallet(walletId) {
    // Fetch all ledger entries for the given wallet ID
    const ledgers = await prisma_1.default.ecosystem_private_ledger.findMany({
        where: {
            wallet_id: walletId,
        },
    });
    return ledgers;
}
