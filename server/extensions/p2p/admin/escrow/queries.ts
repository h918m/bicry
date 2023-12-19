import type { P2PEscrow } from '~~/types'
import prisma from '~~/utils/prisma'

// List all P2P Escrows
export async function listEscrows(): Promise<P2PEscrow[]> {
  return prisma.p2p_escrow.findMany() as unknown as P2PEscrow[]
}

// Get a single P2P Escrow
export async function showEscrow(id: number): Promise<P2PEscrow | null> {
  return prisma.p2p_escrow.findUnique({
    where: { id },
  }) as unknown as P2PEscrow | null
}
