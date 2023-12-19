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
exports.completeTrade = exports.cancelTrade = exports.updateTrade = exports.showTrade = exports.listTrades = void 0;
const path = __importStar(require("path"));
const controller_1 = require("~~/http/wallets/spot/controller");
const queries_1 = require("~~/http/wallets/spot/queries");
const logger_1 = require("~~/logger");
const types_1 = require("~~/types");
const passwords_1 = require("~~/utils/passwords");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const logger = (0, logger_1.createLogger)('P2PAdminTrades');
// List all P2P Trades
async function listTrades() {
    return prisma_1.default.p2p_trade.findMany({
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
exports.listTrades = listTrades;
// Get a single P2P Trade
async function showTrade(id) {
    return prisma_1.default.p2p_trade.findUnique({
        where: { id },
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
exports.showTrade = showTrade;
// Update a P2P Trade
async function updateTrade(id, status) {
    return prisma_1.default.p2p_trade.update({
        where: { id },
        data: { status },
    });
}
exports.updateTrade = updateTrade;
// Cancel a P2P Trade
async function cancelTrade(id) {
    const trade = await prisma_1.default.p2p_trade.findUnique({
        where: { id },
        include: {
            offer: true,
        },
    });
    if (!trade) {
        throw new Error('Trade not found');
    }
    const updatedOffer = await prisma_1.default.$transaction(async (prisma) => {
        await prisma.p2p_offer.update({
            where: { id: trade.offer.id },
            data: {
                amount: trade.offer.amount + trade.amount,
                in_order: trade.offer.in_order - trade.amount,
            },
        });
        await prisma.p2p_dispute.updateMany({
            where: {
                trade_id: trade.id,
                status: {
                    in: ['PENDING', 'IN_PROGRESS'],
                },
            },
            data: { status: 'RESOLVED' },
        });
        return prisma.p2p_trade.update({
            where: { id },
            data: {
                status: 'CANCELLED',
            },
        });
    });
    return updatedOffer;
}
exports.cancelTrade = cancelTrade;
// Complete a P2P Trade
async function completeTrade(id) {
    const trade = await prisma_1.default.p2p_trade.findUnique({
        where: { id },
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
    return prisma_1.default.$transaction(async (prisma) => {
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
        });
    });
}
exports.completeTrade = completeTrade;
