import { handleController } from '~~/utils'
import { listEscrows, showEscrow } from './queries'

export const controllers = {
  index: handleController(async () => {
    return listEscrows()
  }),

  show: handleController(async (_, __, params) => {
    const { id } = params
    return showEscrow(Number(id))
  }),
}
