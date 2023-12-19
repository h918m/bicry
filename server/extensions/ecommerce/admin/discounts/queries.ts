import type { EcommerceDiscount, EcommerceDiscountStatus } from '~~/types' // assuming you have defined types elsewhere
import prisma from '~~/utils/prisma'

// List all discounts
export async function getDiscounts(): Promise<EcommerceDiscount[]> {
  return prisma.ecommerce_discount.findMany({
    include: { product: true },
  }) as unknown as EcommerceDiscount[]
}

// List discounts for a product
export async function listDiscountsByProductId(
  product_id: number,
): Promise<EcommerceDiscount[]> {
  return prisma.ecommerce_discount.findMany({
    where: { product_id },
    include: { product: true },
  }) as unknown as EcommerceDiscount[]
}

// Create a discount
export async function createDiscount(
  code: string,
  percentage: number,
  valid_until: Date,
  product_id: number,
): Promise<EcommerceDiscount> {
  return prisma.ecommerce_discount.create({
    data: {
      code,
      percentage,
      valid_until,
      product_id,
      status: 'ACTIVE',
    },
  }) as unknown as EcommerceDiscount
}

// Update a discount
export async function updateDiscount(
  id: number,
  code: string,
  percentage: number,
  valid_until: Date,
  product_id: number,
  status: EcommerceDiscountStatus,
): Promise<EcommerceDiscount> {
  return prisma.ecommerce_discount.update({
    where: { id },
    data: {
      code,
      percentage,
      valid_until,
      product_id,
      status,
    },
  }) as unknown as EcommerceDiscount
}

// Delete a discount
export async function deleteDiscount(id: number): Promise<void> {
  await prisma.ecommerce_discount.delete({
    where: { id },
  })
}
