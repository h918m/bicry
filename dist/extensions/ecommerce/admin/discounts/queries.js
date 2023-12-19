"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDiscount = exports.updateDiscount = exports.createDiscount = exports.listDiscountsByProductId = exports.getDiscounts = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all discounts
async function getDiscounts() {
    return prisma_1.default.ecommerce_discount.findMany({
        include: { product: true },
    });
}
exports.getDiscounts = getDiscounts;
// List discounts for a product
async function listDiscountsByProductId(product_id) {
    return prisma_1.default.ecommerce_discount.findMany({
        where: { product_id },
        include: { product: true },
    });
}
exports.listDiscountsByProductId = listDiscountsByProductId;
// Create a discount
async function createDiscount(code, percentage, valid_until, product_id) {
    return prisma_1.default.ecommerce_discount.create({
        data: {
            code,
            percentage,
            valid_until,
            product_id,
            status: 'ACTIVE',
        },
    });
}
exports.createDiscount = createDiscount;
// Update a discount
async function updateDiscount(id, code, percentage, valid_until, product_id, status) {
    return prisma_1.default.ecommerce_discount.update({
        where: { id },
        data: {
            code,
            percentage,
            valid_until,
            product_id,
            status,
        },
    });
}
exports.updateDiscount = updateDiscount;
// Delete a discount
async function deleteDiscount(id) {
    await prisma_1.default.ecommerce_discount.delete({
        where: { id },
    });
}
exports.deleteDiscount = deleteDiscount;
