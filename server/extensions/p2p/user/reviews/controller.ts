import { handleController } from '~~/utils'
import { createUserReview } from './queries'

export const controllers = {
  create: handleController(async (_, __, params, ____, body, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { uuid } = params
    const { rating, comment } = body
    return createUserReview(user.id, uuid, rating, comment)
  }),
}
