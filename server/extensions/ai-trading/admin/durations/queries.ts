import type { AiTrading, AiTradingDuration } from '~~/types'
import { AiTradingTimeframe } from '~~/types'
import prisma from '~~/utils/prisma'

export async function getDurations(): Promise<AiTradingDuration[]> {
  return (await prisma.ai_trading_duration.findMany({
    include: {
      ai_trading_plan_duration: true,
    },
  })) as unknown as AiTradingDuration[]
}

export async function getDuration(id: number): Promise<AiTrading | null> {
  return (await prisma.ai_trading_duration.findUnique({
    where: { id },
    include: {
      ai_trading_plan_duration: true,
    },
  })) as unknown as AiTrading
}

function isValidTimeframe(timeframe: any): timeframe is AiTradingTimeframe {
  return Object.values(AiTradingTimeframe).includes(
    timeframe as AiTradingTimeframe,
  )
}

export async function createDuration(
  duration: number,
  timeframe: AiTradingTimeframe,
): Promise<AiTradingDuration> {
  if (!isValidTimeframe(timeframe)) {
    throw new Error(`Invalid timeframe value: ${timeframe}`)
  }

  return (await prisma.ai_trading_duration.create({
    data: {
      duration,
      timeframe,
    },
  })) as unknown as AiTradingDuration
}

export async function updateDuration(
  id: number,
  duration: number,
  timeframe: AiTradingTimeframe,
): Promise<AiTradingDuration> {
  return (await prisma.ai_trading_duration.update({
    where: { id },
    data: {
      duration,
      timeframe,
    },
  })) as unknown as AiTradingDuration
}

export async function deleteDuration(id: number): Promise<void> {
  await prisma.ai_trading_duration.delete({
    where: { id },
  })
}
