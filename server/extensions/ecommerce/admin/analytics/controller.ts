import { handleController } from '~~/utils'

import {
  getActiveEcommerceProducts,
  getCompletedEcommerceOrders,
  getTotalEcommerceOrders,
  getTotalEcommerceProducts,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    try {
      const totalEcommerceProducts = await getTotalEcommerceProducts()
      const activeEcommerceProducts = await getActiveEcommerceProducts()
      const totalEcommerceOrders = await getTotalEcommerceOrders()
      const completedEcommerceOrders = await getCompletedEcommerceOrders()

      return {
        metrics: [
          { metric: 'Total Products', value: totalEcommerceProducts },
          {
            metric: 'Active Products',
            value: activeEcommerceProducts,
          },
          { metric: 'Total Orders', value: totalEcommerceOrders },
          {
            metric: 'Completed Orders',
            value: completedEcommerceOrders,
          },
        ],
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch ecommerce analytics data: ${error.message}`,
      )
    }
  }),
}
