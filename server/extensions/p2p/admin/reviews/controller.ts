import { handleController } from '~~/utils'
import { deleteReview, listReviews, showReview } from './queries'

export const controllers = {
  index: handleController(async () => {
    return listReviews()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return showReview(Number(id))
  }),

  delete: handleController(async (_, __, params) => {
    const { id } = params
    return deleteReview(Number(id))
  }),
}
