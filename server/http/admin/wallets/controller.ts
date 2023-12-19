import { handleController } from '~~/utils'
import {
  getWallet,
  getWallets,
  updateTransactionStatusQuery,
  updateWalletBalance,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    const { filter, perPage, page, user, type, hideSmallBalances } = query
    const perPageNumber = perPage ? parseInt(perPage, 10) : 10
    const pageNumber = page ? parseInt(page, 10) : 1
    return getWallets(
      filter,
      perPageNumber,
      pageNumber,
      user,
      type,
      hideSmallBalances === 'true',
    )
  }),
  show: handleController(async (_, __, params) => {
    return getWallet(params.uuid)
  }),
  updateBalance: handleController(async (_, __, ___, ____, body) => {
    try {
      const response = await updateWalletBalance(
        body.uuid,
        body.type,
        body.amount,
      )
      return {
        ...response,
        message: 'Wallet balance updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  updateTransactionStatus: handleController(async (_, __, ___, ____, body) => {
    try {
      const response = await updateTransactionStatusQuery(
        body.referenceId,
        body.status,
        body.message,
      )
      return {
        ...response,
        message: 'Transaction status updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
}
