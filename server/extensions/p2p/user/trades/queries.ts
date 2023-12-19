import * as path from 'path'
import { generateWalletAddressQuery } from '~~/http/wallets/spot/controller'
import { createWalletQuery } from '~~/http/wallets/spot/queries'
import { createLogger } from '~~/logger'
import { P2PTradeStatus, type Message, type P2PTrade } from '~~/types'
import { createError } from '~~/utils'
import {
  sendP2PDisputeClosingEmail,
  sendP2PDisputeOpenedEmail,
  sendP2POfferAmountDepletionEmail,
  sendP2PTradeCancellationEmail,
  sendP2PTradeCompletionEmail,
  sendP2PTradePaymentConfirmationEmail,
  sendP2PTradeReplyEmail,
  sendP2PTradeSaleConfirmationEmail,
} from '~~/utils/emails'
import { makeUuid } from '~~/utils/passwords'
import prisma from '~~/utils/prisma'
const logger = createLogger('P2PTrades')

// List user's P2P Trades
export async function listUserTrades(userId: number): Promise<P2PTrade[]> {
  return prisma.p2p_trade.findMany({
    where: { OR: [{ user_id: userId }, { seller_id: userId }] },
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

// Get a single user's P2P Trade
export async function showUserTrade(
  userId: number,
  uuid: string,
): Promise<P2PTrade | null> {
  return prisma.p2p_trade.findUnique({
    where: { uuid, OR: [{ user_id: userId }, { seller_id: userId }] },
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
          reviews: {
            select: {
              reviewer: {
                select: {
                  uuid: true,
                },
              },
              rating: true,
            },
          },
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

export async function createUserTrade(
  userId: number,
  offer_uuid: string,
  amount: number,
): Promise<P2PTrade> {
  const trade = await prisma.$transaction(async (prisma) => {
    const offer = await prisma.p2p_offer.findUnique({
      where: { uuid: offer_uuid },
    })
    if (!offer) throw new Error('Offer not found')

    // Check if the trade amount is greater than the offer amount
    if (amount > offer.amount) {
      throw new Error('Trade amount exceeds offer available amount')
    }

    await prisma.p2p_offer.update({
      where: { uuid: offer_uuid },
      data: {
        amount: offer.amount - amount,
        in_order: offer.in_order + amount,
      },
    })

    // Create the trade and chat together
    const trade = await prisma.p2p_trade.create({
      data: {
        user_id: userId,
        seller_id: offer.user_id,
        offer_id: offer.id,
        amount,
        status: 'PENDING',
      },
      include: {
        offer: true,
      },
    })

    return trade as unknown as P2PTrade
  })

  const seller = await prisma.user.findUnique({
    where: { id: trade.seller_id },
  })
  try {
    const buyer = await prisma.user.findUnique({
      where: { id: trade.user_id },
    })

    await sendP2PTradeSaleConfirmationEmail(seller, buyer, trade)
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`)
  }

  if (trade.offer.amount === 0) {
    await prisma.p2p_offer.update({
      where: { id: trade.offer.id },
      data: {
        status: 'COMPLETED',
      },
    })
    try {
      await sendP2POfferAmountDepletionEmail(
        seller,
        trade.offer,
        trade.offer.amount,
      )
    } catch (error) {
      logger.error(`Failed to send email: ${error.message}`)
    }
  }

  return trade
}

export async function sendMessageQuery(
  userId: number,
  uuid: string,
  message: Message,
  isSeller?: boolean,
): Promise<P2PTrade> {
  // Fetch user and ticket in parallel
  const [user, trade] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.p2p_trade.findUnique({ where: { uuid } }),
  ])

  if (!user)
    throw createError({
      statusMessage: 'User not found',
      statusCode: 404,
    })
  if (!trade)
    throw createError({
      statusMessage: 'Ticket not found',
      statusCode: 404,
    })

  if (trade.status === 'CANCELLED')
    throw createError({
      statusMessage: 'Ticket is cancelled',
      statusCode: 404,
    })

  // Add new message
  const messages = trade.messages || {} // Check if trade.messages is defined
  const messageKey = Object.keys(messages).length.toString()
  messages[messageKey] = message

  // Update chat
  const updateData: any = { messages }
  const buyer = !isSeller
    ? user
    : await prisma.user.findUnique({ where: { id: trade.user_id } })
  const seller = isSeller
    ? user
    : await prisma.user.findUnique({ where: { id: trade.seller_id } })

  if (seller) {
    const sender = isSeller ? seller : buyer
    const receiver = isSeller ? buyer : seller

    try {
      await sendP2PTradeReplyEmail(receiver, sender, trade, message)
    } catch (error) {
      logger.error(`Failed to send email: ${error.message}`)
    }
  }

  return (await prisma.p2p_trade.update({
    where: { uuid },
    data: updateData,
  })) as unknown as P2PTrade
}

// cancelTradeQuery
export async function cancelTradeQuery(uuid: string): Promise<P2PTrade> {
  const trade = await prisma.$transaction(async (prisma) => {
    const trade = await prisma.p2p_trade.findUnique({
      where: { uuid },
      include: { offer: true },
    })
    if (!trade) throw new Error('Trade not found')

    if (trade.status !== P2PTradeStatus.PENDING)
      throw new Error('Trade can only be cancelled if it is pending')

    await prisma.p2p_offer.update({
      where: { id: trade.offer_id },
      data: {
        amount: trade.offer.amount + trade.amount,
        in_order: trade.offer.in_order - trade.amount,
      },
    })

    return prisma.p2p_trade.update({
      where: { id: trade.id },
      data: { status: P2PTradeStatus.CANCELLED },
    }) as unknown as P2PTrade
  })

  try {
    const user = await prisma.user.findUnique({ where: { id: trade.user_id } })
    const seller = await prisma.user.findUnique({
      where: { id: trade.seller_id },
    })

    await sendP2PTradeCancellationEmail(user, trade)
    await sendP2PTradeCancellationEmail(seller, trade)
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`)
  }

  return trade
}

// markTradeAsPaidQuery
export async function markTradeAsPaidQuery(
  userId: number,
  uuid: string,
  txHash: string,
): Promise<P2PTrade> {
  const trade = await prisma.p2p_trade.findFirst({
    where: { uuid, user_id: userId },
  })
  if (!trade) throw new Error('Trade not found')

  if (trade.status !== P2PTradeStatus.PENDING)
    throw new Error('Trade can only be marked as paid if it is pending')

  const updatedTrade = (await prisma.p2p_trade.update({
    where: { id: trade.id },
    data: { status: P2PTradeStatus.PAID, tx_hash: txHash },
    include: { offer: true },
  })) as unknown as P2PTrade

  try {
    const user = await prisma.user.findUnique({ where: { id: trade.user_id } })
    const seller = await prisma.user.findUnique({
      where: { id: trade.seller_id },
    })

    await sendP2PTradePaymentConfirmationEmail(
      seller,
      user,
      updatedTrade,
      txHash,
    )
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`)
  }

  return updatedTrade
}

// disputeTradeQuery
export async function disputeTradeQuery(
  userId: number,
  uuid: string,
  reason: string,
): Promise<P2PTrade> {
  const trade = await prisma.$transaction(async (prisma) => {
    const trade = await prisma.p2p_trade.findFirst({
      where: { uuid },
    })
    if (!trade) throw new Error('Trade not found')
    if (!reason) throw new Error('Reason is required')

    if (trade.status !== P2PTradeStatus.PAID)
      throw new Error('Trade can only be disputed if it is paid')

    await prisma.p2p_dispute.create({
      data: {
        trade_id: trade.id,
        raised_by_id: userId,
        reason,
        status: 'PENDING',
      },
    })

    return prisma.p2p_trade.update({
      where: { id: trade.id },
      data: { status: P2PTradeStatus.DISPUTE_OPEN },
    }) as unknown as P2PTrade
  })

  try {
    const disputer = await prisma.user.findUnique({ where: { id: userId } })
    const disputedId = disputer.id === userId ? trade?.seller_id : disputer.id
    const disputed = await prisma.user.findUnique({
      where: { id: disputedId },
    })

    await sendP2PDisputeOpenedEmail(disputed, disputer, trade, reason)
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`)
  }
  return trade
}

// cancelDisputeTradeQuery
export async function cancelDisputeTradeQuery(
  userId: number,
  uuid: string,
): Promise<P2PTrade> {
  const trade = await prisma.$transaction(async (prisma) => {
    const trade = await prisma.p2p_trade.findFirst({
      where: { uuid, user_id: userId },
    })
    if (!trade) throw new Error('Trade not found')

    if (trade.status !== P2PTradeStatus.DISPUTE_OPEN)
      throw new Error('Trade can only be cancelled if it is in a dispute')

    const dispute = await prisma.p2p_dispute.findFirst({
      where: { trade_id: trade.id },
    })
    if (!dispute) throw new Error('Dispute not found')

    await prisma.p2p_dispute.update({
      where: { id: dispute.id },
      data: { status: 'CANCELLED' },
    })

    return prisma.p2p_trade.update({
      where: { id: trade.id },
      data: { status: P2PTradeStatus.PAID },
    }) as unknown as P2PTrade
  })

  try {
    const user = await prisma.user.findUnique({ where: { id: trade.user_id } })
    const seller = await prisma.user.findUnique({
      where: { id: trade.seller_id },
    })

    await sendP2PDisputeClosingEmail(seller, trade)
    await sendP2PDisputeClosingEmail(user, trade)
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`)
  }

  return trade
}

// releaseTradeQuery
export async function releaseTradeQuery(
  userId: number,
  uuid: string,
): Promise<P2PTrade> {
  const trade = await prisma.p2p_trade.findFirst({
    where: { uuid, seller_id: userId },
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
  const updatedTrade = await prisma.$transaction(async (prisma) => {
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
      include: { offer: true },
    }) as unknown as P2PTrade
  })

  try {
    const user = await prisma.user.findUnique({ where: { id: trade.user_id } })
    const seller = await prisma.user.findUnique({
      where: { id: trade.seller_id },
    })

    await sendP2PTradeCompletionEmail(seller, user, updatedTrade)
    await sendP2PTradeCompletionEmail(user, seller, updatedTrade)
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`)
  }

  return updatedTrade
}

// refundTradeQuery
export async function refundTradeQuery(
  userId: number,
  uuid: string,
): Promise<P2PTrade> {
  const trade = await prisma.p2p_trade.findFirst({
    where: { uuid, user_id: userId },
  })
  if (!trade) throw new Error('Trade not found')

  if (!['DISPUTE_OPEN', 'ESCROW_REVIEW'].includes(trade.status))
    throw new Error(
      'Trade can only be refunded if it is in a dispute or under escrow review',
    )

  return prisma.p2p_trade.update({
    where: { id: trade.id },
    data: { status: P2PTradeStatus.REFUNDED },
  }) as unknown as P2PTrade
}
