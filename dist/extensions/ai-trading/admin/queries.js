"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalProfitFromAITrading = exports.getTotalInvestedInAITrading = exports.getCompletedAITrades = exports.getActiveAITrades = exports.getTotalAITrades = exports.getActiveAIPlans = exports.getTotalAIPlans = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getTotalAIPlans() {
    return prisma_1.default.ai_trading_plan.count();
}
exports.getTotalAIPlans = getTotalAIPlans;
async function getActiveAIPlans() {
    return prisma_1.default.ai_trading_plan.count({
        where: {
            status: true, // Assuming `true` corresponds to 'ACTIVE'
        },
    });
}
exports.getActiveAIPlans = getActiveAIPlans;
async function getTotalAITrades() {
    return prisma_1.default.ai_trading.count();
}
exports.getTotalAITrades = getTotalAITrades;
async function getActiveAITrades() {
    return prisma_1.default.ai_trading.count({
        where: {
            status: 'ACTIVE',
        },
    });
}
exports.getActiveAITrades = getActiveAITrades;
async function getCompletedAITrades() {
    return prisma_1.default.ai_trading.count({
        where: {
            status: 'COMPLETED',
        },
    });
}
exports.getCompletedAITrades = getCompletedAITrades;
async function getTotalInvestedInAITrading() {
    return prisma_1.default.ai_trading_plan
        .aggregate({
        _sum: {
            invested: true,
        },
    })
        .then((result) => result._sum.invested);
}
exports.getTotalInvestedInAITrading = getTotalInvestedInAITrading;
async function getTotalProfitFromAITrading() {
    return prisma_1.default.ai_trading
        .aggregate({
        _sum: {
            profit: true,
        },
        where: {
            result: 'WIN',
            status: 'COMPLETED',
        },
    })
        .then((result) => result._sum.profit);
}
exports.getTotalProfitFromAITrading = getTotalProfitFromAITrading;
