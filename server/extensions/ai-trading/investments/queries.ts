import { addDays, addHours, isPast } from 'date-fns'
import { createLogger } from '../../../logger'
import type { AiTradingDuration } from '../../../types'
import {
  AiTradingStatus,
  type AiTrading,
  type AiTradingPlan,
  type User,
  type Wallet,
} from '../../../types'
import { sendAiInvestmentEmail } from '../../../utils/emails'
import { makeUuid } from '../../../utils/passwords'
import prisma from '../../../utils/prisma'
// Constants
const ONE_HOUR = 3600 * 1000
const logger = createLogger('AI Trading Investments')

const investmentInclude = {
  plan: {
    select: {
      id: true,
      name: true,
      title: true,
      description: true,
      image: true,
    },
  },
  user: {
    select: {
      id: true,
      uuid: true,
      avatar: true,
      first_name: true,
      last_name: true,
    },
  },
  duration: {
    select: {
      id: true,
      duration: true,
      timeframe: true,
    },
  },
}

export async function getInvestments(userId: number): Promise<AiTrading[]> {
  return (await prisma.ai_trading.findMany({
    where: {
      user_id: userId,
      status: {
        not: 'ACTIVE', // Exclude records where status is 'ACTIVE'
      },
    },
    include: investmentInclude,
    orderBy: [
      {
        status: 'asc', // 'asc' for ascending or 'desc' for descending
      },
      {
        created_at: 'asc', // 'asc' for oldest first, 'desc' for newest first
      },
    ],
  })) as unknown as AiTrading[]
}
export async function getUserActiveInvestments(
  userId: number,
): Promise<AiTrading[]> {
  return (await prisma.ai_trading.findMany({
    where: {
      user_id: userId,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      uuid: true,
      user_id: true,
      plan_id: true,
      duration_id: true,
      market: true,
      amount: true,
      status: true,
      created_at: true,
      updated_at: true,
      plan: {
        select: {
          id: true,
          name: true,
          title: true,
          description: true,
          image: true,
        },
      },
      duration: {
        select: {
          id: true,
          duration: true,
          timeframe: true,
        },
      },
    },
    orderBy: [
      {
        status: 'asc',
      },
      {
        created_at: 'asc',
      },
    ],
  })) as unknown as AiTrading[]
}

export async function getActiveInvestments(): Promise<AiTrading[]> {
  return (await prisma.ai_trading.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          title: true,
          description: true,
          default_profit: true,
          default_result: true,
        },
      },
      duration: {
        select: {
          id: true,
          duration: true,
          timeframe: true,
        },
      },
    },
    orderBy: [
      {
        status: 'asc', // 'asc' for ascending or 'desc' for descending
      },
      {
        created_at: 'asc', // 'asc' for oldest first, 'desc' for newest first
      },
    ],
  })) as unknown as AiTrading[]
}

export async function getInvestment(id: number): Promise<AiTrading | null> {
  return (await prisma.ai_trading.findUnique({
    where: { id },
    include: investmentInclude,
  })) as unknown as AiTrading
}

export async function createInvestment(
  userId: number,
  planId: number,
  duration: number,
  amount: number,
  currency: string,
  pair: string,
): Promise<AiTrading> {
  const user = (await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })) as unknown as User
  if (!user) {
    throw new Error('User not found')
  }
  const plan = (await prisma.ai_trading_plan.findUnique({
    where: {
      id: planId,
    },
  })) as unknown as AiTradingPlan
  if (!plan) {
    throw new Error('Plan not found')
  }
  if (amount < plan.min_amount || amount > plan.max_amount) {
    throw new Error('Amount is not within plan limits')
  }

  const wallet = (await prisma.wallet.findUnique({
    where: {
      wallet_user_id_currency_type_unique: {
        user_id: userId,
        currency: pair,
        type: 'SPOT',
      },
    },
  })) as unknown as Wallet

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  if (wallet.balance < amount) {
    throw new Error('Insufficient balance')
  }

  const durationData = (await prisma.ai_trading_duration.findUnique({
    where: {
      id: duration,
    },
  })) as unknown as AiTradingDuration

  try {
    const investment = (await prisma.$transaction(async (prisma) => {
      const investment = await prisma.ai_trading.create({
        data: {
          uuid: makeUuid(),
          user_id: userId,
          plan_id: planId,
          market: `${currency}/${pair}`,
          amount: amount,
          status: AiTradingStatus.ACTIVE,
          duration_id: duration,
        },
        include: investmentInclude,
      })

      await prisma.wallet.update({
        where: {
          wallet_user_id_currency_type_unique: {
            user_id: userId,
            currency: pair,
            type: 'SPOT',
          },
        },
        data: {
          balance: wallet.balance - amount,
        },
      })

      await prisma.transaction.create({
        data: {
          uuid: makeUuid(),
          user_id: userId,
          wallet_id: wallet.id,
          amount: amount,
          description: `Investment: Plan "${plan.title}" | Duration: ${durationData.duration} ${durationData.timeframe}`,
          status: 'COMPLETED',
          type: 'AI_INVESTMENT',
          reference_id: investment.uuid,
        },
      })

      return investment
    })) as unknown as AiTrading

    try {
      await sendAiInvestmentEmail(user, investment, 'NewAiInvestmentCreated')
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`)
    }

    return investment
  } catch (error) {
    logger.error(`Error creating investment: ${error.message}`)
  }
}

async function fetchTransactionByReferenceId(referenceId: string) {
  return prisma.transaction.findUnique({
    where: { reference_id: referenceId },
  })
}

async function fetchWalletById(walletId: number) {
  return prisma.wallet.findUnique({
    where: { id: walletId },
  })
}

export async function checkInvestment(uuid: string): Promise<AiTrading | null> {
  const investment = (await prisma.ai_trading.findUnique({
    where: { uuid },
    include: {
      plan: {
        select: {
          id: true,
          name: true,
          title: true,
          description: true,
          default_profit: true,
          default_result: true,
        },
      },
      duration: {
        select: {
          id: true,
          duration: true,
          timeframe: true,
        },
      },
    },
  })) as unknown as AiTrading
  if (!investment) {
    throw new Error('Investment not found')
  }
  return await processAiInvestment(investment)
}

export async function processAiInvestments() {
  const activeInvestments = await getActiveInvestments()

  for (const investment of activeInvestments) {
    try {
      await processAiInvestment(investment)
    } catch (error) {
      logger.error(`Error processing investment: ${error.message}`)
      continue
    }
  }
}

export async function processAiInvestment(
  investment: AiTrading,
): Promise<AiTrading | null> {
  const { id, duration, created_at, amount, profit, result, plan } = investment
  const roi = profit || plan.default_profit
  const investment_result = result || plan.default_result

  let endDate
  switch (duration.timeframe) {
    case 'HOUR':
      endDate = addHours(new Date(created_at), duration.duration)
      break
    case 'DAY':
      endDate = addDays(new Date(created_at), duration.duration)
      break
    case 'WEEK':
      endDate = addDays(new Date(created_at), duration.duration * 7)
      break
    case 'MONTH':
      endDate = addDays(new Date(created_at), duration.duration * 30)
      break
    default:
      endDate = addHours(new Date(created_at), duration.duration)
      break
  }

  if (isPast(endDate)) {
    let updatedInvestment
    try {
      const transaction = await fetchTransactionByReferenceId(investment.uuid)
      if (!transaction) throw new Error('Transaction not found')

      const wallet = await fetchWalletById(transaction.wallet_id)
      if (!wallet) throw new Error('Wallet not found')

      let newBalance = wallet.balance
      if (investment_result === 'WIN') {
        newBalance += amount + roi
      } else if (investment_result === 'LOSS') {
        newBalance += amount - roi
      } else {
        newBalance += amount
      }

      // Update Wallet
      updatedInvestment = await prisma.$transaction(async (prisma) => {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: newBalance },
        })

        await prisma.transaction.create({
          data: {
            uuid: makeUuid(),
            user_id: wallet.user_id,
            wallet_id: wallet.id,
            amount:
              investment_result === 'WIN'
                ? roi
                : investment_result === 'LOSS'
                ? -roi
                : 0,
            description: `Investment ROI: Plan "${investment.plan.title}" | Duration: ${investment.duration.duration} ${investment.duration.timeframe}`,
            status: 'COMPLETED',
            type: 'AI_INVESTMENT_ROI',
          },
        })

        const updatedAiTrading = await prisma.ai_trading.update({
          where: { id },
          data: {
            status: AiTradingStatus.COMPLETED,
            result: investment_result,
            profit: roi,
          },
          include: investmentInclude,
        })

        return updatedAiTrading
      })
    } catch (error) {
      logger.error(`Error processing investment: ${error.message}`)
    }

    if (updatedInvestment) {
      try {
        if (!updatedInvestment) throw new Error('Investment not found')
        const user = (await prisma.user.findUnique({
          where: {
            id: investment.user_id,
          },
        })) as unknown as User
        if (!user) throw new Error('User not found')

        await sendAiInvestmentEmail(
          user,
          updatedInvestment,
          'AiInvestmentCompleted',
        )
      } catch (error) {
        logger.error(`Error sending email: ${error.message}`)
      }
    }
    return updatedInvestment
  }
}
