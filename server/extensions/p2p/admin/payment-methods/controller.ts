import { handleController } from '~~/utils'
import {
  deletePaymentMethod,
  listPaymentMethods,
  updatePaymentMethod,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return listPaymentMethods()
  }),

  update: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { name, instructions, image, status, currency } = body
    return updatePaymentMethod(
      Number(id),
      name,
      instructions,
      status,
      currency,
      image,
    )
  }),

  delete: handleController(async (_, __, params) => {
    const { id } = params
    return deletePaymentMethod(Number(id))
  }),
}
