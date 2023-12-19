import type { P2PReview } from '~~/types'
import prisma from '~~/utils/prisma'

// List all P2P Reviews
export async function listReviews(): Promise<P2PReview[]> {
  return prisma.p2p_review.findMany() as unknown as P2PReview[]
}

// Get a single P2P Review
export async function showReview(id: number): Promise<P2PReview | null> {
  return prisma.p2p_review.findUnique({
    where: { id },
  }) as unknown as P2PReview | null
}

// Delete a P2P Review
export async function deleteReview(id: number): Promise<void> {
  await prisma.p2p_review.delete({
    where: { id },
  })
}
