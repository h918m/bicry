import type {
  EcommerceOrder,
  EcommerceOrderItem,
  EcommerceOrderStatus,
} from '~~/types'
import { sendOrderStatusUpdateEmail } from '~~/utils/emails'
import prisma from '~~/utils/prisma'

// List all orders
export async function listAllOrders(): Promise<EcommerceOrder[]> {
  return prisma.ecommerce_order.findMany({
    include: {
      user: {
        select: {
          uuid: true,
          first_name: true,
          last_name: true,
          avatar: true,
        },
      },
      order_items: {
        include: {
          product: true,
        },
      },
    },
  }) as unknown as EcommerceOrder[]
}

// Get details for a specific order by ID
export async function getOrderDetailsById(
  id: number,
): Promise<EcommerceOrder | null> {
  return prisma.ecommerce_order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          uuid: true,
          first_name: true,
          last_name: true,
          avatar: true,
        },
      },
      order_items: {
        include: {
          product: true,
        },
      },
    },
  }) as unknown as EcommerceOrder | null
}

// Update the status of an order
export async function updateOrder(
  id: number,
  status: EcommerceOrderStatus,
): Promise<EcommerceOrder> {
  const order = (await prisma.ecommerce_order.update({
    where: { id },
    data: { status },
  })) as unknown as EcommerceOrder

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: order.user_id,
      },
    })

    // where to get the product , order_items
    await sendOrderStatusUpdateEmail(user, order)
  } catch (error) {
    console.error(error)
  }

  return order
}

export async function updateOrderItem(
  id: number,
  key: string,
): Promise<EcommerceOrderItem> {
  // Update the order item with the key
  return (await prisma.ecommerce_order_item.update({
    where: { id: id },
    data: { key },
  })) as unknown as EcommerceOrderItem
}

// Remove an order from the system
export async function removeOrder(id: number): Promise<void> {
  await prisma.ecommerce_order.delete({
    where: { id },
  })
}
