"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserDispute = exports.showUserDispute = exports.listUserDisputes = void 0;
const logger_1 = require("~~/logger");
const emails_1 = require("~~/utils/emails");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const logger = (0, logger_1.createLogger)('P2PDisputes');
// List all disputes created by a specific user
async function listUserDisputes(userId) {
    return prisma_1.default.p2p_dispute.findMany({
        where: { raised_by_id: userId },
    });
}
exports.listUserDisputes = listUserDisputes;
// Show a specific dispute created by a user
async function showUserDispute(id, userId) {
    return prisma_1.default.p2p_dispute.findFirst({
        where: { id, raised_by_id: userId },
    });
}
exports.showUserDispute = showUserDispute;
// Create a new dispute for a user
async function createUserDispute(userId, tradeId, reason) {
    const dispute = (await prisma_1.default.p2p_dispute.create({
        data: {
            trade_id: tradeId,
            raised_by_id: userId,
            reason: reason,
            status: 'PENDING',
        },
        include: {
            raised_by: {
                select: {
                    email: true,
                    first_name: true,
                },
            },
            trade: true,
        },
    }));
    try {
        const disputedId = dispute.trade?.user_id === userId
            ? dispute.trade?.seller_id
            : dispute.trade?.user_id;
        const disputed = await prisma_1.default.user.findUnique({
            where: { id: disputedId },
        });
        console.log(disputed);
        await (0, emails_1.sendP2PDisputeOpenedEmail)(disputed, dispute.raised_by, dispute.trade, reason);
    }
    catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
    }
    return dispute;
}
exports.createUserDispute = createUserDispute;
