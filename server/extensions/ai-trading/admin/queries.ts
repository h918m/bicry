import prisma from '~~/utils/prisma'

export async function getTotalAIPlans(): Promise<number> {
  return prisma.ai_trading_plan.count()
}

export async function getActiveAIPlans(): Promise<number> {
  return prisma.ai_trading_plan.count({
    where: {
      status: true, // Assuming `true` corresponds to 'ACTIVE'
    },
  })
}

export async function getTotalAITrades(): Promise<number> {
  return prisma.ai_trading.count()
}

export async function getActiveAITrades(): Promise<number> {
  return prisma.ai_trading.count({
    where: {
      status: 'ACTIVE',
    },
  })
}

export async function getCompletedAITrades(): Promise<number> {
  return prisma.ai_trading.count({
    where: {
      status: 'COMPLETED',
    },
  })
}

export async function getTotalInvestedInAITrading(): Promise<number> {
  return prisma.ai_trading_plan
    .aggregate({
      _sum: {
        invested: true,
      },
    })
    .then((result) => result._sum.invested)
}

export async function getTotalProfitFromAITrading(): Promise<number> {
  return prisma.ai_trading
    .aggregate({
      _sum: {
        profit: true,
      },
      where: {
        result: 'WIN',
        status: 'COMPLETED',
      },
    })
    .then((result) => result._sum.profit)
}
