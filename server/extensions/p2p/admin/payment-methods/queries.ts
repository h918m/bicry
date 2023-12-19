import type { P2PPaymentMethod } from '~~/types'
import prisma from '~~/utils/prisma'

// List all P2P Payment Methods
export async function listPaymentMethods(): Promise<P2PPaymentMethod[]> {
  return prisma.p2p_payment_method.findMany({
    include: {
      user: {
        select: {
          first_name: true,
          last_name: true,
          uuid: true,
          avatar: true,
        },
      },
      offer: {
        select: {
          uuid: true,
        },
      },
    },
  }) as unknown as P2PPaymentMethod[]
}

// Update a P2P Payment Method
export async function updatePaymentMethod(
  id: number,
  name: string,
  instructions: string,
  status: boolean,
  currency: string,
  image?: string,
): Promise<P2PPaymentMethod> {
  return prisma.p2p_payment_method.update({
    where: { id },
    data: { name, instructions, status, currency, image },
  }) as unknown as P2PPaymentMethod
}

// Delete a P2P Payment Method
export async function deletePaymentMethod(id: number): Promise<void> {
  await prisma.p2p_payment_method.delete({
    where: { id },
  })
}
