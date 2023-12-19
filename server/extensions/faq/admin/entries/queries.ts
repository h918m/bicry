import type { Faq } from '~~/types'
import prisma from '~~/utils/prisma'

// List all FAQs
export async function listFaqs(): Promise<Faq[]> {
  return prisma.faq.findMany({
    include: {
      category: true, // Ensure to include the category details
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

// Create a new FAQ
export async function createFaq(
  question: string,
  answer: string,
  faq_category_id: number,
): Promise<Faq> {
  return prisma.faq.create({
    data: {
      question,
      answer,
      faq_category_id,
    },
  }) as unknown as Faq
}

// Update an existing FAQ
export async function updateFaq(
  id: number,
  question: string,
  answer: string,
): Promise<Faq> {
  return prisma.faq.update({
    where: { id },
    data: {
      question,
      answer,
    },
  }) as unknown as Faq
}

// Delete an FAQ
export async function deleteFaq(id: number): Promise<Faq> {
  return prisma.faq.delete({
    where: { id },
  }) as unknown as Faq
}
