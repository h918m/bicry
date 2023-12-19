"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.getReviewById = exports.listReviews = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all reviews
async function listReviews() {
    return prisma_1.default.ecommerce_review.findMany({
        include: {
            product: true,
            user: true,
        },
    });
}
exports.listReviews = listReviews;
// Get a single review by ID
async function getReviewById(id) {
    return prisma_1.default.ecommerce_review.findUnique({
        where: { id },
        include: {
            product: true,
            user: true,
        },
    });
}
exports.getReviewById = getReviewById;
// Update a review
async function updateReview(id, status, rating, comment) {
    return prisma_1.default.ecommerce_review.update({
        where: { id },
        data: {
            rating,
            comment,
            status,
        },
    });
}
exports.updateReview = updateReview;
// Delete a review
async function deleteReview(id) {
    await prisma_1.default.ecommerce_review.delete({
        where: { id },
    });
}
exports.deleteReview = deleteReview;
