import type { AiTradingPlan } from '~~/types'
import prisma from '~~/utils/prisma'

export async function getPlans(): Promise<AiTradingPlan[]> {
  const plans = await prisma.ai_trading_plan.findMany({
    where: { status: true },
    select: {
      id: true,
      title: true,
      description: true,
      image: true,
      min_amount: true,
      max_amount: true,
      invested: true,
      trending: true,
      status: true,
      ai_trading_plan_duration: {
        select: {
          duration: {
            select: {
              id: true,
              duration: true,
              timeframe: true,
            },
          },
        },
      },
    },
  })

  return plans as unknown as AiTradingPlan[]
}
