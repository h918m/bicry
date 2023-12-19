"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.showReview = exports.listReviews = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all P2P Reviews
async function listReviews() {
    return prisma_1.default.p2p_review.findMany();
}
exports.listReviews = listReviews;
// Get a single P2P Review
async function showReview(id) {
    return prisma_1.default.p2p_review.findUnique({
        where: { id },
    });
}
exports.showReview = showReview;
// Delete a P2P Review
async function deleteReview(id) {
    await prisma_1.default.p2p_review.delete({
        where: { id },
    });
}
exports.deleteReview = deleteReview;
