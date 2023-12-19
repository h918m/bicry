"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFaqsPerCategory = exports.getTotalFaqs = exports.getTotalFaqCategories = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function getTotalFaqCategories() {
    return await prisma_1.default.faq_category.count();
}
exports.getTotalFaqCategories = getTotalFaqCategories;
async function getTotalFaqs() {
    return await prisma_1.default.faq.count();
}
exports.getTotalFaqs = getTotalFaqs;
async function getFaqsPerCategory() {
    return await prisma_1.default.faq_category.findMany({
        select: {
            identifier: true,
            _count: {
                select: {
                    faqs: true,
                },
            },
        },
    });
}
exports.getFaqsPerCategory = getFaqsPerCategory;
