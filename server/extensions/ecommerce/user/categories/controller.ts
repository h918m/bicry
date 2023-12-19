import { handleController } from '~~/utils'
import { listCategories, getCategoryById } from './queries'

export const controllers = {
  index: handleController(async () => {
    return listCategories()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return getCategoryById(Number(id))
  }),
}
