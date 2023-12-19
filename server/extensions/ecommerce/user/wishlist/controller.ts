import { handleController } from '~~/utils'
import { addToWishlist, getWishlist, removeFromWishlist } from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    return getWishlist(user.id)
  }),

  store: handleController(async (_, __, ___, ____, body, user) => {
    const { product_id } = body
    return addToWishlist(user.id, Number(product_id))
  }),

  delete: handleController(async (_, __, params, ____, _____, user) => {
    const { product_id } = params
    return removeFromWishlist(user.id, Number(product_id))
  }),
}
