import type {
  EcommerceProduct,
  EcommerceProductStatus,
  WalletType,
} from '~~/types' // assuming you have defined types elsewhere
import prisma from '~~/utils/prisma'

// List all products
export async function listProducts(): Promise<EcommerceProduct[]> {
  return prisma.ecommerce_product.findMany({
    include: {
      category: true,
      reviews: true,
      order_items: true,
      discounts: true,
    },
  }) as unknown as EcommerceProduct[]
}

// Get product details by ID
export async function getProductById(
  id: number,
): Promise<EcommerceProduct | null> {
  return prisma.ecommerce_product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: true,
      order_items: true,
      discounts: true,
    },
  }) as unknown as EcommerceProduct | null
}

// Create a new product
export async function createProduct(
  name: string,
  description: string,
  type: string,
  price: number,
  currency: string,
  wallet_type: WalletType,
  category_id: number,
  inventory_quantity: number,
  file_path: string | null,
  image: string | null,
): Promise<EcommerceProduct> {
  return prisma.ecommerce_product.create({
    data: {
      name,
      description,
      type,
      price,
      currency,
      wallet_type,
      category_id,
      inventory_quantity,
      file_path,
      status: 'ACTIVE',
      image,
    },
  }) as unknown as EcommerceProduct
}

// Update a product
export async function updateProduct(
  id: number,
  name: string,
  description: string,
  type: string,
  price: number,
  currency: string,
  wallet_type: WalletType,
  category_id: number,
  inventory_quantity: number,
  file_path: string | null,
  status: EcommerceProductStatus,
  image: string | null,
): Promise<EcommerceProduct> {
  return prisma.ecommerce_product.update({
    where: { id },
    data: {
      name,
      description,
      type,
      price,
      currency,
      wallet_type,
      category_id,
      inventory_quantity,
      file_path,
      status,
      image,
    },
  }) as unknown as EcommerceProduct
}

// Delete a product
export async function deleteProduct(id: number): Promise<void> {
  await prisma.ecommerce_product.delete({
    where: { id },
  })
}
