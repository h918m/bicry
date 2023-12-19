"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const totalAIPlans = await (0, queries_1.getTotalAIPlans)();
            const activeAIPlans = await (0, queries_1.getActiveAIPlans)();
            const totalAITrades = await (0, queries_1.getTotalAITrades)();
            const activeAITrades = await (0, queries_1.getActiveAITrades)();
            const completedAITrades = await (0, queries_1.getCompletedAITrades)();
            const totalInvested = await (0, queries_1.getTotalInvestedInAITrading)();
            const totalProfit = await (0, queries_1.getTotalProfitFromAITrading)();
            return {
                metrics: [
                    { metric: 'Total AI Trading Plans', value: totalAIPlans },
                    { metric: 'Active AI Trading Plans', value: activeAIPlans },
                    { metric: 'Total AI Trades', value: totalAITrades },
                    { metric: 'Active AI Trades', value: activeAITrades },
                    { metric: 'Completed AI Trades', value: completedAITrades },
                    { metric: 'Total Invested in AI Trading', value: totalInvested },
                    { metric: 'Total Profit from AI Trading', value: totalProfit },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch AI Trading analytics data: ${error.message}`);
        }
    }),
};
