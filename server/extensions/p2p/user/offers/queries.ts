import type { P2POffer, P2POfferStatus, WalletType } from '~~/types'
import { makeUuid } from '~~/utils/passwords'
import prisma from '~~/utils/prisma'

// List all P2P Offers
export async function listOffers(): Promise<P2POffer[]> {
  return prisma.p2p_offer.findMany({
    where: { status: 'ACTIVE' },
    include: {
      user: {
        select: {
          uuid: true,
          first_name: true,
          last_name: true,
          avatar: true,
        },
      },
      payment_method: true,
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  }) as unknown as P2POffer[]
}

// List user's P2P Offers
export async function listUserOffers(userId: number): Promise<P2POffer[]> {
  return prisma.p2p_offer.findMany({
    where: { user_id: userId },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  }) as unknown as P2POffer[]
}

// Get a single user's P2P Offer
export async function showUserOffer(
  uuid: string,
  userId: number,
): Promise<P2POffer | null> {
  return prisma.p2p_offer.findUnique({
    where: { uuid, user_id: userId },
    include: {
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          created_at: true,
          reviewer: {
            select: {
              uuid: true,
              first_name: true,
              last_name: true,
              avatar: true,
            },
          },
        },
      },
    },
  }) as unknown as P2POffer | null
}

export async function showUserOfferUuid(
  uuid: string,
): Promise<P2POffer | null> {
  return prisma.p2p_offer.findUnique({
    where: { uuid },
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
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          created_at: true,
          reviewer: {
            select: {
              uuid: true,
              first_name: true,
              last_name: true,
              avatar: true,
            },
          },
        },
      },
    },
  }) as unknown as P2POffer | null
}

// Create a new user's P2P Offer
export async function createUserOffer(
  userId: number,
  wallet_type: WalletType,
  currency: string,
  amount: number,
  price: number,
  payment_method_id: number,
  min_amount: number,
  max_amount: number,
): Promise<P2POffer> {
  const offer = await prisma.$transaction(async (prisma) => {
    const wallet = await prisma.wallet.findFirst({
      where: { user_id: userId, type: wallet_type, currency },
    })

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient funds')
    }

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance - amount },
    })

    const createdOffer = await prisma.p2p_offer.create({
      data: {
        user_id: userId,
        wallet_type: wallet_type,
        currency,
        amount,
        price,
        payment_method_id,
        status: 'PENDING',
        min_amount,
        max_amount,
      },
    })

    await prisma.transaction.create({
      data: {
        uuid: makeUuid(),
        user_id: userId,
        wallet_id: wallet.id,
        amount: amount,
        description: `P2P offer ${createdOffer.uuid}`,
        status: 'COMPLETED',
        fee: 0,
        type: 'P2P_OFFER_TRANSFER',
        reference_id: createdOffer.uuid,
      },
    })

    return createdOffer
  })

  return offer as unknown as P2POffer
}

// edit
export async function editUserOffer(
  uuid: string,
  userId: number,
  min_amount: number,
  max_amount: number,
): Promise<P2POffer> {
  return prisma.p2p_offer.update({
    where: { uuid, user_id: userId },
    data: { min_amount, max_amount },
  }) as unknown as P2POffer
}

export async function updateUserOffer(
  uuid: string,
  userId: number,
  status: P2POfferStatus,
): Promise<P2POffer> {
  return prisma.p2p_offer.update({
    where: { uuid, user_id: userId },
    data: { status },
  }) as unknown as P2POffer
}
