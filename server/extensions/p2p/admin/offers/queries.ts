import type { P2POffer, P2POfferStatus } from '~~/types'
import prisma from '~~/utils/prisma'

// List all P2P Offers
export async function listOffers(): Promise<P2POffer[]> {
  return prisma.p2p_offer.findMany({
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
    },
  }) as unknown as P2POffer[]
}

// Get a single P2P Offer
export async function showOffer(id: number): Promise<P2POffer | null> {
  return prisma.p2p_offer.findUnique({
    where: { id },
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
    },
  }) as unknown as P2POffer | null
}

// Update a P2P Offer
export async function updateOffer(
  id: number,
  status: P2POfferStatus,
): Promise<P2POffer> {
  return prisma.p2p_offer.update({
    where: { id },
    data: { status },
  }) as unknown as P2POffer
}

// export async function createUserOffer(
//   userId: number,
//   wallet_type: WalletType,
//   currency: string,
//   amount: number,
//   price: number,
//   payment_method_id: number,
// ): Promise<P2POffer> {
//   const offer = await prisma.$transaction(async (prisma) => {
//     const wallet = await prisma.wallet.findFirst({
//       where: { user_id: userId, type: wallet_type, currency },
//     })

//     if (!wallet) {
//       throw new Error('Wallet not found')
//     }

//     if (wallet.balance < amount) {
//       throw new Error('Insufficient funds')
//     }

//     await prisma.wallet.update({
//       where: { id: wallet.id },
//       data: { balance: wallet.balance - amount },
//     })

//     const createdOffer = await prisma.p2p_offer.create({
//       data: {
//         user_id: userId,
//         wallet_type: wallet_type,
//         currency,
//         amount,
//         price,
//         payment_method_id,
//         status: 'PENDING',
//       },
//     })

//     return createdOffer
//   })

//   return offer as unknown as P2POffer
// }
// Delete a P2P Offer
export async function deleteOffer(id: number): Promise<void> {
  // revert the balance to user wallet then delete the offer
  const offer = await prisma.p2p_offer.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          uuid: true,
        },
      },
    },
  })

  if (!offer) {
    throw new Error('Offer not found')
  }

  await prisma.$transaction(async (prisma) => {
    const wallet = await prisma.wallet.findFirst({
      where: {
        user_id: offer.user_id,
        type: offer.wallet_type,
        currency: offer.currency,
      },
    })
    await prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: {
          increment: offer.amount,
        },
      },
    })
    await prisma.p2p_offer.delete({
      where: { id },
    })
  })
}
