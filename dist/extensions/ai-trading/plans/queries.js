"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlans = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getPlans() {
    const plans = await prisma_1.default.ai_trading_plan.findMany({
        where: { status: true },
        select: {
            id: true,
            title: true,
            description: true,
            image: true,
            min_amount: true,
            max_amount: true,
            invested: true,
            trending: true,
            status: true,
            ai_trading_plan_duration: {
                select: {
                    duration: {
                        select: {
                            id: true,
                            duration: true,
                            timeframe: true,
                        },
                    },
                },
            },
        },
    });
    return plans;
}
exports.getPlans = getPlans;
