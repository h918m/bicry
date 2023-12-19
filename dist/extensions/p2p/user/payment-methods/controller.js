"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        return (0, queries_1.listUserPaymentMethods)(user.id);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { id } = params;
        return (0, queries_1.showUserPaymentMethod)(Number(id), user.id);
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { name, instructions, image, currency } = body;
        return (0, queries_1.createUserPaymentMethod)(user.id, name, instructions, currency, image);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { id } = params;
        const { name, instructions, image, currency } = body;
        return (0, queries_1.updateUserPaymentMethod)(Number(id), user.id, name, instructions, currency, image);
    }),
    delete: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { id } = params;
        return (0, queries_1.deleteUserPaymentMethod)(Number(id), user.id);
    }),
};
