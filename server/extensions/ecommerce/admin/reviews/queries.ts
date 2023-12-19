import type { EcommerceReview, EcommerceReviewStatus } from '~~/types'
import prisma from '~~/utils/prisma'

// List all reviews
export async function listReviews(): Promise<EcommerceReview[]> {
  return prisma.ecommerce_review.findMany({
    include: {
      product: true,
      user: true,
    },
  }) as unknown as EcommerceReview[]
}

// Get a single review by ID
export async function getReviewById(
  id: number,
): Promise<EcommerceReview | null> {
  return prisma.ecommerce_review.findUnique({
    where: { id },
    include: {
      product: true,
      user: true,
    },
  }) as unknown as EcommerceReview | null
}

// Update a review
export async function updateReview(
  id: number,
  status: EcommerceReviewStatus,
  rating: number,
  comment?: string,
): Promise<EcommerceReview> {
  return prisma.ecommerce_review.update({
    where: { id },
    data: {
      rating,
      comment,
      status,
    },
  }) as unknown as EcommerceReview
}

// Delete a review
export async function deleteReview(id: number): Promise<void> {
  await prisma.ecommerce_review.delete({
    where: { id },
  })
}
