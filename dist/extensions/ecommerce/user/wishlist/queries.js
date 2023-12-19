"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// Get the user's wishlist
async function getWishlist(userId) {
    return prisma_1.default.ecommerce_wishlist.findMany({
        where: { user_id: userId },
        include: {
            product: true,
        },
    });
}
exports.getWishlist = getWishlist;
// Add a product to the wishlist
async function addToWishlist(userId, productId) {
    return prisma_1.default.ecommerce_wishlist.create({
        data: {
            user_id: userId,
            product_id: productId,
        },
    });
}
exports.addToWishlist = addToWishlist;
// Remove a product from the wishlist
async function removeFromWishlist(userId, productId) {
    await prisma_1.default.ecommerce_wishlist.delete({
        where: {
            user_id_product_id: {
                user_id: userId,
                product_id: productId,
            },
        },
    });
}
exports.removeFromWishlist = removeFromWishlist;
