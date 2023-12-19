"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDurations = exports.deletePlan = exports.updatePlan = exports.createPlan = exports.getPlan = exports.getPlans = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getPlans(status) {
    return (await prisma_1.default.ai_trading_plan.findMany({
        include: {
            ai_trading_plan_duration: true,
        },
    }));
}
exports.getPlans = getPlans;
async function getPlan(id) {
    return (await prisma_1.default.ai_trading_plan.findUnique({
        where: { id },
        include: {
            ai_trading_plan_duration: true,
        },
    }));
}
exports.getPlan = getPlan;
async function createPlan(name, title, description, min_amount, max_amount, profit_percentage, min_profit, max_profit, default_profit, default_result, durations, invested, status, image, trending) {
    const plan = await prisma_1.default.ai_trading_plan.create({
        data: {
            name,
            title,
            description,
            min_amount,
            max_amount,
            invested,
            profit_percentage,
            min_profit,
            max_profit,
            default_profit,
            default_result,
            status,
            image,
            trending,
        },
    });
    // No need to check for old durations in createPlan
    await syncDurations(plan.id, durations);
    return plan;
}
exports.createPlan = createPlan;
async function updatePlan(id, name, title, description, min_amount, max_amount, profit_percentage, min_profit, max_profit, default_profit, default_result, durations, invested, status, image, trending) {
    const plan = await prisma_1.default.ai_trading_plan.update({
        where: { id },
        data: {
            name,
            title,
            description,
            min_amount,
            max_amount,
            invested,
            profit_percentage,
            min_profit,
            max_profit,
            default_profit,
            default_result,
            status,
            image,
            trending,
        },
    });
    await syncDurations(id, durations);
    return plan;
}
exports.updatePlan = updatePlan;
async function deletePlan(id) {
    await prisma_1.default.ai_trading_plan.delete({
        where: { id },
    });
}
exports.deletePlan = deletePlan;
async function syncDurations(planId, durations) {
    const plan = await prisma_1.default.ai_trading_plan.findUnique({
        where: { id: planId },
        include: { ai_trading_plan_duration: true },
    });
    if (!plan)
        throw new Error('Plan not found');
    const existingDurationIds = plan.ai_trading_plan_duration.map((dp) => dp.duration_id);
    const toBeAdded = durations.filter((id) => !existingDurationIds.includes(id));
    const toBeRemoved = existingDurationIds.filter((id) => !durations.includes(id));
    if (toBeRemoved.length > 0) {
        await prisma_1.default.ai_trading_plan_duration.deleteMany({
            where: {
                plan_id: planId,
                duration_id: { in: toBeRemoved },
            },
        });
    }
    if (toBeAdded.length > 0) {
        await prisma_1.default.ai_trading_plan.update({
            where: { id: planId },
            data: {
                ai_trading_plan_duration: {
                    create: toBeAdded.map((durationId) => ({
                        duration_id: durationId,
                    })),
                },
            },
        });
    }
    const updatedPlan = await getPlan(planId);
    return updatedPlan;
}
exports.syncDurations = syncDurations;
