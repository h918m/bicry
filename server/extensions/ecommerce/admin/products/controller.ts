import { handleController } from '~~/utils'
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from './queries'

export const controllers = {
  index: handleController(async () => {
    return listProducts()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return getProductById(Number(id))
  }),

  create: handleController(async (_, __, ___, ____, body) => {
    const {
      name,
      description,
      type,
      price,
      currency,
      wallet_type,
      category_id,
      inventory_quantity,
      file_path,
      image,
    } = body
    return createProduct(
      name,
      description,
      type,
      price,
      currency,
      wallet_type,
      category_id,
      inventory_quantity,
      file_path,
      image,
    )
  }),

  update: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const {
      name,
      description,
      type,
      price,
      currency,
      wallet_type,
      category_id,
      inventory_quantity,
      file_path,
      status,
      image,
    } = body
    return updateProduct(
      Number(id),
      name,
      description,
      type,
      price,
      currency,
      wallet_type,
      category_id,
      inventory_quantity,
      file_path,
      status,
      image,
    )
  }),

  delete: handleController(async (_, __, params) => {
    const { id } = params
    return deleteProduct(Number(id))
  }),
}
