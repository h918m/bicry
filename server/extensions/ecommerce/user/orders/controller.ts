import { handleController } from '~~/utils'
import {
  createOrder,
  createSingleOrder,
  getOrderById,
  listOrders,
} from './queries'

export const controllers = {
  index: handleController(async (user) => {
    // Assuming the user is extracted from the session or token
    return listOrders(user.id)
  }),

  show: handleController(async (_, __, params, ___, ____, user) => {
    const { id } = params
    return getOrderById(user.id, Number(id)) // Assuming that we should check the order belongs to the user
  }),

  create: handleController(async (_, __, ___, ____, body, user) => {
    const { product_ids, quantities } = body
    return createOrder(user.id, product_ids, quantities) // Assuming the user is extracted from the session or token
  }),

  store: handleController(async (_, __, ___, ____, body, user) => {
    const { product_id, discount_id } = body
    return createSingleOrder(user.id, product_id, discount_id)
  }),
}
