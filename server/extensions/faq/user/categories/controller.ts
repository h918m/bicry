import { handleController } from '~~/utils'
import { getCategoryByIdentifier, listCategories } from './queries'

export const controllers = {
  index: handleController(async () => {
    return listCategories()
  }),

  show: handleController(async (_, __, params) => {
    const { identifier } = params
    return getCategoryByIdentifier(identifier)
  }),
}
