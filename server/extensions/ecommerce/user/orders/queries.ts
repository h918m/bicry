import type { EcommerceOrder } from '~~/types'
import { sendOrderConfirmationEmail } from '~~/utils/emails'
import { makeUuid } from '~~/utils/passwords'
import prisma from '~~/utils/prisma'

// List all orders for a specific user
export async function listOrders(userId: number): Promise<EcommerceOrder[]> {
  return prisma.ecommerce_order.findMany({
    where: { user_id: userId },
    include: {
      order_items: {
        include: {
          product: true,
        },
      },
    },
  }) as unknown as EcommerceOrder[]
}

// Get order details by ID for a specific user
export async function getOrderById(
  userId: number,
  orderId: number,
): Promise<EcommerceOrder | null> {
  return prisma.ecommerce_order.findFirst({
    where: { id: orderId, user_id: userId },
    include: {
      order_items: {
        include: {
          product: true,
        },
      },
    },
  }) as unknown as EcommerceOrder | null
}

// Create a new order for a user
export async function createOrder(
  userId: number,
  productIds: number[],
  quantities: number[],
): Promise<EcommerceOrder> {
  return {} as EcommerceOrder
}

export async function createSingleOrder(
  userId: number,
  productId: number,
  discountId?: number,
): Promise<EcommerceOrder> {
  const product = await prisma.ecommerce_product.findUnique({
    where: {
      id: Number(productId),
    },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  if (product.type === 'DOWNLOADABLE') {
    // Check if the user already has a completed order for this product
    const existingOrder = await prisma.ecommerce_order.findMany({
      where: {
        user_id: userId,
        status: 'COMPLETED',
        order_items: {
          some: {
            product_id: productId,
          },
        },
      },
    })

    // If such an order exists, prevent creating a new order
    if (existingOrder.length > 0) {
      throw new Error('Product already purchased')
    }
  }

  let userDiscount
  let cost = Number(product.price)
  if (discountId) {
    userDiscount = await prisma.ecommerce_user_discount.findFirst({
      where: {
        user_id: userId,
        discount_id: discountId,
      },
      include: {
        discount: true,
      },
    })

    if (!userDiscount) {
      throw new Error('Discount not found')
    }
    cost = Number(
      product.price - product.price * (userDiscount.discount.percentage / 100),
    )
  }

  const wallet = await prisma.wallet.findUnique({
    where: {
      wallet_user_id_currency_type_unique: {
        user_id: userId,
        type: product.wallet_type,
        currency: product.currency,
      },
    },
  })

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  if (wallet.balance < cost) {
    throw new Error('Insufficient balance')
  }

  if (product.inventory_quantity < 1) {
    throw new Error('Product out of stock')
  }

  const newBalance = Number(wallet.balance - cost)

  if (newBalance < 0) {
    throw new Error('Insufficient balance')
  }

  const order = await prisma.$transaction(async (prisma) => {
    // First, create the order and get its uuid
    const order = await prisma.ecommerce_order.create({
      data: {
        user_id: userId,
        status: product.type === 'DOWNLOADABLE' ? 'COMPLETED' : 'PENDING',
        order_items: {
          create: {
            product_id: product.id,
            quantity: 1,
          },
        },
      },
      include: {
        order_items: {
          include: {
            product: true,
          },
        },
      },
    })

    await prisma.ecommerce_product.update({
      where: {
        id: product.id,
      },
      data: {
        inventory_quantity: product.inventory_quantity - 1,
      },
    })

    await prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: newBalance,
      },
    })

    await prisma.transaction.create({
      data: {
        uuid: makeUuid(),
        user_id: userId,
        wallet_id: wallet.id,
        type: 'PAYMENT',
        status: 'COMPLETED',
        amount: cost,
        description: `Purchase of ${product.name} for ${cost} ${product.currency}`,
        reference_id: order.uuid,
        metadata: {
          discount: discountId,
        },
      },
    })

    if (userDiscount) {
      await prisma.ecommerce_user_discount.update({
        where: {
          id: userDiscount.id,
        },
        data: {
          status: 'INACTIVE',
        },
      })
    }

    return order as unknown as EcommerceOrder
  })

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    await sendOrderConfirmationEmail(user, order, product)
  } catch (error) {
    console.error(error)
  }
  return order
}
