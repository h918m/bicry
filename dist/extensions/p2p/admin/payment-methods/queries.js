"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentMethod = exports.updatePaymentMethod = exports.listPaymentMethods = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all P2P Payment Methods
async function listPaymentMethods() {
    return prisma_1.default.p2p_payment_method.findMany({
        include: {
            user: {
                select: {
                    first_name: true,
                    last_name: true,
                    uuid: true,
                    avatar: true,
                },
            },
            offer: {
                select: {
                    uuid: true,
                },
            },
        },
    });
}
exports.listPaymentMethods = listPaymentMethods;
// Update a P2P Payment Method
async function updatePaymentMethod(id, name, instructions, status, currency, image) {
    return prisma_1.default.p2p_payment_method.update({
        where: { id },
        data: { name, instructions, status, currency, image },
    });
}
exports.updatePaymentMethod = updatePaymentMethod;
// Delete a P2P Payment Method
async function deletePaymentMethod(id) {
    await prisma_1.default.p2p_payment_method.delete({
        where: { id },
    });
}
exports.deletePaymentMethod = deletePaymentMethod;
