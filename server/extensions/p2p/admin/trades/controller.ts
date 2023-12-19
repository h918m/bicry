import { handleController } from '~~/utils'
import {
  cancelTrade,
  completeTrade,
  listTrades,
  showTrade,
  updateTrade,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return listTrades()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return showTrade(Number(id))
  }),

  update: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { status } = body
    return updateTrade(Number(id), status)
  }),
  cancel: handleController(async (_, __, params) => {
    const { id } = params
    return cancelTrade(Number(id))
  }),

  complete: handleController(async (_, __, params) => {
    const { id } = params
    return completeTrade(Number(id))
  }),
}
