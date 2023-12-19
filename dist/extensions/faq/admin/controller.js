"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        try {
            const totalFaqCategories = await (0, queries_1.getTotalFaqCategories)();
            const totalFaqs = await (0, queries_1.getTotalFaqs)();
            return {
                metrics: [
                    { metric: 'Total FAQ Categories', value: totalFaqCategories },
                    { metric: 'Total FAQs', value: totalFaqs },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch FAQ analytics data: ${error.message}`);
        }
    }),
};
