"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async () => {
        return (0, queries_1.listDisputes)();
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.showDispute)(Number(id));
    }),
    resolve: (0, utils_1.handleController)(async (_, __, params, ____, body) => {
        const { id } = params;
        const { resolution } = body;
        return (0, queries_1.resolveDispute)(Number(id), resolution);
    }),
    markAsResolved: (0, utils_1.handleController)(async (_, __, params) => {
        const { id } = params;
        return (0, queries_1.markAsResolvedQuery)(Number(id));
    }),
};
