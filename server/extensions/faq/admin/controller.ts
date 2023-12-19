import { handleController } from '~~/utils'

import {
  getTotalFaqCategories,
  getTotalFaqs,
  getFaqsPerCategory,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    try {
      const totalFaqCategories = await getTotalFaqCategories()
      const totalFaqs = await getTotalFaqs()

      return {
        metrics: [
          { metric: 'Total FAQ Categories', value: totalFaqCategories },
          { metric: 'Total FAQs', value: totalFaqs },
        ],
      }
    } catch (error) {
      throw new Error(`Failed to fetch FAQ analytics data: ${error.message}`)
    }
  }),
}
