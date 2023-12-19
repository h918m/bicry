"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.listCategories = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all categories
async function listCategories() {
    return prisma_1.default.ecommerce_category.findMany({
        include: {
            products: true,
        },
    });
}
exports.listCategories = listCategories;
// Create a new category
async function createCategory(name, description, image) {
    return prisma_1.default.ecommerce_category.create({
        data: { name, description, status: 'ACTIVE', image },
    });
}
exports.createCategory = createCategory;
// Update a category
async function updateCategory(id, name, description, status, image) {
    return prisma_1.default.ecommerce_category.update({
        where: { id },
        data: { name, description, status, image },
    });
}
exports.updateCategory = updateCategory;
// Delete a category
async function deleteCategory(id) {
    await prisma_1.default.ecommerce_category.delete({
        where: { id },
    });
}
exports.deleteCategory = deleteCategory;
