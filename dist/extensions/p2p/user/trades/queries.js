"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundTradeQuery = exports.releaseTradeQuery = exports.cancelDisputeTradeQuery = exports.disputeTradeQuery = exports.markTradeAsPaidQuery = exports.cancelTradeQuery = exports.sendMessageQuery = exports.createUserTrade = exports.showUserTrade = exports.listUserTrades = void 0;
const path = __importStar(require("path"));
const controller_1 = require("~~/http/wallets/spot/controller");
const queries_1 = require("~~/http/wallets/spot/queries");
const logger_1 = require("~~/logger");
const types_1 = require("~~/types");
const utils_1 = require("~~/utils");
const emails_1 = require("~~/utils/emails");
const passwords_1 = require("~~/utils/passwords");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const logger = (0, logger_1.createLogger)('P2PTrades');
// List user's P2P Trades
async function listUserTrades(userId) {
    return prisma_1.default.p2p_trade.findMany({
        where: { OR: [{ user_id: userId }, { seller_id: userId }] },
        include: {
            user: {
                select: {
                    first_name: true,
                    last_name: true,
                    uuid: true,
                    avatar: true,
                },
            },
            seller: {
                select: {
                    first_name: true,
                    last_name: true,
                    uuid: true,
                    avatar: true,
                },
            },
            offer: {
                select: {
                    uuid: true,
                    wallet_type: true,
                    currency: true,
                    payment_method: true,
                },
            },
            disputes: {
                select: {
                    reason: true,
                    status: true,
                    resolution: true,
                    raised_by: {
                        select: {
                            uuid: true,
                        },
                    },
                },
            },
        },
    });
}
exports.listUserTrades = listUserTrades;
// Get a single user's P2P Trade
async function showUserTrade(userId, uuid) {
    return prisma_1.default.p2p_trade.findUnique({
        where: { uuid, OR: [{ user_id: userId }, { seller_id: userId }] },
        include: {
            user: {
                select: {
                    first_name: true,
                    last_name: true,
                    uuid: true,
                    avatar: true,
                },
            },
            seller: {
                select: {
                    first_name: true,
                    last_name: true,
                    uuid: true,
                    avatar: true,
                },
            },
            offer: {
                select: {
                    uuid: true,
                    wallet_type: true,
                    currency: true,
                    payment_method: true,
                    reviews: {
                        select: {
                            reviewer: {
                                select: {
                                    uuid: true,
                                },
                            },
                            rating: true,
                        },
                    },
                },
            },
            disputes: {
                select: {
                    reason: true,
                    status: true,
                    resolution: true,
                    raised_by: {
                        select: {
                            uuid: true,
                        },
                    },
                },
            },
        },
    });
}
exports.showUserTrade = showUserTrade;
async function createUserTrade(userId, offer_uuid, amount) {
    const trade = await prisma_1.default.$transaction(async (prisma) => {
        const offer = await prisma.p2p_offer.findUnique({
            where: { uuid: offer_uuid },
        });
        if (!offer)
            throw new Error('Offer not found');
        // Check if the trade amount is greater than the offer amount
        if (amount > offer.amount) {
            throw new Error('Trade amount exceeds offer available amount');
        }
        await prisma.p2p_offer.update({
            where: { uuid: offer_uuid },
            data: {
                amount: offer.amount - amount,
                in_order: offer.in_order + amount,
            },
        });
        // Create the trade and chat together
        const trade = await prisma.p2p_trade.create({
            data: {
                user_id: userId,
                seller_id: offer.user_id,
                offer_id: offer.id,
                amount,
                status: 'PENDING',
            },
            include: {
                offer: true,
            },
        });
        return trade;
    });
    const seller = await prisma_1.default.user.findUnique({
        where: { id: trade.seller_id },
    });
    try {
        const buyer = await prisma_1.default.user.findUnique({
            where: { id: trade.user_id },
        });
        await (0, emails_1.sendP2PTradeSaleConfirmationEmail)(seller, buyer, trade);
    }
    catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
    }
    if (trade.offer.amount === 0) {
        await prisma_1.default.p2p_offer.update({
            where: { id: trade.offer.id },
            data: {
                status: 'COMPLETED',
            },
        });
        try {
            await (0, emails_1.sendP2POfferAmountDepletionEmail)(seller, trade.offer, trade.offer.amount);
        }
        catch (error) {
            logger.error(`Failed to send email: ${error.message}`);
        }
    }
    return trade;
}
exports.createUserTrade = createUserTrade;
async function sendMessageQuery(userId, uuid, message, isSeller) {
    // Fetch user and ticket in parallel
    const [user, trade] = await Promise.all([
        prisma_1.default.user.findUnique({ where: { id: userId } }),
        prisma_1.default.p2p_trade.findUnique({ where: { uuid } }),
    ]);
    if (!user)
        throw (0, utils_1.createError)({
            statusMessage: 'User not found',
            statusCode: 404,
        });
    if (!trade)
        throw (0, utils_1.createError)({
            statusMessage: 'Ticket not found',
            statusCode: 404,
        });
    if (trade.status === 'CANCELLED')
        throw (0, utils_1.createError)({
            statusMessage: 'Ticket is cancelled',
            statusCode: 404,
        });
    // Add new message
    const messages = trade.messages || {}; // Check if trade.messages is defined
    const messageKey = Object.keys(messages).length.toString();
    messages[messageKey] = message;
    // Update chat
    const updateData = { messages };
    const buyer = !isSeller
        ? user
        : await prisma_1.default.user.findUnique({ where: { id: trade.user_id } });
    const seller = isSeller
        ? user
        : await prisma_1.default.user.findUnique({ where: { id: trade.seller_id } });
    if (seller) {
        const sender = isSeller ? seller : buyer;
        const receiver = isSeller ? buyer : seller;
        try {
            await (0, emails_1.sendP2PTradeReplyEmail)(receiver, sender, trade, message);
        }
        catch (error) {
            logger.error(`Failed to send email: ${error.message}`);
        }
    }
    return (await prisma_1.default.p2p_trade.update({
        where: { uuid },
        data: updateData,
    }));
}
exports.sendMessageQuery = sendMessageQuery;
// cancelTradeQuery
async function cancelTradeQuery(uuid) {
    const trade = await prisma_1.default.$transaction(async (prisma) => {
        const trade = await prisma.p2p_trade.findUnique({
            where: { uuid },
            include: { offer: true },
        });
        if (!trade)
            throw new Error('Trade not found');
        if (trade.status !== types_1.P2PTradeStatus.PENDING)
            throw new Error('Trade can only be cancelled if it is pending');
        await prisma.p2p_offer.update({
            where: { id: trade.offer_id },
            data: {
                amount: trade.offer.amount + trade.amount,
                in_order: trade.offer.in_order - trade.amount,
            },
        });
        return prisma.p2p_trade.update({
            where: { id: trade.id },
            data: { status: types_1.P2PTradeStatus.CANCELLED },
        });
    });
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: trade.user_id } });
        const seller = await prisma_1.default.user.findUnique({
            where: { id: trade.seller_id },
        });
        await (0, emails_1.sendP2PTradeCancellationEmail)(user, trade);
        await (0, emails_1.sendP2PTradeCancellationEmail)(seller, trade);
    }
    catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
    }
    return trade;
}
exports.cancelTradeQuery = cancelTradeQuery;
// markTradeAsPaidQuery
async function markTradeAsPaidQuery(userId, uuid, txHash) {
    const trade = await prisma_1.default.p2p_trade.findFirst({
        where: { uuid, user_id: userId },
    });
    if (!trade)
        throw new Error('Trade not found');
    if (trade.status !== types_1.P2PTradeStatus.PENDING)
        throw new Error('Trade can only be marked as paid if it is pending');
    const updatedTrade = (await prisma_1.default.p2p_trade.update({
        where: { id: trade.id },
        data: { status: types_1.P2PTradeStatus.PAID, tx_hash: txHash },
        include: { offer: true },
    }));
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: trade.user_id } });
        const seller = await prisma_1.default.user.findUnique({
            where: { id: trade.seller_id },
        });
        await (0, emails_1.sendP2PTradePaymentConfirmationEmail)(seller, user, updatedTrade, txHash);
    }
    catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
    }
    return updatedTrade;
}
exports.markTradeAsPaidQuery = markTradeAsPaidQuery;
// disputeTradeQuery
async function disputeTradeQuery(userId, uuid, reason) {
    const trade = await prisma_1.default.$transaction(async (prisma) => {
        const trade = await prisma.p2p_trade.findFirst({
            where: { uuid },
        });
        if (!trade)
            throw new Error('Trade not found');
        if (!reason)
            throw new Error('Reason is required');
        if (trade.status !== types_1.P2PTradeStatus.PAID)
            throw new Error('Trade can only be disputed if it is paid');
        await prisma.p2p_dispute.create({
            data: {
                trade_id: trade.id,
                raised_by_id: userId,
                reason,
                status: 'PENDING',
            },
        });
        return prisma.p2p_trade.update({
            where: { id: trade.id },
            data: { status: types_1.P2PTradeStatus.DISPUTE_OPEN },
        });
    });
    try {
        const disputer = await prisma_1.default.user.findUnique({ where: { id: userId } });
        const disputedId = disputer.id === userId ? trade?.seller_id : disputer.id;
        const disputed = await prisma_1.default.user.findUnique({
            where: { id: disputedId },
        });
        await (0, emails_1.sendP2PDisputeOpenedEmail)(disputed, disputer, trade, reason);
    }
    catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
    }
    return trade;
}
exports.disputeTradeQuery = disputeTradeQuery;
// cancelDisputeTradeQuery
async function cancelDisputeTradeQuery(userId, uuid) {
    const trade = await prisma_1.default.$transaction(async (prisma) => {
        const trade = await prisma.p2p_trade.findFirst({
            where: { uuid, user_id: userId },
        });
        if (!trade)
            throw new Error('Trade not found');
        if (trade.status !== types_1.P2PTradeStatus.DISPUTE_OPEN)
            throw new Error('Trade can only be cancelled if it is in a dispute');
        const dispute = await prisma.p2p_dispute.findFirst({
            where: { trade_id: trade.id },
        });
        if (!dispute)
            throw new Error('Dispute not found');
        await prisma.p2p_dispute.update({
            where: { id: dispute.id },
            data: { status: 'CANCELLED' },
        });
        return prisma.p2p_trade.update({
            where: { id: trade.id },
            data: { status: types_1.P2PTradeStatus.PAID },
        });
    });
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: trade.user_id } });
        const seller = await prisma_1.default.user.findUnique({
            where: { id: trade.seller_id },
        });
        await (0, emails_1.sendP2PDisputeClosingEmail)(seller, trade);
        await (0, emails_1.sendP2PDisputeClosingEmail)(user, trade);
    }
    catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
    }
    return trade;
}
exports.cancelDisputeTradeQuery = cancelDisputeTradeQuery;
// releaseTradeQuery
async function releaseTradeQuery(userId, uuid) {
    const trade = await prisma_1.default.p2p_trade.findFirst({
        where: { uuid, seller_id: userId },
        include: { offer: true },
    });
    if (!trade)
        throw new Error('Trade not found');
    if (!['PAID', 'DISPUTE_OPEN'].includes(trade.status))
        throw new Error('Trade can only be released if it is paid');
    const user = await prisma_1.default.user.findUnique({ where: { id: trade.user_id } });
    if (!user)
        throw new Error('User not found');
    let wallet = await prisma_1.default.wallet.findFirst({
        where: {
            user_id: user.id,
            type: trade.offer.wallet_type,
            currency: trade.offer.currency,
        },
    });
    if (!wallet) {
        if (trade.offer.wallet_type === 'FIAT') {
            wallet = await prisma_1.default.wallet.create({
                data: {
                    user_id: user.id,
                    type: 'FIAT',
                    currency: trade.offer.currency,
                },
            });
        }
        else if (trade.offer.wallet_type === 'SPOT') {
            let addresses;
            try {
                addresses = await (0, controller_1.generateWalletAddressQuery)(trade.offer.currency);
            }
            catch (error) {
                logger.error(`Failed to generate wallet address: ${error.message}`);
                throw new Error('Failed to generate wallet address, please contact support');
            }
            if (!addresses || !Object.keys(addresses).length) {
                logger.error(`Failed to generate wallet address`, addresses);
                throw new Error('Failed to generate wallet address, please try again');
            }
            wallet = await (0, queries_1.createWalletQuery)(user.id, trade.offer.currency, addresses);
        }
        else if (trade.offer.wallet_type === 'ECO') {
            let storeWallet;
            try {
                const isProduction = process.env.NODE_ENV === 'production';
                const fileExtension = isProduction ? '.js' : '.ts';
                const baseUrl = path.join(process.cwd(), isProduction ? '/dist' : '/server');
                const walletModule = await Promise.resolve(`${`${baseUrl}/extensions/ecosystem/user/wallets/controller${fileExtension}`}`).then(s => __importStar(require(s)));
                storeWallet = walletModule.storeWallet;
            }
            catch (error) {
                logger.error(`Failed to import storeWallet: ${error.message}`);
                throw new Error('Failed to import storeWallet function, please contact support');
            }
            wallet = await storeWallet(user.id, trade.offer.currency);
        }
    }
    if (!wallet)
        throw new Error('Buyer wallet not found');
    let commission = 0;
    const commissionPercentage = await prisma_1.default.settings.findFirst({
        where: { key: 'p2p_trade_commission' },
    });
    if (commissionPercentage &&
        commissionPercentage.value &&
        Number(commissionPercentage.value) !== 0) {
        commission = (trade.amount * Number(commissionPercentage.value)) / 100;
    }
    const balance = wallet.balance + trade.amount - commission;
    const commissionedAmount = trade.amount - commission;
    const updatedTrade = await prisma_1.default.$transaction(async (prisma) => {
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: balance },
        });
        if (commission > 0) {
            await prisma.p2p_commission.create({
                data: {
                    trade_id: trade.id,
                    amount: commission,
                },
            });
        }
        // Close all disputes associated with the trade
        await prisma.p2p_dispute.updateMany({
            where: {
                trade_id: trade.id,
                status: {
                    in: ['PENDING', 'IN_PROGRESS'],
                },
            },
            data: { status: 'RESOLVED' },
        });
        await prisma.p2p_offer.update({
            where: { id: trade.offer_id },
            data: {
                in_order: trade.offer.in_order - trade.amount,
            },
        });
        await prisma.transaction.create({
            data: {
                uuid: (0, passwords_1.makeUuid)(),
                user_id: user.id,
                wallet_id: wallet.id,
                amount: commissionedAmount,
                description: `P2P trade ${trade.uuid} release`,
                status: 'COMPLETED',
                fee: commission,
                type: 'P2P_TRADE',
                reference_id: trade.uuid,
            },
        });
        return prisma.p2p_trade.update({
            where: { id: trade.id },
            data: { status: types_1.P2PTradeStatus.COMPLETED },
            include: { offer: true },
        });
    });
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: trade.user_id } });
        const seller = await prisma_1.default.user.findUnique({
            where: { id: trade.seller_id },
        });
        await (0, emails_1.sendP2PTradeCompletionEmail)(seller, user, updatedTrade);
        await (0, emails_1.sendP2PTradeCompletionEmail)(user, seller, updatedTrade);
    }
    catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
    }
    return updatedTrade;
}
exports.releaseTradeQuery = releaseTradeQuery;
// refundTradeQuery
async function refundTradeQuery(userId, uuid) {
    const trade = await prisma_1.default.p2p_trade.findFirst({
        where: { uuid, user_id: userId },
    });
    if (!trade)
        throw new Error('Trade not found');
    if (!['DISPUTE_OPEN', 'ESCROW_REVIEW'].includes(trade.status))
        throw new Error('Trade can only be refunded if it is in a dispute or under escrow review');
    return prisma_1.default.p2p_trade.update({
        where: { id: trade.id },
        data: { status: types_1.P2PTradeStatus.REFUNDED },
    });
}
exports.refundTradeQuery = refundTradeQuery;
