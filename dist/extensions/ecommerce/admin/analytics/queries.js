"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompletedEcommerceOrders = exports.getTotalEcommerceOrders = exports.getActiveEcommerceProducts = exports.getTotalEcommerceProducts = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getTotalEcommerceProducts() {
    return prisma_1.default.ecommerce_product.count();
}
exports.getTotalEcommerceProducts = getTotalEcommerceProducts;
async function getActiveEcommerceProducts() {
    return prisma_1.default.ecommerce_product.count({
        where: {
            status: 'ACTIVE',
        },
    });
}
exports.getActiveEcommerceProducts = getActiveEcommerceProducts;
async function getTotalEcommerceOrders() {
    return prisma_1.default.ecommerce_order.count();
}
exports.getTotalEcommerceOrders = getTotalEcommerceOrders;
async function getCompletedEcommerceOrders() {
    return prisma_1.default.ecommerce_order.count({
        where: {
            status: 'COMPLETED', // or whatever status indicates a completed order in your system
        },
    });
}
exports.getCompletedEcommerceOrders = getCompletedEcommerceOrders;
