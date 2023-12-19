"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.listReviews)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.getReviewById)(Number(id));
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { rating, comment, status } = body;
        return (0, queries_1.updateReview)(Number(id), status, rating, comment);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.deleteReview)(Number(id));
    }),
};
