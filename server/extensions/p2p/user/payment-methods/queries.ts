import type { P2PPaymentMethod } from '~~/types'
import prisma from '~~/utils/prisma'

// List user's payment methods
export async function listUserPaymentMethods(
  userId: number,
): Promise<P2PPaymentMethod[]> {
  return prisma.p2p_payment_method.findMany({
    where: { user_id: userId },
  }) as unknown as P2PPaymentMethod[]
}

// Get a single user's payment method
export async function showUserPaymentMethod(
  id: number,
  userId: number,
): Promise<P2PPaymentMethod | null> {
  return prisma.p2p_payment_method.findFirst({
    where: { id, user_id: userId },
  }) as unknown as P2PPaymentMethod | null
}

// Create a new user's payment method
export async function createUserPaymentMethod(
  userId: number,
  name: string,
  instructions: string,
  currency: string,
  image?: string,
): Promise<P2PPaymentMethod> {
  return prisma.p2p_payment_method.create({
    data: {
      user_id: userId,
      name,
      instructions,
      image,
      currency,
      status: true,
    },
  }) as unknown as P2PPaymentMethod
}

export async function updateUserPaymentMethod(
  id: number,
  userId: number,
  name: string,
  instructions: string,
  currency: string,
  image?: string,
): Promise<P2PPaymentMethod> {
  return prisma.p2p_payment_method.update({
    where: { id, user_id: userId },
    data: {
      name,
      instructions,
      image,
      currency,
    },
  }) as unknown as P2PPaymentMethod
}

// Delete a user's payment method
export async function deleteUserPaymentMethod(
  id: number,
  userId: number,
): Promise<P2PPaymentMethod | null> {
  const method = await prisma.p2p_payment_method.findFirst({
    where: { id, user_id: userId },
    include: { offer: true },
  })
  if (method?.offer.length) {
    throw new Error(
      'Cannot delete payment method because it is in use by an offer',
    )
  }
  return prisma.p2p_payment_method.delete({
    where: { id, user_id: userId },
  }) as unknown as P2PPaymentMethod | null
}
