import { handleController } from '~~/utils'
import { listProducts, getProductById } from './queries'

export const controllers = {
  index: handleController(async () => {
    return listProducts()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return getProductById(Number(id))
  }),
}
