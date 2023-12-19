import { handleController } from '~~/utils'
import {
  createFaq,
  deleteFaq,
  getFaqById,
  listFaqs,
  updateFaq,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return listFaqs()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return getFaqById(Number(id))
  }),

  create: handleController(async (_, __, ___, ____, body) => {
    const { question, answer, faq_category_id } = body
    return createFaq(question, answer, Number(faq_category_id))
  }),

  update: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { question, answer } = body
    return updateFaq(Number(id), question, answer)
  }),

  delete: handleController(async (_, __, params) => {
    const { id } = params
    return deleteFaq(Number(id))
  }),
}
