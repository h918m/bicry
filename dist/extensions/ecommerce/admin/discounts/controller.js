"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.getDiscounts)();
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { code, percentage, valid_until, product_id } = body;
        return (0, queries_1.createDiscount)(code, percentage, new Date(valid_until), product_id);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { code, percentage, valid_until, product_id, status } = body;
        return (0, queries_1.updateDiscount)(id, code, percentage, new Date(valid_until), product_id, status);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.deleteDiscount)(id);
    }),
};
