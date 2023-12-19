"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductById = exports.listProducts = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all products
async function listProducts() {
    return prisma_1.default.ecommerce_product.findMany({
        where: {
            status: 'ACTIVE', // Assuming we only want to list active products
        },
        select: {
            id: true,
            name: true,
            description: true,
            type: true,
            price: true,
            category_id: true,
            inventory_quantity: true,
            image: true,
            currency: true,
            wallet_type: true,
            created_at: true,
            category: true,
            reviews: {
                include: {
                    user: {
                        select: {
                            uuid: true,
                            first_name: true,
                            last_name: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
    });
}
exports.listProducts = listProducts;
// Get a single product by its ID
async function getProductById(id) {
    return prisma_1.default.ecommerce_product.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            description: true,
            type: true,
            price: true,
            category_id: true,
            inventory_quantity: true,
            status: true,
            image: true,
            currency: true,
            wallet_type: true,
            created_at: true,
            updated_at: true,
            category: true,
            reviews: {
                include: {
                    user: {
                        select: {
                            uuid: true,
                            first_name: true,
                            last_name: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
    });
}
exports.getProductById = getProductById;
