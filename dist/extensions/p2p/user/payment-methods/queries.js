"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserPaymentMethod = exports.updateUserPaymentMethod = exports.createUserPaymentMethod = exports.showUserPaymentMethod = exports.listUserPaymentMethods = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List user's payment methods
async function listUserPaymentMethods(userId) {
    return prisma_1.default.p2p_payment_method.findMany({
        where: { user_id: userId },
    });
}
exports.listUserPaymentMethods = listUserPaymentMethods;
// Get a single user's payment method
async function showUserPaymentMethod(id, userId) {
    return prisma_1.default.p2p_payment_method.findFirst({
        where: { id, user_id: userId },
    });
}
exports.showUserPaymentMethod = showUserPaymentMethod;
// Create a new user's payment method
async function createUserPaymentMethod(userId, name, instructions, currency, image) {
    return prisma_1.default.p2p_payment_method.create({
        data: {
            user_id: userId,
            name,
            instructions,
            image,
            currency,
            status: true,
        },
    });
}
exports.createUserPaymentMethod = createUserPaymentMethod;
async function updateUserPaymentMethod(id, userId, name, instructions, currency, image) {
    return prisma_1.default.p2p_payment_method.update({
        where: { id, user_id: userId },
        data: {
            name,
            instructions,
            image,
            currency,
        },
    });
}
exports.updateUserPaymentMethod = updateUserPaymentMethod;
// Delete a user's payment method
async function deleteUserPaymentMethod(id, userId) {
    const method = await prisma_1.default.p2p_payment_method.findFirst({
        where: { id, user_id: userId },
        include: { offer: true },
    });
    if (method?.offer.length) {
        throw new Error('Cannot delete payment method because it is in use by an offer');
    }
    return prisma_1.default.p2p_payment_method.delete({
        where: { id, user_id: userId },
    });
}
exports.deleteUserPaymentMethod = deleteUserPaymentMethod;
