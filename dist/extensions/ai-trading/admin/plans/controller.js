"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        try {
            return await (0, queries_1.getPlans)();
        }
        catch (error) {
            throw new Error(`Failed to fetch plans: ${error.message}`);
        }
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            return await (0, queries_1.getPlan)(Number(params.id));
        }
        catch (error) {
            throw new Error(`Failed to fetch plan: ${error.message}`);
        }
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { name, title, description, min_amount, max_amount, profit_percentage, min_profit, max_profit, default_profit, default_result, invested, status, image, trending, durations, } = body.plan;
        try {
            return await (0, queries_1.createPlan)(name, title, description, min_amount, max_amount, profit_percentage, min_profit, max_profit, default_profit, default_result, durations, invested, status, image, trending);
        }
        catch (error) {
            throw new Error(`Failed to create plan: ${error.message}`);
        }
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        const { name, title, description, min_amount, max_amount, profit_percentage, min_profit, max_profit, default_profit, default_result, invested, status, image, trending, durations, } = body.plan;
        try {
            return await (0, queries_1.updatePlan)(Number(params.id), name, title, description, min_amount, max_amount, profit_percentage, min_profit, max_profit, default_profit, default_result, durations, invested, status, image, trending);
        }
        catch (error) {
            throw new Error(`Failed to update plan: ${error.message}`);
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            return await (0, queries_1.deletePlan)(Number(params.id));
        }
        catch (error) {
            throw new Error(`Failed to delete plan: ${error.message}`);
        }
    }),
};
