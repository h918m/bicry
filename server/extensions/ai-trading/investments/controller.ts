import { handleController } from '../../../utils'
import {
  checkInvestment,
  createInvestment,
  getInvestments,
  getUserActiveInvestments,
  processAiInvestments,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    try {
      return await getInvestments(user.id)
    } catch (error) {
      throw new Error(`Failed to fetch investments: ${error.message}`)
    }
  }),

  active: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user) throw new Error('User not found')
    try {
      return await getUserActiveInvestments(user.id)
    } catch (error) {
      throw new Error(`Failed to fetch active investments: ${error.message}`)
    }
  }),

  status: handleController(async (_, __, params, ___, ____, user) => {
    if (!user) throw new Error('User not found')
    try {
      return await checkInvestment(params.uuid)
    } catch (error) {
      throw new Error(`Failed to fetch investment: ${error.message}`)
    }
  }),

  create: handleController(async (_, __, ___, ____, body, user) => {
    if (!user) throw new Error('User not found')
    try {
      return await createInvestment(
        user.id,
        body.plan_id,
        body.duration,
        parseFloat(body.amount),
        body.currency,
        body.pair,
      )
    } catch (error) {
      throw new Error(`Failed to create investment: ${error.message}`)
    }
  }),

  cron: handleController(async () => {
    try {
      await processAiInvestments()
    } catch (error) {
      throw new Error(error)
    }
  }),
}
