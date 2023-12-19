"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        try {
            return await (0, queries_1.getInvestments)();
        }
        catch (error) {
            throw new Error(`Failed to fetch investments: ${error.message}`);
        }
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            return await (0, queries_1.getInvestment)(params.uuid);
        }
        catch (error) {
            throw new Error(`Failed to fetch investment: ${error.message}`);
        }
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ___, body) => {
        try {
            const updatedInvestment = await (0, queries_1.updateInvestment)(params.uuid, body.profit, body.result);
            return updatedInvestment;
        }
        catch (error) {
            throw new Error(`Failed to update investment: ${error.message}`);
        }
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        try {
            const deletedInvestment = await (0, queries_1.deleteInvestment)(Number(params.id));
            return deletedInvestment;
        }
        catch (error) {
            throw new Error(`Failed to delete investment: ${error.message}`);
        }
    }),
};
