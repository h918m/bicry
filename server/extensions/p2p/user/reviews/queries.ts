import { createLogger } from '~~/logger'
import type { P2PReview } from '~~/types'
import { sendP2PReviewNotificationEmail } from '~~/utils/emails'
import prisma from '~~/utils/prisma'
const logger = createLogger('P2PReviews')

// Create a new user's P2P Review
export async function createUserReview(
  userId: number,
  uuid: string,
  rating: number,
  comment: string,
): Promise<P2PReview> {
  const offer = await prisma.p2p_offer.findUnique({
    where: { uuid },
    include: {
      user: true,
    },
  })
  if (!offer) throw new Error('Offer not found')
  if (offer?.user_id === userId) throw new Error('Unauthorized')

  const review = (await prisma.p2p_review.upsert({
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
  })) as unknown as P2PReview

  try {
    await sendP2PReviewNotificationEmail(offer.user, review, offer)
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`)
  }
  return review
}
