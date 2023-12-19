"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
async function createReview(data) {
    // Check if the user has purchased the product
    const userHasPurchased = await prisma_1.default.ecommerce_order.findFirst({
        where: {
            user_id: data.user_id,
            order_items: {
                some: {
                    product_id: data.product_id,
                },
            },
            status: 'COMPLETED',
        },
    });
    if (!userHasPurchased) {
        throw new Error('You have not purchased this product');
    }
    // Check if a review already exists
    const existingReview = await prisma_1.default.ecommerce_review.findUnique({
        where: {
            product_id_user_id: {
                product_id: data.product_id,
                user_id: data.user_id,
            },
        },
    });
    const isUpdating = Boolean(existingReview);
    const action = isUpdating ? 'updated' : 'created';
    // Create or update the review
    const review = (await prisma_1.default.ecommerce_review.upsert({
        where: {
            product_id_user_id: {
                product_id: data.product_id,
                user_id: data.user_id,
            },
        },
        update: {
            rating: data.rating,
            comment: data.comment,
        },
        create: {
            ...data,
        },
    }));
    return {
        review,
        message: `Review successfully ${action}.`,
    };
}
exports.createReview = createReview;
