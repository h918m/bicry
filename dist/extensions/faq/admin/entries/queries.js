"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFaq = exports.updateFaq = exports.createFaq = exports.getFaqById = exports.listFaqs = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all FAQs
async function listFaqs() {
    return prisma_1.default.faq.findMany({
        include: {
            category: true, // Ensure to include the category details
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
// Create a new FAQ
async function createFaq(question, answer, faq_category_id) {
    return prisma_1.default.faq.create({
        data: {
            question,
            answer,
            faq_category_id,
        },
    });
}
exports.createFaq = createFaq;
// Update an existing FAQ
async function updateFaq(id, question, answer) {
    return prisma_1.default.faq.update({
        where: { id },
        data: {
            question,
            answer,
        },
    });
}
exports.updateFaq = updateFaq;
// Delete an FAQ
async function deleteFaq(id) {
    return prisma_1.default.faq.delete({
        where: { id },
    });
}
exports.deleteFaq = deleteFaq;
