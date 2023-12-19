"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryById = exports.listCategories = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all categories with their active products
async function listCategories() {
    return prisma_1.default.ecommerce_category.findMany({
        include: {
            products: {
                where: {
                    status: 'ACTIVE',
                },
                orderBy: {
                    name: 'asc',
                },
                include: {
                    reviews: {
                        include: {
                            user: {
                                select: {
                                    uuid: true,
                                    first_name: true,
                                    last_name: true,
                                    avatar: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
}
exports.listCategories = listCategories;
// Get a single category by ID with its active products
async function getCategoryById(id) {
    return prisma_1.default.ecommerce_category.findUnique({
        where: { id },
        include: {
            products: {
                where: {
                    status: 'ACTIVE',
                },
                orderBy: {
                    name: 'asc',
                },
                include: {
                    reviews: {
                        include: {
                            user: {
                                select: {
                                    uuid: true,
                                    first_name: true,
                                    last_name: true,
                                    avatar: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
}
exports.getCategoryById = getCategoryById;
