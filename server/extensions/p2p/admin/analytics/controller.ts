import { handleController } from '~~/utils'
import {
  getActiveP2POffers,
  getCompletedP2PTrades,
  getResolvedP2PDisputes,
  getTotalP2PDisputes,
  getTotalP2POffers,
  getTotalP2PTrades,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    try {
      const totalP2POffers = await getTotalP2POffers()
      const activeP2POffers = await getActiveP2POffers()
      const totalP2PTrades = await getTotalP2PTrades()
      const completedP2PTrades = await getCompletedP2PTrades()
      const totalP2PDisputes = await getTotalP2PDisputes()
      const resolvedP2PDisputes = await getResolvedP2PDisputes()

      return {
        metrics: [
          { metric: 'Total P2P Offers', value: totalP2POffers },
          { metric: 'Active P2P Offers', value: activeP2POffers },
          { metric: 'Total P2P Trades', value: totalP2PTrades },
          { metric: 'Completed P2P Trades', value: completedP2PTrades },
          { metric: 'Total P2P Disputes', value: totalP2PDisputes },
          { metric: 'Resolved P2P Disputes', value: resolvedP2PDisputes },
        ],
      }
    } catch (error) {
      throw new Error(`Failed to fetch P2P analytics data: ${error.message}`)
    }
  }),
}
