import { handleController } from '~~/utils'
import { createUserDispute, listUserDisputes, showUserDispute } from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    return listUserDisputes(user.id)
  }),

  show: handleController(async (_, __, params, ____, _____, user) => {
    const { id } = params
    return showUserDispute(Number(id), user.id)
  }),

  create: handleController(async (_, __, ___, ____, body, user) => {
    const { trade_id, reason } = body
    return createUserDispute(user.id, trade_id, reason)
  }),
}
