import { handleController } from '~~/utils'
import { getFaqById, listFaqs } from './queries'

export const controllers = {
  index: handleController(async () => {
    return listFaqs()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return getFaqById(Number(id))
  }),
}
