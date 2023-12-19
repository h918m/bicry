"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserReview = void 0;
const logger_1 = require("~~/logger");
const emails_1 = require("~~/utils/emails");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
const logger = (0, logger_1.createLogger)('P2PReviews');
// Create a new user's P2P Review
async function createUserReview(userId, uuid, rating, comment) {
    const offer = await prisma_1.default.p2p_offer.findUnique({
        where: { uuid },
        include: {
            user: true,
        },
    });
    if (!offer)
        throw new Error('Offer not found');
    if (offer?.user_id === userId)
        throw new Error('Unauthorized');
    const review = (await prisma_1.default.p2p_review.upsert({
        where: {
            reviewer_id_reviewed_id_offer_id: {
                reviewer_id: userId,
                reviewed_id: offer.user_id,
                offer_id: offer.id,
            },
        },
        create: {
            reviewer_id: userId,
            reviewed_id: offer.user_id,
            offer_id: offer.id,
            rating,
            comment,
        },
        update: {
            rating,
            comment,
        },
        include: {
            reviewer: {
                select: {
                    first_name: true,
                    email: true,
                },
            },
        },
    }));
    try {
        await (0, emails_1.sendP2PReviewNotificationEmail)(offer.user, review, offer);
    }
    catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
    }
    return review;
}
exports.createUserReview = createUserReview;
