import type { FaqCategory } from '~~/types'
import prisma from '~~/utils/prisma'

// List all FAQ categories
export async function listCategories(): Promise<FaqCategory[]> {
  return prisma.faq_category.findMany({
    include: {
      faqs: true,
    },
  }) as unknown as FaqCategory[]
}

// Get a single FAQ category by its identifier
export async function getCategoryByIdentifier(
  identifier: string,
): Promise<FaqCategory | null> {
  return prisma.faq_category.findUnique({
    where: { identifier },
    include: {
      faqs: true, // Include the FAQs related to this category
    },
  }) as unknown as FaqCategory | null
}
