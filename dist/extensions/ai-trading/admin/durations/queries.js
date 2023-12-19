"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDuration = exports.updateDuration = exports.createDuration = exports.getDuration = exports.getDurations = void 0;
const types_1 = require("~~/types");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getDurations() {
    return (await prisma_1.default.ai_trading_duration.findMany({
        include: {
            ai_trading_plan_duration: true,
        },
    }));
}
exports.getDurations = getDurations;
async function getDuration(id) {
    return (await prisma_1.default.ai_trading_duration.findUnique({
        where: { id },
        include: {
            ai_trading_plan_duration: true,
        },
    }));
}
exports.getDuration = getDuration;
function isValidTimeframe(timeframe) {
    return Object.values(types_1.AiTradingTimeframe).includes(timeframe);
}
async function createDuration(duration, timeframe) {
    if (!isValidTimeframe(timeframe)) {
        throw new Error(`Invalid timeframe value: ${timeframe}`);
    }
    return (await prisma_1.default.ai_trading_duration.create({
        data: {
            duration,
            timeframe,
        },
    }));
}
exports.createDuration = createDuration;
async function updateDuration(id, duration, timeframe) {
    return (await prisma_1.default.ai_trading_duration.update({
        where: { id },
        data: {
            duration,
            timeframe,
        },
    }));
}
exports.updateDuration = updateDuration;
async function deleteDuration(id) {
    await prisma_1.default.ai_trading_duration.delete({
        where: { id },
    });
}
exports.deleteDuration = deleteDuration;
