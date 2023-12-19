"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    create: (0, utils_1.handleController)(async (_, __, params, ____, body, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { uuid } = params;
        const { rating, comment } = body;
        return (0, queries_1.createUserReview)(user.id, uuid, rating, comment);
    }),
};
