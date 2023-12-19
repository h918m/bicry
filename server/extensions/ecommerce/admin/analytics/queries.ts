import prisma from '~~/utils/prisma'

export async function getTotalEcommerceProducts(): Promise<number> {
  return prisma.ecommerce_product.count()
}

export async function getActiveEcommerceProducts(): Promise<number> {
  return prisma.ecommerce_product.count({
    where: {
      status: 'ACTIVE',
    },
  })
}

export async function getTotalEcommerceOrders(): Promise<number> {
  return prisma.ecommerce_order.count()
}

export async function getCompletedEcommerceOrders(): Promise<number> {
  return prisma.ecommerce_order.count({
    where: {
      status: 'COMPLETED', // or whatever status indicates a completed order in your system
    },
  })
}
