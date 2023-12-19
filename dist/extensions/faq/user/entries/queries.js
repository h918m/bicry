"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFaqById = exports.listFaqs = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all FAQs
async function listFaqs() {
    return prisma_1.default.faq.findMany({
        include: {
            category: true, // Include the category details
        },
    });
}
exports.listFaqs = listFaqs;
// Get a single FAQ by ID
async function getFaqById(id) {
    return prisma_1.default.faq.findUnique({
        where: { id },
        include: {
            category: true,
        },
    });
}
exports.getFaqById = getFaqById;
