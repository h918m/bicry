import { handleController } from '~~/utils'
import { createReview } from './queries'

export const controllers = {
  create: handleController(async (_, __, params, ___, body, user) => {
    const { product_id } = params
    const { rating, comment } = body
    const user_id = user.id
    return createReview({
      product_id: Number(product_id),
      user_id,
      rating,
      comment,
    })
  }),
}
