import { handleController } from '~~/utils'
import {
  cancelDisputeTradeQuery,
  cancelTradeQuery,
  createUserTrade,
  disputeTradeQuery,
  listUserTrades,
  markTradeAsPaidQuery,
  refundTradeQuery,
  releaseTradeQuery,
  sendMessageQuery,
  showUserTrade,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, ____, _____, user) => {
    if (!user.id) throw new Error('Unauthorized')
    return listUserTrades(user.id)
  }),

  show: handleController(async (_, __, params, ____, _____, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { uuid } = params
    return showUserTrade(user.id, uuid)
  }),

  store: handleController(async (_, __, ___, ____, body, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { offer_id, amount } = body
    return createUserTrade(user.id, offer_id, amount)
  }),

  sendMessage: handleController(async (_, __, params, ____, body, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { uuid } = params
    const { message, isSeller } = body
    return sendMessageQuery(user.id, uuid, message, isSeller)
  }),

  cancelTrade: handleController(async (_, __, params, ___, ____, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { uuid } = params
    return cancelTradeQuery(uuid)
  }),

  markTradeAsPaid: handleController(async (_, __, params, ___, body, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { uuid } = params
    const { txHash } = body
    return markTradeAsPaidQuery(user.id, uuid, txHash)
  }),

  disputeTrade: handleController(async (_, __, params, ___, body, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { uuid } = params
    const { reason } = body
    return disputeTradeQuery(user.id, uuid, reason)
  }),

  cancelDispute: handleController(async (_, __, params, ___, ____, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { uuid } = params
    return cancelDisputeTradeQuery(user.id, uuid)
  }),

  releaseTrade: handleController(async (_, __, params, ___, ____, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { uuid } = params
    return releaseTradeQuery(user.id, uuid)
  }),

  refundTrade: handleController(async (_, __, params, ___, ____, user) => {
    if (!user.id) throw new Error('Unauthorized')
    const { uuid } = params
    return refundTradeQuery(user.id, uuid)
  }),
}
