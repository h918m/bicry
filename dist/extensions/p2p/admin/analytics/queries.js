"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResolvedP2PDisputes = exports.getTotalP2PDisputes = exports.getCompletedP2PTrades = exports.getTotalP2PTrades = exports.getActiveP2POffers = exports.getTotalP2POffers = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getTotalP2POffers() {
    return prisma_1.default.p2p_offer.count();
}
exports.getTotalP2POffers = getTotalP2POffers;
async function getActiveP2POffers() {
    return prisma_1.default.p2p_offer.count({
        where: {
            status: 'ACTIVE',
        },
    });
}
exports.getActiveP2POffers = getActiveP2POffers;
async function getTotalP2PTrades() {
    return prisma_1.default.p2p_trade.count();
}
exports.getTotalP2PTrades = getTotalP2PTrades;
async function getCompletedP2PTrades() {
    return prisma_1.default.p2p_trade.count({
        where: {
            status: 'COMPLETED',
        },
    });
}
exports.getCompletedP2PTrades = getCompletedP2PTrades;
async function getTotalP2PDisputes() {
    return prisma_1.default.p2p_dispute.count();
}
exports.getTotalP2PDisputes = getTotalP2PDisputes;
async function getResolvedP2PDisputes() {
    return prisma_1.default.p2p_dispute.count({
        where: {
            status: 'RESOLVED',
        },
    });
}
exports.getResolvedP2PDisputes = getResolvedP2PDisputes;
