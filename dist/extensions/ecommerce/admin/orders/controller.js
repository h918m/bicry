"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.listAllOrders)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.getOrderDetailsById)(Number(id));
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { status } = body;
        return (0, queries_1.updateOrder)(Number(id), status);
    }),
    updateItem: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { key } = body;
        return (0, queries_1.updateOrderItem)(Number(id), key);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.removeOrder)(Number(id));
    }),
};
