import type { AiTradingTimeframe } from '~~/types'
import { handleController } from '~~/utils'
import {
  createDuration,
  deleteDuration,
  getDuration,
  getDurations,
  updateDuration,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    try {
      return await getDurations()
    } catch (error) {
      throw new Error(`Failed to fetch durations: ${error.message}`)
    }
  }),

  show: handleController(async (_, __, params) => {
    try {
      return await getDuration(Number(params.id))
    } catch (error) {
      throw new Error(`Failed to fetch duration: ${error.message}`)
    }
  }),

  create: handleController(async (_, __, ___, ____, body) => {
    try {
      const newDuration = await createDuration(
        body.duration.duration,
        body.duration.timeframe as AiTradingTimeframe,
      )
      return newDuration
    } catch (error) {
      throw new Error(`Failed to create duration: ${error.message}`)
    }
  }),

  update: handleController(async (_, __, params, ___, body) => {
    try {
      const updatedDuration = await updateDuration(
        Number(params.id),
        body.duration.duration,
        body.duration.timeframe as AiTradingTimeframe,
      )
      return updatedDuration
    } catch (error) {
      throw new Error(`Failed to update duration: ${error.message}`)
    }
  }),

  delete: handleController(async (_, __, params) => {
    try {
      const deletedDuration = await deleteDuration(Number(params.id))
      return deletedDuration
    } catch (error) {
      throw new Error(`Failed to delete duration: ${error.message}`)
    }
  }),
}
