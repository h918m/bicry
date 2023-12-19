import { handleController } from '~~/utils'
import {
  createUserOffer,
  editUserOffer,
  listOffers,
  listUserOffers,
  showUserOffer,
  showUserOfferUuid,
  updateUserOffer,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    return listOffers()
  }),

  userOffers: handleController(async (_, __, ___, ____, _____, user) => {
    return listUserOffers(user.id)
  }),

  show: handleController(async (_, __, params, ____, _____, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { uuid } = params
    return showUserOffer(uuid, user.id)
  }),

  showUuid: handleController(async (_, __, params) => {
    const { uuid } = params
    return showUserOfferUuid(uuid)
  }),

  create: handleController(async (_, __, ___, ____, body, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const {
      wallet_type,
      currency,
      amount,
      price,
      payment_method_id,
      min_amount,
      max_amount,
    } = body
    return createUserOffer(
      user.id,
      wallet_type,
      currency,
      amount,
      price,
      payment_method_id,
      min_amount,
      max_amount,
    )
  }),

  edit: handleController(async (_, __, params, ____, body, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { uuid } = params
    const { min_amount, max_amount } = body
    return editUserOffer(uuid, user.id, min_amount, max_amount)
  }),

  update: handleController(async (_, __, params, ____, body, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { uuid } = params
    const { status } = body
    return updateUserOffer(uuid, user.id, status)
  }),
}
