import { handleController } from '~~/utils'
import {
  createUserPaymentMethod,
  deleteUserPaymentMethod,
  listUserPaymentMethods,
  showUserPaymentMethod,
  updateUserPaymentMethod,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user.id) throw new Error('Unauthorized')
    return listUserPaymentMethods(user.id)
  }),

  show: handleController(async (_, __, params, ____, _____, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { id } = params
    return showUserPaymentMethod(Number(id), user.id)
  }),

  create: handleController(async (_, __, ___, ____, body, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { name, instructions, image, currency } = body
    return createUserPaymentMethod(user.id, name, instructions, currency, image)
  }),

  update: handleController(async (_, __, params, ____, body, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { id } = params
    const { name, instructions, image, currency } = body
    return updateUserPaymentMethod(
      Number(id),
      user.id,
      name,
      instructions,
      currency,
      image,
    )
  }),

  delete: handleController(async (_, __, params, ____, _____, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { id } = params
    return deleteUserPaymentMethod(Number(id), user.id)
  }),
}
