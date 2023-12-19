"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        return (0, queries_1.getWishlist)(user.id);
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        const { product_id } = body;
        return (0, queries_1.addToWishlist)(user.id, Number(product_id));
    }),
    delete: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        const { product_id } = params;
        return (0, queries_1.removeFromWishlist)(user.id, Number(product_id));
    }),
};
