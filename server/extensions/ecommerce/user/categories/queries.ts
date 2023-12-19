import type { EcommerceCategory } from '~~/types'
import prisma from '~~/utils/prisma'

// List all categories with their active products
export async function listCategories(): Promise<EcommerceCategory[]> {
  return prisma.ecommerce_category.findMany({
    include: {
      products: {
        where: {
          status: 'ACTIVE',
        },
        orderBy: {
          name: 'asc',
        },
        include: {
          reviews: {
            include: {
              user: {
                select: {
                  uuid: true,
                  first_name: true,
                  last_name: true,
                  avatar: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  }) as unknown as EcommerceCategory[]
}

// Get a single category by ID with its active products
export async function getCategoryById(
  id: number,
): Promise<EcommerceCategory | null> {
  return prisma.ecommerce_category.findUnique({
    where: { id },
    include: {
      products: {
        where: {
          status: 'ACTIVE',
        },
        orderBy: {
          name: 'asc',
        },
        include: {
          reviews: {
            include: {
              user: {
                select: {
                  uuid: true,
                  first_name: true,
                  last_name: true,
                  avatar: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  }) as unknown as EcommerceCategory | null
}
