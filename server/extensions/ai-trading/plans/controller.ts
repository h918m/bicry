import { handleController } from '~~/utils'
import { getPlans } from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    try {
      return await getPlans()
    } catch (error) {
      throw new Error(`Failed to fetch plans: ${error.message}`)
    }
  }),
}
