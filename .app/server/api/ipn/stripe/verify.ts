export default defineEventHandler(async (event) => {
  const { useServerStripe } = await import('#stripe/server')
  const stripe = await useServerStripe(event)
  const { sessionId } = await readBody(event)
  // Retrieve the session with line items.
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  })
  return {
    version: stripe.VERSION,
    id: session.id,
    payment_status: session.payment_status,
    line_items: session.line_items.data,
  }
})
