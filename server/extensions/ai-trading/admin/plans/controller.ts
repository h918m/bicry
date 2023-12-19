import { handleController } from '~~/utils'
import {
  createPlan,
  deletePlan,
  getPlan,
  getPlans,
  updatePlan,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    try {
      return await getPlans()
    } catch (error) {
      throw new Error(`Failed to fetch plans: ${error.message}`)
    }
  }),

  show: handleController(async (_, __, params) => {
    try {
      return await getPlan(Number(params.id))
    } catch (error) {
      throw new Error(`Failed to fetch plan: ${error.message}`)
    }
  }),

  create: handleController(async (_, __, ___, ____, body) => {
    const {
      name,
      title,
      description,
      min_amount,
      max_amount,
      profit_percentage,
      min_profit,
      max_profit,
      default_profit,
      default_result,
      invested,
      status,
      image,
      trending,
      durations,
    } = body.plan
    try {
      return await createPlan(
        name,
        title,
        description,
        min_amount,
        max_amount,
        profit_percentage,
        min_profit,
        max_profit,
        default_profit,
        default_result,
        durations,
        invested,
        status,
        image,
        trending,
      )
    } catch (error) {
      throw new Error(`Failed to create plan: ${error.message}`)
    }
  }),

  update: handleController(async (_, __, params, ___, body) => {
    const {
      name,
      title,
      description,
      min_amount,
      max_amount,
      profit_percentage,
      min_profit,
      max_profit,
      default_profit,
      default_result,
      invested,
      status,
      image,
      trending,
      durations,
    } = body.plan
    try {
      return await updatePlan(
        Number(params.id),
        name,
        title,
        description,
        min_amount,
        max_amount,
        profit_percentage,
        min_profit,
        max_profit,
        default_profit,
        default_result,
        durations,
        invested,
        status,
        image,
        trending,
      )
    } catch (error) {
      throw new Error(`Failed to update plan: ${error.message}`)
    }
  }),

  delete: handleController(async (_, __, params) => {
    try {
      return await deletePlan(Number(params.id))
    } catch (error) {
      throw new Error(`Failed to delete plan: ${error.message}`)
    }
  }),
}
