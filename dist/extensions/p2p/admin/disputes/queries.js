"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsResolvedQuery = exports.resolveDispute = exports.showDispute = exports.listDisputes = void 0;
const logger_1 = require("~~/logger");
const emails_1 = require("~~/utils/emails");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const logger = (0, logger_1.createLogger)('P2PAdminDisputes');
// List all P2P Offer Disputes
async function listDisputes() {
    return prisma_1.default.p2p_dispute.findMany({
        include: {
            raised_by: {
                select: {
                    first_name: true,
                    last_name: true,
                    uuid: true,
                    avatar: true,
                },
            },
            trade: {
                include: {
                    offer: {
                        include: {
                            payment_method: true,
                        },
                    },
                },
            },
        },
    });
}
exports.listDisputes = listDisputes;
// Get a single P2P Offer Dispute
async function showDispute(id) {
    return prisma_1.default.p2p_dispute.findUnique({
        where: { id },
        include: {
            raised_by: {
                select: {
                    first_name: true,
                    last_name: true,
                    uuid: true,
                    avatar: true,
                },
            },
            trade: {
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
                },
            },
        },
    });
}
exports.showDispute = showDispute;
// Resolve a P2P Offer Dispute
async function resolveDispute(id, resolution) {
    const dispute = (await prisma_1.default.p2p_dispute.update({
        where: { id },
        data: { resolution, status: 'IN_PROGRESS' },
        include: {
            raised_by: {
                select: {
                    email: true,
                    first_name: true,
                },
            },
            trade: {
                include: {
                    user: {
                        select: {
                            uuid: true,
                        },
                    },
                    seller: {
                        select: {
                            uuid: true,
                        },
                    },
                },
            },
        },
    }));
    try {
        await (0, emails_1.sendP2PDisputeResolutionEmail)(dispute.raised_by, dispute.trade, resolution);
        const otherParty = dispute.trade.user.uuid === dispute.raised_by.uuid
            ? dispute.trade.seller
            : dispute.trade.user;
        await (0, emails_1.sendP2PDisputeResolvingEmail)(otherParty, dispute.trade);
    }
    catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
    }
    return dispute;
}
exports.resolveDispute = resolveDispute;
async function markAsResolvedQuery(id) {
    const dispute = await prisma_1.default.p2p_dispute.findUnique({
        where: { id },
        include: {
            trade: {
                include: {
                    user: {
                        select: {
                            uuid: true,
                            first_name: true,
                            email: true,
                        },
                    },
                    seller: {
                        select: {
                            uuid: true,
                            first_name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
    if (!dispute) {
        throw new Error('Dispute not found');
    }
    if (dispute.trade.status === 'DISPUTE_OPEN') {
        await prisma_1.default.p2p_trade.update({
            where: { id: dispute.trade.id },
            data: { status: 'PAID' },
        });
    }
    const updatedDispute = (await prisma_1.default.p2p_dispute.update({
        where: { id },
        data: { status: 'RESOLVED' },
    }));
    try {
        await (0, emails_1.sendP2PDisputeClosingEmail)(dispute.trade.user, dispute.trade);
        await (0, emails_1.sendP2PDisputeClosingEmail)(dispute.trade.seller, dispute.trade);
    }
    catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
    }
    return updatedDispute;
}
exports.markAsResolvedQuery = markAsResolvedQuery;
