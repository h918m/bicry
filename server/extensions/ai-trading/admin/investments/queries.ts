import type { AiTrading, AiTradingResult, AiTradingStatus } from '~~/types'
import prisma from '~~/utils/prisma'

// Constants for repeated query clauses
const investmentInclude = {
  // Include any related fields or entities specific to admin
  plan: true,
  duration: true,
  user: {
    select: {
      first_name: true,
      last_name: true,
      uuid: true,
      avatar: true,
    },
  },
}

export async function getInvestments(): Promise<AiTrading[]> {
  return (await prisma.ai_trading.findMany({
    include: investmentInclude,
  })) as unknown as AiTrading[]
}

export async function getInvestment(uuid: string): Promise<AiTrading | null> {
  return (await prisma.ai_trading.findUnique({
    where: { uuid },
    include: investmentInclude,
  })) as unknown as AiTrading
}

export async function updateInvestment(
  uuid: string,
  profit: number,
  result: AiTradingResult,
): Promise<AiTrading> {
  return (await prisma.ai_trading.update({
    where: { uuid },
    data: {
      profit,
      result,
    },
  })) as unknown as AiTrading
}

export async function deleteInvestment(id: number): Promise<void> {
  await prisma.ai_trading.delete({
    where: { id },
  })
}
