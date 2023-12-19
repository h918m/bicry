import type { Faq } from '~~/types'
import prisma from '~~/utils/prisma'

// List all FAQs
export async function listFaqs(): Promise<Faq[]> {
  return prisma.faq.findMany({
    include: {
      category: true, // Include the category details
    },
  }) as unknown as Faq[]
}

// Get a single FAQ by ID
export async function getFaqById(id: number): Promise<Faq | null> {
  return prisma.faq.findUnique({
    where: { id },
    include: {
      category: true,
    },
  }) as unknown as Faq | null
}
