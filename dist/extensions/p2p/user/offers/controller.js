"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        return (0, queries_1.listOffers)();
    }),
    userOffers: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        return (0, queries_1.listUserOffers)(user.id);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { uuid } = params;
        return (0, queries_1.showUserOffer)(uuid, user.id);
    }),
    showUuid: (0, utils_1.handleController)(async (_, __, params) => {
        const { uuid } = params;
        return (0, queries_1.showUserOfferUuid)(uuid);
    }),
    create: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { wallet_type, currency, amount, price, payment_method_id, min_amount, max_amount, } = body;
        return (0, queries_1.createUserOffer)(user.id, wallet_type, currency, amount, price, payment_method_id, min_amount, max_amount);
    }),
    edit: (0, utils_1.handleController)(async (_, __, params, ____, body, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { uuid } = params;
        const { min_amount, max_amount } = body;
        return (0, queries_1.editUserOffer)(uuid, user.id, min_amount, max_amount);
    }),
    update: (0, utils_1.handleController)(async (_, __, params, ____, body, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { uuid } = params;
        const { status } = body;
        return (0, queries_1.updateUserOffer)(uuid, user.id, status);
    }),
};
