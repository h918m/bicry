import { handleController } from '~~/utils'
import {
  getActiveAIPlans,
  getActiveAITrades,
  getCompletedAITrades,
  getTotalAIPlans,
  getTotalAITrades,
  getTotalInvestedInAITrading,
  getTotalProfitFromAITrading,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    try {
      const totalAIPlans = await getTotalAIPlans()
      const activeAIPlans = await getActiveAIPlans()
      const totalAITrades = await getTotalAITrades()
      const activeAITrades = await getActiveAITrades()
      const completedAITrades = await getCompletedAITrades()
      const totalInvested = await getTotalInvestedInAITrading()
      const totalProfit = await getTotalProfitFromAITrading()

      return {
        metrics: [
          { metric: 'Total AI Trading Plans', value: totalAIPlans },
          { metric: 'Active AI Trading Plans', value: activeAIPlans },
          { metric: 'Total AI Trades', value: totalAITrades },
          { metric: 'Active AI Trades', value: activeAITrades },
          { metric: 'Completed AI Trades', value: completedAITrades },
          { metric: 'Total Invested in AI Trading', value: totalInvested },
          { metric: 'Total Profit from AI Trading', value: totalProfit },
        ],
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch AI Trading analytics data: ${error.message}`,
      )
    }
  }),
}
