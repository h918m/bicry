"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("../../../utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            return await (0, queries_1.getInvestments)(user.id);
        }
        catch (error) {
            throw new Error(`Failed to fetch investments: ${error.message}`);
        }
    }),
    active: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            return await (0, queries_1.getUserActiveInvestments)(user.id);
        }
        catch (error) {
            throw new Error(`Failed to fetch active investments: ${error.message}`);
        }
    }),
    status: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            return await (0, queries_1.checkInvestment)(params.uuid);
        }
        catch (error) {
            throw new Error(`Failed to fetch investment: ${error.message}`);
        }
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        try {
            return await (0, queries_1.createInvestment)(user.id, body.plan_id, body.duration, parseFloat(body.amount), body.currency, body.pair);
        }
        catch (error) {
            throw new Error(`Failed to create investment: ${error.message}`);
        }
    }),
    cron: (0, utils_1.handleController)(async () => {
        try {
            await (0, queries_1.processAiInvestments)();
        }
        catch (error) {
            throw new Error(error);
        }
    }),
};
