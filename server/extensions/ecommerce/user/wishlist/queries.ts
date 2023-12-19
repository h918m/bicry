import type { EcommerceWishlist } from '~~/types'
import prisma from '~~/utils/prisma'

// Get the user's wishlist
export async function getWishlist(
  userId: number,
): Promise<EcommerceWishlist[]> {
  return prisma.ecommerce_wishlist.findMany({
    where: { user_id: userId },
    include: {
      product: true,
    },
  }) as unknown as EcommerceWishlist[]
}

// Add a product to the wishlist
export async function addToWishlist(
  userId: number,
  productId: number,
): Promise<EcommerceWishlist> {
  return prisma.ecommerce_wishlist.create({
    data: {
      user_id: userId,
      product_id: productId,
    },
  }) as unknown as EcommerceWishlist
}

// Remove a product from the wishlist
export async function removeFromWishlist(
  userId: number,
  productId: number,
): Promise<void> {
  await prisma.ecommerce_wishlist.delete({
    where: {
      user_id_product_id: {
        user_id: userId,
        product_id: productId,
      },
    },
  })
}
