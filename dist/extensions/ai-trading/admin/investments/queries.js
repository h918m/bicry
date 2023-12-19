"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInvestment = exports.updateInvestment = exports.getInvestment = exports.getInvestments = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// Constants for repeated query clauses
const investmentInclude = {
    // Include any related fields or entities specific to admin
    plan: true,
    duration: true,
    user: {
        select: {
            first_name: true,
            last_name: true,
            uuid: true,
            avatar: true,
        },
    },
};
async function getInvestments() {
    return (await prisma_1.default.ai_trading.findMany({
        include: investmentInclude,
    }));
}
exports.getInvestments = getInvestments;
async function getInvestment(uuid) {
    return (await prisma_1.default.ai_trading.findUnique({
        where: { uuid },
        include: investmentInclude,
    }));
}
exports.getInvestment = getInvestment;
async function updateInvestment(uuid, profit, result) {
    return (await prisma_1.default.ai_trading.update({
        where: { uuid },
        data: {
            profit,
            result,
        },
    }));
}
exports.updateInvestment = updateInvestment;
async function deleteInvestment(id) {
    await prisma_1.default.ai_trading.delete({
        where: { id },
    });
}
exports.deleteInvestment = deleteInvestment;
