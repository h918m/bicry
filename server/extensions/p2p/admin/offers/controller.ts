import { handleController } from '~~/utils'
import { deleteOffer, listOffers, showOffer, updateOffer } from './queries'

export const controllers = {
  index: handleController(async () => {
    return listOffers()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return showOffer(Number(id))
  }),

  update: handleController(async (_, __, params, ____, body) => {
    const { id } = params
    const { status } = body
    return updateOffer(Number(id), status)
  }),

  delete: handleController(async (_, __, params) => {
    const { id } = params
    return deleteOffer(Number(id))
  }),
}
