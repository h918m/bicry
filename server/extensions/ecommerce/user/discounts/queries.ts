import type { EcommerceDiscount } from '~~/types'
import prisma from '~~/utils/prisma'

export async function applyDiscount(
  user_id: number,
  product_id: number,
  code: string,
): Promise<EcommerceDiscount> {
  const discount = await prisma.ecommerce_discount.findFirst({
    where: {
      product_id: Number(product_id),
      code,
    },
  })

  if (!discount) {
    throw new Error('Discount not found')
  }

  if (discount.status === 'INACTIVE') {
    throw new Error('Discount is disabled')
  }

  if (discount.valid_until && discount.valid_until < new Date()) {
    throw new Error('Discount has expired')
  }

  // Check if user already has this discount
  const existingDiscount = await prisma.ecommerce_user_discount.findFirst({
    where: {
      user_id: user_id,
      discount_id: discount.id,
    },
  })

  if (existingDiscount && existingDiscount.status === 'INACTIVE') {
    throw new Error('Discount already applied')
  }

  if (existingDiscount && existingDiscount.status === 'ACTIVE') {
    return discount as unknown as EcommerceDiscount
  }

  // Create a new user discount
  await prisma.ecommerce_user_discount.create({
    data: {
      user_id: user_id,
      discount_id: discount.id,
    },
  })

  return discount as unknown as EcommerceDiscount
}
