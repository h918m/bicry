"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeOrder = exports.updateOrderItem = exports.updateOrder = exports.getOrderDetailsById = exports.listAllOrders = void 0;
const emails_1 = require("~~/utils/emails");
const prisma_1 = __importDefault(require("~~/utils/prisma"));
// List all orders
async function listAllOrders() {
    return prisma_1.default.ecommerce_order.findMany({
        include: {
            user: {
                select: {
                    uuid: true,
                    first_name: true,
                    last_name: true,
                    avatar: true,
                },
            },
            order_items: {
                include: {
                    product: true,
                },
            },
        },
    });
}
exports.listAllOrders = listAllOrders;
// Get details for a specific order by ID
async function getOrderDetailsById(id) {
    return prisma_1.default.ecommerce_order.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    uuid: true,
                    first_name: true,
                    last_name: true,
                    avatar: true,
                },
            },
            order_items: {
                include: {
                    product: true,
                },
            },
        },
    });
}
exports.getOrderDetailsById = getOrderDetailsById;
// Update the status of an order
async function updateOrder(id, status) {
    const order = (await prisma_1.default.ecommerce_order.update({
        where: { id },
        data: { status },
    }));
    try {
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: order.user_id,
            },
        });
        // where to get the product , order_items
        await (0, emails_1.sendOrderStatusUpdateEmail)(user, order);
    }
    catch (error) {
        console.error(error);
    }
    return order;
}
exports.updateOrder = updateOrder;
async function updateOrderItem(id, key) {
    // Update the order item with the key
    return (await prisma_1.default.ecommerce_order_item.update({
        where: { id: id },
        data: { key },
    }));
}
exports.updateOrderItem = updateOrderItem;
// Remove an order from the system
async function removeOrder(id) {
    await prisma_1.default.ecommerce_order.delete({
        where: { id },
    });
}
exports.removeOrder = removeOrder;
