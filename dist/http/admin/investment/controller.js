"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const redis_1 = require("~~/utils/redis");
const queries_1 = require("./queries");
async function cachePlans() {
    const plans = await (0, queries_1.getPlans)();
    await redis_1.redis.set('plans', JSON.stringify(plans), 'EX', 3600);
}
cachePlans();
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const cachedPlans = await redis_1.redis.get('plans');
            if (cachedPlans)
                return JSON.parse(cachedPlans);
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getPlans)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            const cachedPlans = await redis_1.redis.get('plans');
            if (cachedPlans) {
                const plans = JSON.parse(cachedPlans);
                const plan = plans.find((p) => p.id === Number(params.id));
                if (plan)
                    return plan;
            }
        }
        catch (err) {
            console.error('Redis error:', err);
        }
        return await (0, queries_1.getPlan)(Number(params.id));
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await (0, queries_1.createPlan)(body.plan);
            cachePlans();
            return {
                ...response,
                message: 'Investment plan created successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const response = await (0, queries_1.updatePlan)(Number(params.id), body.plan);
            cachePlans();
            return {
                ...response,
                message: 'Investment plan updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            await await (0, queries_1.deletePlan)(Number(params.id));
            cachePlans();
            return {
                message: 'Investment plan removed successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    updateStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            await (0, queries_1.updatePlanStatus)(body.ids, body.status);
            cachePlans();
            return {
                message: 'Investment plan updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
