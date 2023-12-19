"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const totalEcommerceProducts = await (0, queries_1.getTotalEcommerceProducts)();
            const activeEcommerceProducts = await (0, queries_1.getActiveEcommerceProducts)();
            const totalEcommerceOrders = await (0, queries_1.getTotalEcommerceOrders)();
            const completedEcommerceOrders = await (0, queries_1.getCompletedEcommerceOrders)();
            return {
                metrics: [
                    { metric: 'Total Products', value: totalEcommerceProducts },
                    {
                        metric: 'Active Products',
                        value: activeEcommerceProducts,
                    },
                    { metric: 'Total Orders', value: totalEcommerceOrders },
                    {
                        metric: 'Completed Orders',
                        value: completedEcommerceOrders,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch ecommerce analytics data: ${error.message}`);
        }
    }),
};
