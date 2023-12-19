import { handleController } from '~~/utils'
import {
  createDiscount,
  deleteDiscount,
  getDiscounts,
  updateDiscount,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return getDiscounts()
  }),
  create: handleController(async (_, __, ___, ____, body) => {
    const { code, percentage, valid_until, product_id } = body
    return createDiscount(code, percentage, new Date(valid_until), product_id)
  }),

  update: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { code, percentage, valid_until, product_id, status } = body
    return updateDiscount(
      id,
      code,
      percentage,
      new Date(valid_until),
      product_id,
      status,
    )
  }),

  delete: handleController(async (_, __, params) => {
    const { id } = params
    return deleteDiscount(id)
  }),
}
