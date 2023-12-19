import { createLogger } from '~~/logger'
import type { P2PDispute } from '~~/types' // Assuming you have a P2PDispute type
import { sendP2PDisputeOpenedEmail } from '~~/utils/emails'
import prisma from '~~/utils/prisma'
const logger = createLogger('P2PDisputes')

// List all disputes created by a specific user
export async function listUserDisputes(userId: number): Promise<P2PDispute[]> {
  return prisma.p2p_dispute.findMany({
    where: { raised_by_id: userId },
  }) as unknown as P2PDispute[]
}

// Show a specific dispute created by a user
export async function showUserDispute(
  id: number,
  userId: number,
): Promise<P2PDispute | null> {
  return prisma.p2p_dispute.findFirst({
    where: { id, raised_by_id: userId },
  }) as unknown as P2PDispute | null
}

// Create a new dispute for a user
export async function createUserDispute(
  userId: number,
  tradeId: number,
  reason: string,
): Promise<P2PDispute> {
  const dispute = (await prisma.p2p_dispute.create({
    data: {
      trade_id: tradeId,
      raised_by_id: userId,
      reason: reason,
      status: 'PENDING',
    },
    include: {
      raised_by: {
        select: {
          email: true,
          first_name: true,
        },
      },
      trade: true,
    },
  })) as unknown as P2PDispute

  try {
    const disputedId =
      dispute.trade?.user_id === userId
        ? dispute.trade?.seller_id
        : dispute.trade?.user_id
    const disputed = await prisma.user.findUnique({
      where: { id: disputedId },
    })
    console.log(disputed)

    await sendP2PDisputeOpenedEmail(
      disputed,
      dispute.raised_by,
      dispute.trade,
      reason,
    )
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`)
  }
  return dispute
}
