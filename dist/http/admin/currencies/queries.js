"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCurrency = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function updateCurrency(ids, status) {
    await prisma_1.default.currency.updateMany({
        where: {
            id: {
                in: ids,
            },
        },
        data: {
            status: status,
        },
    });
}
exports.updateCurrency = updateCurrency;
