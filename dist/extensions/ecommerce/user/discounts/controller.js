"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    apply: (0, utils_1.handleController)(async (_, __, params, ___, body, user) => {
        return (0, queries_1.applyDiscount)(user.id, params.product_id, body.code);
    }),
};
