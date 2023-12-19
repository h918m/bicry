import { handleController } from '~~/utils'
import {
  listDisputes,
  markAsResolvedQuery,
  resolveDispute,
  showDispute,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return listDisputes()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return showDispute(Number(id))
  }),

  resolve: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { resolution } = body
    return resolveDispute(Number(id), resolution)
  }),

  markAsResolved: handleController(async (_, __, params) => {
    const { id } = params
    return markAsResolvedQuery(Number(id))
  }),
}
