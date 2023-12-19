"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        const { filter, perPage, page, user, type, hideSmallBalances } = query;
        const perPageNumber = perPage ? parseInt(perPage, 10) : 10;
        const pageNumber = page ? parseInt(page, 10) : 1;
        return (0, queries_1.getWallets)(filter, perPageNumber, pageNumber, user, type, hideSmallBalances === 'true');
    }),
    show: (0, utils_1.handleController)(async (_, __, params) => {
        return (0, queries_1.getWallet)(params.uuid);
    }),
    updateBalance: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await (0, queries_1.updateWalletBalance)(body.uuid, body.type, body.amount);
            return {
                ...response,
                message: 'Wallet balance updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    updateTransactionStatus: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await (0, queries_1.updateTransactionStatusQuery)(body.referenceId, body.status, body.message);
            return {
                ...response,
                message: 'Transaction status updated successfully',
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
};
