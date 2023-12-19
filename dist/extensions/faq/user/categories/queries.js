"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryByIdentifier = exports.listCategories = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all FAQ categories
async function listCategories() {
    return prisma_1.default.faq_category.findMany({
        include: {
            faqs: true,
        },
    });
}
exports.listCategories = listCategories;
// Get a single FAQ category by its identifier
async function getCategoryByIdentifier(identifier) {
    return prisma_1.default.faq_category.findUnique({
        where: { identifier },
        include: {
            faqs: true, // Include the FAQs related to this category
        },
    });
}
exports.getCategoryByIdentifier = getCategoryByIdentifier;
