"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, ____, _____, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        return (0, queries_1.listUserTrades)(user.id);
    }),
    show: (0, utils_1.handleController)(async (_, __, params, ____, _____, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { uuid } = params;
        return (0, queries_1.showUserTrade)(user.id, uuid);
    }),
    store: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { offer_id, amount } = body;
        return (0, queries_1.createUserTrade)(user.id, offer_id, amount);
    }),
    sendMessage: (0, utils_1.handleController)(async (_, __, params, ____, body, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { uuid } = params;
        const { message, isSeller } = body;
        return (0, queries_1.sendMessageQuery)(user.id, uuid, message, isSeller);
    }),
    cancelTrade: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { uuid } = params;
        return (0, queries_1.cancelTradeQuery)(uuid);
    }),
    markTradeAsPaid: (0, utils_1.handleController)(async (_, __, params, ___, body, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { uuid } = params;
        const { txHash } = body;
        return (0, queries_1.markTradeAsPaidQuery)(user.id, uuid, txHash);
    }),
    disputeTrade: (0, utils_1.handleController)(async (_, __, params, ___, body, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { uuid } = params;
        const { reason } = body;
        return (0, queries_1.disputeTradeQuery)(user.id, uuid, reason);
    }),
    cancelDispute: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { uuid } = params;
        return (0, queries_1.cancelDisputeTradeQuery)(user.id, uuid);
    }),
    releaseTrade: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { uuid } = params;
        return (0, queries_1.releaseTradeQuery)(user.id, uuid);
    }),
    refundTrade: (0, utils_1.handleController)(async (_, __, params, ___, ____, user) => {
        if (!user.id)
            throw new Error('Unauthorized');
        const { uuid } = params;
        return (0, queries_1.refundTradeQuery)(user.id, uuid);
    }),
};
