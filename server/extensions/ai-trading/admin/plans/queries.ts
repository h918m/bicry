import type { AiTradingPlan, AiTradingResult } from '~~/types'
import prisma from '~~/utils/prisma'

export async function getPlans(status?: string): Promise<AiTradingPlan[]> {
  return (await prisma.ai_trading_plan.findMany({
    include: {
      ai_trading_plan_duration: true,
    },
  })) as unknown as AiTradingPlan[]
}

export async function getPlan(id: number): Promise<AiTradingPlan | null> {
  return (await prisma.ai_trading_plan.findUnique({
    where: { id },
    include: {
      ai_trading_plan_duration: true,
    },
  })) as unknown as AiTradingPlan
}

export async function createPlan(
  name: string,
  title: string,
  description: string,
  min_amount: number,
  max_amount: number,
  profit_percentage: number,
  min_profit: number,
  max_profit: number,
  default_profit: number,
  default_result: AiTradingResult,
  durations: number[],
  invested?: number,
  status?: boolean,
  image?: string,
  trending?: boolean,
): Promise<AiTradingPlan> {
  const plan = await prisma.ai_trading_plan.create({
    data: {
      name,
      title,
      description,
      min_amount,
      max_amount,
      invested,
      profit_percentage,
      min_profit,
      max_profit,
      default_profit,
      default_result,
      status,
      image,
      trending,
    },
  })
  // No need to check for old durations in createPlan
  await syncDurations(plan.id, durations)

  return plan as unknown as AiTradingPlan
}

export async function updatePlan(
  id: number,
  name: string,
  title: string,
  description: string,
  min_amount: number,
  max_amount: number,
  profit_percentage: number,
  min_profit: number,
  max_profit: number,
  default_profit: number,
  default_result: AiTradingResult,
  durations: number[],
  invested?: number,
  status?: boolean,
  image?: string,
  trending?: boolean,
): Promise<AiTradingPlan> {
  const plan = await prisma.ai_trading_plan.update({
    where: { id },
    data: {
      name,
      title,
      description,
      min_amount,
      max_amount,
      invested,
      profit_percentage,
      min_profit,
      max_profit,
      default_profit,
      default_result,
      status,
      image,
      trending,
    },
  })

  await syncDurations(id, durations)

  return plan as unknown as AiTradingPlan
}

export async function deletePlan(id: number): Promise<void> {
  await prisma.ai_trading_plan.delete({
    where: { id },
  })
}

export async function syncDurations(
  planId: number,
  durations: number[],
): Promise<AiTradingPlan> {
  const plan = await prisma.ai_trading_plan.findUnique({
    where: { id: planId },
    include: { ai_trading_plan_duration: true },
  })

  if (!plan) throw new Error('Plan not found')

  const existingDurationIds = plan.ai_trading_plan_duration.map(
    (dp) => dp.duration_id,
  )

  const toBeAdded = durations.filter((id) => !existingDurationIds.includes(id))
  const toBeRemoved = existingDurationIds.filter(
    (id) => !durations.includes(id),
  )

  if (toBeRemoved.length > 0) {
    await prisma.ai_trading_plan_duration.deleteMany({
      where: {
        plan_id: planId,
        duration_id: { in: toBeRemoved },
      },
    })
  }

  if (toBeAdded.length > 0) {
    await prisma.ai_trading_plan.update({
      where: { id: planId },
      data: {
        ai_trading_plan_duration: {
          create: toBeAdded.map((durationId) => ({
            duration_id: durationId,
          })),
        },
      },
    })
  }

  const updatedPlan = await getPlan(planId)
  return updatedPlan as unknown as AiTradingPlan
}
