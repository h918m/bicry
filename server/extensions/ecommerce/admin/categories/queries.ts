import type { EcommerceCategory, EcommerceCategoryStatus } from '~~/types' // assuming you have defined types elsewhere
import prisma from '~~/utils/prisma'

// List all categories
export async function listCategories(): Promise<EcommerceCategory[]> {
  return prisma.ecommerce_category.findMany({
    include: {
      products: true,
    },
  }) as unknown as EcommerceCategory[]
}

// Create a new category
export async function createCategory(
  name: string,
  description: string,
  image?: string,
): Promise<EcommerceCategory> {
  return prisma.ecommerce_category.create({
    data: { name, description, status: 'ACTIVE', image },
  }) as unknown as EcommerceCategory
}

// Update a category
export async function updateCategory(
  id: number,
  name: string,
  description: string,
  status: EcommerceCategoryStatus,
  image?: string,
): Promise<EcommerceCategory> {
  return prisma.ecommerce_category.update({
    where: { id },
    data: { name, description, status, image },
  }) as unknown as EcommerceCategory
}

// Delete a category
export async function deleteCategory(id: number): Promise<void> {
  await prisma.ecommerce_category.delete({
    where: { id },
  })
}
