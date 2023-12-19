import { handleController } from '~~/utils'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return listCategories()
  }),

  create: handleController(async (_, __, ___, ____, body) => {
    const { name, description, image } = body
    return createCategory(name, description, image)
  }),

  update: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { name, description, image, status } = body
    return updateCategory(Number(id), name, description, status, image)
  }),

  delete: handleController(async (_, __, params) => {
    const { id } = params
    return deleteCategory(Number(id))
  }),
}
