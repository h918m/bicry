"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        return (0, queries_1.listUserDisputes)(user.id);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        const { id } = params;
        return (0, queries_1.showUserDispute)(Number(id), user.id);
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        const { trade_id, reason } = body;
        return (0, queries_1.createUserDispute)(user.id, trade_id, reason);
    }),
};
