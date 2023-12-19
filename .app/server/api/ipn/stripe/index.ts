export default defineEventHandler(async (event) => {
  const { useServerStripe } = await import('#stripe/server')
  const stripe = await useServerStripe(event)
  const { amount, currency, taxAmount } = await readBody(event)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: 'Deposit',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: currency,
          product_data: {
            name: 'Tax',
          },
          unit_amount: taxAmount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${event.node.req.headers.origin}/user/wallets/fiat/deposit/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${event.node.req.headers.origin}/user/wallets/fiat/deposit/cancel`,
  })
  return {
    version: stripe.VERSION,
    id: session.id,
    url: session.url,
  }
})
