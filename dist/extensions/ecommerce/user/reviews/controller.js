"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    create: (0, utils_1.handleController)(async (_, __, params, ___, body, user) => {
        const { product_id } = params;
        const { rating, comment } = body;
        const user_id = user.id;
        return (0, queries_1.createReview)({
            product_id: Number(product_id),
            user_id,
            rating,
            comment,
        });
    }),
};
