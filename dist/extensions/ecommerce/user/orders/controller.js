"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (user) => {
        // Assuming the user is extracted from the session or token
        return (0, queries_1.listOrders)(user.id);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        const { id } = params;
        return (0, queries_1.getOrderById)(user.id, Number(id)); // Assuming that we should check the order belongs to the user
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        const { product_ids, quantities } = body;
        return (0, queries_1.createOrder)(user.id, product_ids, quantities); // Assuming the user is extracted from the session or token
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        const { product_id, discount_id } = body;
        return (0, queries_1.createSingleOrder)(user.id, product_id, discount_id);
    }),
};
