"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyDiscount = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function applyDiscount(user_id, product_id, code) {
    const discount = await prisma_1.default.ecommerce_discount.findFirst({
        where: {
            product_id: Number(product_id),
            code,
        },
    });
    if (!discount) {
        throw new Error('Discount not found');
    }
    if (discount.status === 'INACTIVE') {
        throw new Error('Discount is disabled');
    }
    if (discount.valid_until && discount.valid_until < new Date()) {
        throw new Error('Discount has expired');
    }
    // Check if user already has this discount
    const existingDiscount = await prisma_1.default.ecommerce_user_discount.findFirst({
        where: {
            user_id: user_id,
            discount_id: discount.id,
        },
    });
    if (existingDiscount && existingDiscount.status === 'INACTIVE') {
        throw new Error('Discount already applied');
    }
    if (existingDiscount && existingDiscount.status === 'ACTIVE') {
        return discount;
    }
    // Create a new user discount
    await prisma_1.default.ecommerce_user_discount.create({
        data: {
            user_id: user_id,
            discount_id: discount.id,
        },
    });
    return discount;
}
exports.applyDiscount = applyDiscount;
