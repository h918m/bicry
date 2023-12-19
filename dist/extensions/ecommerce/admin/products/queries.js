"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.listProducts = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all products
async function listProducts() {
    return prisma_1.default.ecommerce_product.findMany({
        include: {
            category: true,
            reviews: true,
            order_items: true,
            discounts: true,
        },
    });
}
exports.listProducts = listProducts;
// Get product details by ID
async function getProductById(id) {
    return prisma_1.default.ecommerce_product.findUnique({
        where: { id },
        include: {
            category: true,
            reviews: true,
            order_items: true,
            discounts: true,
        },
    });
}
exports.getProductById = getProductById;
// Create a new product
async function createProduct(name, description, type, price, currency, wallet_type, category_id, inventory_quantity, file_path, image) {
    return prisma_1.default.ecommerce_product.create({
        data: {
            name,
            description,
            type,
            price,
            currency,
            wallet_type,
            category_id,
            inventory_quantity,
            file_path,
            status: 'ACTIVE',
            image,
        },
    });
}
exports.createProduct = createProduct;
// Update a product
async function updateProduct(id, name, description, type, price, currency, wallet_type, category_id, inventory_quantity, file_path, status, image) {
    return prisma_1.default.ecommerce_product.update({
        where: { id },
        data: {
            name,
            description,
            type,
            price,
            currency,
            wallet_type,
            category_id,
            inventory_quantity,
            file_path,
            status,
            image,
        },
    });
}
exports.updateProduct = updateProduct;
// Delete a product
async function deleteProduct(id) {
    await prisma_1.default.ecommerce_product.delete({
        where: { id },
    });
}
exports.deleteProduct = deleteProduct;
