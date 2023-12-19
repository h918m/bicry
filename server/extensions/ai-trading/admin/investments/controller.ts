import { handleController } from '~~/utils'
import {
  deleteInvestment,
  getInvestment,
  getInvestments,
  updateInvestment,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    try {
      return await getInvestments()
    } catch (error) {
      throw new Error(`Failed to fetch investments: ${error.message}`)
    }
  }),

  show: handleController(async (_, __, params) => {
    try {
      return await getInvestment(params.uuid)
    } catch (error) {
      throw new Error(`Failed to fetch investment: ${error.message}`)
    }
  }),

  update: handleController(async (_, __, params, ___, body) => {
    try {
      const updatedInvestment = await updateInvestment(
        params.uuid,
        body.profit,
        body.result,
      )
      return updatedInvestment
    } catch (error) {
      throw new Error(`Failed to update investment: ${error.message}`)
    }
  }),

  delete: handleController(async (_, __, params) => {
    try {
      const deletedInvestment = await deleteInvestment(Number(params.id))
      return deletedInvestment
    } catch (error) {
      throw new Error(`Failed to delete investment: ${error.message}`)
    }
  }),
}
