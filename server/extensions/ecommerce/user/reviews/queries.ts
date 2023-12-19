import type { EcommerceReview } from '~~/types'
import prisma from '~~/utils/prisma'

export async function createReview(data: {
  product_id: number
  user_id: number
  rating: number
  comment?: string
}): Promise<{ review: EcommerceReview | null; message: string }> {
  // Check if the user has purchased the product
  const userHasPurchased = await prisma.ecommerce_order.findFirst({
    where: {
      user_id: data.user_id,
      order_items: {
        some: {
          product_id: data.product_id,
        },
      },
      status: 'COMPLETED',
    },
  })

  if (!userHasPurchased) {
    throw new Error('You have not purchased this product')
  }

  // Check if a review already exists
  const existingReview = await prisma.ecommerce_review.findUnique({
    where: {
      product_id_user_id: {
        product_id: data.product_id,
        user_id: data.user_id,
      },
    },
  })

  const isUpdating = Boolean(existingReview)
  const action = isUpdating ? 'updated' : 'created'

  // Create or update the review
  const review = (await prisma.ecommerce_review.upsert({
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
  })) as unknown as EcommerceReview

  return {
    review,
    message: `Review successfully ${action}.`,
  }
}
