import type { EcommerceProduct } from '~~/types' // Assuming you have defined this type
import prisma from '~~/utils/prisma'

// List all products
export async function listProducts(): Promise<EcommerceProduct[]> {
  return prisma.ecommerce_product.findMany({
    where: {
      status: 'ACTIVE', // Assuming we only want to list active products
    },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      price: true,
      category_id: true,
      inventory_quantity: true,
      image: true,
      currency: true,
      wallet_type: true,
      created_at: true,
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              uuid: true,
              first_name: true,
              last_name: true,
              avatar: true,
            },
          },
        },
      },
    },
  }) as unknown as EcommerceProduct[]
}

// Get a single product by its ID
export async function getProductById(
  id: number,
): Promise<EcommerceProduct | null> {
  return prisma.ecommerce_product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      price: true,
      category_id: true,
      inventory_quantity: true,
      status: true,
      image: true,
      currency: true,
      wallet_type: true,
      created_at: true,
      updated_at: true,
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              uuid: true,
              first_name: true,
              last_name: true,
              avatar: true,
            },
          },
        },
      },
    },
  }) as unknown as EcommerceProduct | null
}
