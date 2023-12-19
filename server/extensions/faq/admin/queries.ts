import prisma from '~~/utils/prisma'

export async function getTotalFaqCategories(): Promise<number> {
  return await prisma.faq_category.count()
}

export async function getTotalFaqs(): Promise<number> {
  return await prisma.faq.count()
}

export async function getFaqsPerCategory(): Promise<
  { identifier: string; _count: { faqs: number } }[]
> {
  return await prisma.faq_category.findMany({
    select: {
      identifier: true,
      _count: {
        select: {
          faqs: true,
        },
      },
    },
  })
}
