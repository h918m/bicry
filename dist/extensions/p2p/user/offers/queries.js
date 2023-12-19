"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserOffer = exports.editUserOffer = exports.createUserOffer = exports.showUserOfferUuid = exports.showUserOffer = exports.listUserOffers = exports.listOffers = void 0;
const passwords_1 = require("~~/utils/passwords");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all P2P Offers
async function listOffers() {
    return prisma_1.default.p2p_offer.findMany({
        where: { status: 'ACTIVE' },
        include: {
            user: {
                select: {
                    uuid: true,
                    first_name: true,
                    last_name: true,
                    avatar: true,
                },
            },
            payment_method: true,
            reviews: {
                select: {
                    rating: true,
                },
            },
        },
    });
}
exports.listOffers = listOffers;
// List user's P2P Offers
async function listUserOffers(userId) {
    return prisma_1.default.p2p_offer.findMany({
        where: { user_id: userId },
        include: {
            reviews: {
                select: {
                    rating: true,
                },
            },
        },
    });
}
exports.listUserOffers = listUserOffers;
// Get a single user's P2P Offer
async function showUserOffer(uuid, userId) {
    return prisma_1.default.p2p_offer.findUnique({
        where: { uuid, user_id: userId },
        include: {
            reviews: {
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    created_at: true,
                    reviewer: {
                        select: {
                            uuid: true,
                            first_name: true,
                            last_name: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
    });
}
exports.showUserOffer = showUserOffer;
async function showUserOfferUuid(uuid) {
    return prisma_1.default.p2p_offer.findUnique({
        where: { uuid },
        include: {
            trades: {
                select: {
                    status: true,
                    created_at: true,
                    updated_at: true,
                },
            },
            user: {
                select: {
                    uuid: true,
                    first_name: true,
                    last_name: true,
                    avatar: true,
                },
            },
            payment_method: true,
            reviews: {
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    created_at: true,
                    reviewer: {
                        select: {
                            uuid: true,
                            first_name: true,
                            last_name: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
    });
}
exports.showUserOfferUuid = showUserOfferUuid;
// Create a new user's P2P Offer
async function createUserOffer(userId, wallet_type, currency, amount, price, payment_method_id, min_amount, max_amount) {
    const offer = await prisma_1.default.$transaction(async (prisma) => {
        const wallet = await prisma.wallet.findFirst({
            where: { user_id: userId, type: wallet_type, currency },
        });
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        if (wallet.balance < amount) {
            throw new Error('Insufficient funds');
        }
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: wallet.balance - amount },
        });
        const createdOffer = await prisma.p2p_offer.create({
            data: {
                user_id: userId,
                wallet_type: wallet_type,
                currency,
                amount,
                price,
                payment_method_id,
                status: 'PENDING',
                min_amount,
                max_amount,
            },
        });
        await prisma.transaction.create({
            data: {
                uuid: (0, passwords_1.makeUuid)(),
                user_id: userId,
                wallet_id: wallet.id,
                amount: amount,
                description: `P2P offer ${createdOffer.uuid}`,
                status: 'COMPLETED',
                fee: 0,
                type: 'P2P_OFFER_TRANSFER',
                reference_id: createdOffer.uuid,
            },
        });
        return createdOffer;
    });
    return offer;
}
exports.createUserOffer = createUserOffer;
// edit
async function editUserOffer(uuid, userId, min_amount, max_amount) {
    return prisma_1.default.p2p_offer.update({
        where: { uuid, user_id: userId },
        data: { min_amount, max_amount },
    });
}
exports.editUserOffer = editUserOffer;
async function updateUserOffer(uuid, userId, status) {
    return prisma_1.default.p2p_offer.update({
        where: { uuid, user_id: userId },
        data: { status },
    });
}
exports.updateUserOffer = updateUserOffer;
