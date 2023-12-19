"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const totalP2POffers = await (0, queries_1.getTotalP2POffers)();
            const activeP2POffers = await (0, queries_1.getActiveP2POffers)();
            const totalP2PTrades = await (0, queries_1.getTotalP2PTrades)();
            const completedP2PTrades = await (0, queries_1.getCompletedP2PTrades)();
            const totalP2PDisputes = await (0, queries_1.getTotalP2PDisputes)();
            const resolvedP2PDisputes = await (0, queries_1.getResolvedP2PDisputes)();
            return {
                metrics: [
                    { metric: 'Total P2P Offers', value: totalP2POffers },
                    { metric: 'Active P2P Offers', value: activeP2POffers },
                    { metric: 'Total P2P Trades', value: totalP2PTrades },
                    { metric: 'Completed P2P Trades', value: completedP2PTrades },
                    { metric: 'Total P2P Disputes', value: totalP2PDisputes },
                    { metric: 'Resolved P2P Disputes', value: resolvedP2PDisputes },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch P2P analytics data: ${error.message}`);
        }
    }),
};
