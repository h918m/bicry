import { handleController } from '~~/utils'
import { applyDiscount } from './queries'

export const controllers = {
  apply: handleController(async (_, __, params, ___, body, user) => {
    return applyDiscount(user.id, params.product_id, body.code)
  }),
}
