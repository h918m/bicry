import * as path from 'path'
import { generateWalletAddressQuery } from '~~/http/wallets/spot/controller'
import { createWalletQuery } from '~~/http/wallets/spot/queries'
import { createLogger } from '~~/logger'
import type { P2PTrade } from '~~/types'
import { P2PTradeStatus } from '~~/types'
import { makeUuid } from '~~/utils/passwords'
import prisma from '~~/utils/prisma'
const logger = createLogger('P2PAdminTrades')

// List all P2P Trades
export async function listTrades(): Promise<P2PTrade[]> {
  return prisma.p2p_trade.findMany({
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
      disputes: {
        select: {
          reason: true,
          status: true,
          resolution: true,
          raised_by: {
            select: {
              uuid: true,
            },
          },
        },
      },
    },
  }) as unknown as P2PTrade[]
}

// Get a single P2P Trade
export async function showTrade(id: number): Promise<P2PTrade | null> {
  return prisma.p2p_trade.findUnique({
    where: { id },
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
      disputes: {
        select: {
          reason: true,
          status: true,
          resolution: true,
          raised_by: {
            select: {
              uuid: true,
            },
          },
        },
      },
    },
  }) as unknown as P2PTrade | null
}

// Update a P2P Trade
export async function updateTrade(
  id: number,
  status: P2PTradeStatus,
): Promise<P2PTrade> {
  return prisma.p2p_trade.update({
    where: { id },
    data: { status },
  }) as unknown as P2PTrade
}

// Cancel a P2P Trade
export async function cancelTrade(id: number): Promise<P2PTrade> {
  const trade = await prisma.p2p_trade.findUnique({
    where: { id },
    include: {
      offer: true,
    },
  })
  if (!trade) {
    throw new Error('Trade not found')
  }

  const updatedOffer = await prisma.$transaction(async (prisma) => {
    await prisma.p2p_offer.update({
      where: { id: trade.offer.id },
      data: {
        amount: trade.offer.amount + trade.amount,
        in_order: trade.offer.in_order - trade.amount,
      },
    })
    await prisma.p2p_dispute.updateMany({
      where: {
        trade_id: trade.id,
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
      data: { status: 'RESOLVED' },
    })
    return prisma.p2p_trade.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    })
  })

  return updatedOffer as unknown as P2PTrade
}

// Complete a P2P Trade
export async function completeTrade(id: number): Promise<P2PTrade> {
  const trade = await prisma.p2p_trade.findUnique({
    where: { id },
    include: { offer: true },
  })
  if (!trade) throw new Error('Trade not found')

  if (!['PAID', 'DISPUTE_OPEN'].includes(trade.status))
    throw new Error('Trade can only be released if it is paid')

  const user = await prisma.user.findUnique({ where: { id: trade.user_id } })
  if (!user) throw new Error('User not found')

  let wallet = await prisma.wallet.findFirst({
    where: {
      user_id: user.id,
      type: trade.offer.wallet_type,
      currency: trade.offer.currency,
    },
  })
  if (!wallet) {
    if (trade.offer.wallet_type === 'FIAT') {
      wallet = await prisma.wallet.create({
        data: {
          user_id: user.id,
          type: 'FIAT',
          currency: trade.offer.currency,
        },
      })
    } else if (trade.offer.wallet_type === 'SPOT') {
      let addresses
      try {
        addresses = await generateWalletAddressQuery(trade.offer.currency)
      } catch (error) {
        logger.error(`Failed to generate wallet address: ${error.message}`)
        throw new Error(
          'Failed to generate wallet address, please contact support',
        )
      }

      if (!addresses || !Object.keys(addresses).length) {
        logger.error(`Failed to generate wallet address`, addresses)
        throw new Error('Failed to generate wallet address, please try again')
      }

      wallet = await createWalletQuery(user.id, trade.offer.currency, addresses)
    } else if (trade.offer.wallet_type === 'ECO') {
      let storeWallet
      try {
        const isProduction = process.env.NODE_ENV === 'production'
        const fileExtension = isProduction ? '.js' : '.ts'
        const baseUrl = path.join(
          process.cwd(),
          isProduction ? '/dist' : '/server',
        )
        const walletModule = await import(
          `${baseUrl}/extensions/ecosystem/user/wallets/controller${fileExtension}`
        )
        storeWallet = walletModule.storeWallet
      } catch (error) {
        logger.error(`Failed to import storeWallet: ${error.message}`)
        throw new Error(
          'Failed to import storeWallet function, please contact support',
        )
      }

      wallet = await storeWallet(user.id, trade.offer.currency)
    }
  }

  if (!wallet) throw new Error('Buyer wallet not found')

  let commission = 0
  const commissionPercentage = await prisma.settings.findFirst({
    where: { key: 'p2p_trade_commission' },
  })
  if (
    commissionPercentage &&
    commissionPercentage.value &&
    Number(commissionPercentage.value) !== 0
  ) {
    commission = (trade.amount * Number(commissionPercentage.value)) / 100
  }
  const balance = wallet.balance + trade.amount - commission
  const commissionedAmount = trade.amount - commission
  return prisma.$transaction(async (prisma) => {
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: balance },
    })

    if (commission > 0) {
      await prisma.p2p_commission.create({
        data: {
          trade_id: trade.id,
          amount: commission,
        },
      })
    }

    // Close all disputes associated with the trade
    await prisma.p2p_dispute.updateMany({
      where: {
        trade_id: trade.id,
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
      data: { status: 'RESOLVED' },
    })

    await prisma.p2p_offer.update({
      where: { id: trade.offer_id },
      data: {
        in_order: trade.offer.in_order - trade.amount,
      },
    })

    await prisma.transaction.create({
      data: {
        uuid: makeUuid(),
        user_id: user.id,
        wallet_id: wallet.id,
        amount: commissionedAmount,
        description: `P2P trade ${trade.uuid} release`,
        status: 'COMPLETED',
        fee: commission,
        type: 'P2P_TRADE',
        reference_id: trade.uuid,
      },
    })

    return prisma.p2p_trade.update({
      where: { id: trade.id },
      data: { status: P2PTradeStatus.COMPLETED },
    }) as unknown as P2PTrade
  })
}
