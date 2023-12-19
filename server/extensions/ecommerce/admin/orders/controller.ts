import { handleController } from '~~/utils'
import {
  getOrderDetailsById,
  listAllOrders,
  removeOrder,
  updateOrder,
  updateOrderItem,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return listAllOrders()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return getOrderDetailsById(Number(id))
  }),

  update: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { status } = body
    return updateOrder(Number(id), status)
  }),

  updateItem: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { key } = body
    return updateOrderItem(Number(id), key)
  }),

  delete: handleController(async (_, __, params) => {
    const { id } = params
    return removeOrder(Number(id))
  }),
}
