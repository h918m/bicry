import { createLogger } from '~~/logger'
import type { P2PDispute } from '~~/types'
import {
  sendP2PDisputeClosingEmail,
  sendP2PDisputeResolutionEmail,
  sendP2PDisputeResolvingEmail,
} from '~~/utils/emails'
import prisma from '~~/utils/prisma'
const logger = createLogger('P2PAdminDisputes')

// List all P2P Offer Disputes
export async function listDisputes(): Promise<P2PDispute[]> {
  return prisma.p2p_dispute.findMany({
    include: {
      raised_by: {
        select: {
          first_name: true,
          last_name: true,
          uuid: true,
          avatar: true,
        },
      },
      trade: {
        include: {
          offer: {
            include: {
              payment_method: true,
            },
          },
        },
      },
    },
  }) as unknown as P2PDispute[]
}

// Get a single P2P Offer Dispute
export async function showDispute(id: number): Promise<P2PDispute | null> {
  return prisma.p2p_dispute.findUnique({
    where: { id },
    include: {
      raised_by: {
        select: {
          first_name: true,
          last_name: true,
          uuid: true,
          avatar: true,
        },
      },
      trade: {
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
              uuid: true,
              avatar: true,
            },
          },
          seller: {
            select: {
              first_name: true,
              last_name: true,
              uuid: true,
              avatar: true,
            },
          },
          offer: {
            select: {
              uuid: true,
              wallet_type: true,
              currency: true,
              payment_method: true,
            },
          },
        },
      },
    },
  }) as unknown as P2PDispute | null
}

// Resolve a P2P Offer Dispute
export async function resolveDispute(
  id: number,
  resolution: string,
): Promise<P2PDispute> {
  const dispute = (await prisma.p2p_dispute.update({
    where: { id },
    data: { resolution, status: 'IN_PROGRESS' },
    include: {
      raised_by: {
        select: {
          email: true,
          first_name: true,
        },
      },
      trade: {
        include: {
          user: {
            select: {
              uuid: true,
            },
          },
          seller: {
            select: {
              uuid: true,
            },
          },
        },
      },
    },
  })) as unknown as P2PDispute

  try {
    await sendP2PDisputeResolutionEmail(
      dispute.raised_by,
      dispute.trade,
      resolution,
    )
    const otherParty =
      dispute.trade.user.uuid === dispute.raised_by.uuid
        ? dispute.trade.seller
        : dispute.trade.user
    await sendP2PDisputeResolvingEmail(otherParty, dispute.trade)
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`)
  }

  return dispute
}

export async function markAsResolvedQuery(id: number): Promise<P2PDispute> {
  const dispute = await prisma.p2p_dispute.findUnique({
    where: { id },
    include: {
      trade: {
        include: {
          user: {
            select: {
              uuid: true,
              first_name: true,
              email: true,
            },
          },
          seller: {
            select: {
              uuid: true,
              first_name: true,
              email: true,
            },
          },
        },
      },
    },
  })

  if (!dispute) {
    throw new Error('Dispute not found')
  }

  if (dispute.trade.status === 'DISPUTE_OPEN') {
    await prisma.p2p_trade.update({
      where: { id: dispute.trade.id },
      data: { status: 'PAID' },
    })
  }

  const updatedDispute = (await prisma.p2p_dispute.update({
    where: { id },
    data: { status: 'RESOLVED' },
  })) as unknown as P2PDispute

  try {
    await sendP2PDisputeClosingEmail(dispute.trade.user, dispute.trade)
    await sendP2PDisputeClosingEmail(dispute.trade.seller, dispute.trade)
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`)
  }

  return updatedDispute
}
