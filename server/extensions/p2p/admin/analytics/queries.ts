import prisma from '~~/utils/prisma'

export async function getTotalP2POffers() {
  return prisma.p2p_offer.count()
}

export async function getActiveP2POffers() {
  return prisma.p2p_offer.count({
    where: {
      status: 'ACTIVE',
    },
  })
}

export async function getTotalP2PTrades() {
  return prisma.p2p_trade.count()
}

export async function getCompletedP2PTrades() {
  return prisma.p2p_trade.count({
    where: {
      status: 'COMPLETED',
    },
  })
}

export async function getTotalP2PDisputes() {
  return prisma.p2p_dispute.count()
}

export async function getResolvedP2PDisputes() {
  return prisma.p2p_dispute.count({
    where: {
      status: 'RESOLVED',
    },
  })
}
