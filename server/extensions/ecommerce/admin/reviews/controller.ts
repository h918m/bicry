import { handleController } from '~~/utils'
import {
  deleteReview,
  getReviewById,
  listReviews,
  updateReview,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return listReviews()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return getReviewById(Number(id))
  }),

  update: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { rating, comment, status } = body
    return updateReview(Number(id), status, rating, comment)
  }),

  delete: handleController(async (_, __, params) => {
    const { id } = params
    return deleteReview(Number(id))
  }),
}
