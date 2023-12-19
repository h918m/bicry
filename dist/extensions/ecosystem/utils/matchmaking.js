"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortOrders = exports.addTradeToOrder = exports.validateOrder = exports.filterAndSortOrders = exports.processMatchedOrders = exports.matchAndCalculateOrders = void 0;
const controller_1 = require("../user/exchange/controller");
const queries_1 = require("../user/wallets/queries");
const blockchain_1 = require("./blockchain");
const matchAndCalculateOrders = async (orders, currentOrderBook) => {
    const matchedOrders = [];
    const bookUpdates = { bids: {}, asks: {} };
    const processedOrders = new Set();
    const buyOrders = (0, exports.filterAndSortOrders)(orders, 'BUY', true);
    const sellOrders = (0, exports.filterAndSortOrders)(orders, 'SELL', false);
    let buyIndex = 0, sellIndex = 0;
    while (buyIndex < buyOrders.length && sellIndex < sellOrders.length) {
        const buyOrder = buyOrders[buyIndex];
        const sellOrder = sellOrders[sellIndex];
        if (processedOrders.has(buyOrder.uuid) ||
            processedOrders.has(sellOrder.uuid)) {
            if (processedOrders.has(buyOrder.uuid))
                buyIndex++;
            if (processedOrders.has(sellOrder.uuid))
                sellIndex++;
            continue;
        }
        let matchFound = false;
        if (buyOrder.type === 'LIMIT' && sellOrder.type === 'LIMIT') {
            matchFound =
                (buyOrder.side === 'BUY' && buyOrder.price >= sellOrder.price) ||
                    (buyOrder.side === 'SELL' && sellOrder.price >= buyOrder.price);
        }
        else if (buyOrder.type === 'MARKET' || sellOrder.type === 'MARKET') {
            matchFound = true;
        }
        if (matchFound) {
            processedOrders.add(buyOrder.uuid);
            processedOrders.add(sellOrder.uuid);
            await (0, exports.processMatchedOrders)(buyOrder, sellOrder, currentOrderBook, bookUpdates);
            matchedOrders.push(buyOrder, sellOrder);
            // For Limit orders, increment the index if they are fully filled.
            if (buyOrder.type === 'LIMIT' && buyOrder.remaining === 0n) {
                buyIndex++;
            }
            if (sellOrder.type === 'LIMIT' && sellOrder.remaining === 0n) {
                sellIndex++;
            }
            // For market orders, remove from processed list if they are not fully matched
            if (buyOrder.type === 'MARKET' && buyOrder.remaining > 0n) {
                processedOrders.delete(buyOrder.uuid);
            }
            if (sellOrder.type === 'MARKET' && sellOrder.remaining > 0n) {
                processedOrders.delete(sellOrder.uuid);
            }
        }
        else {
            if (buyOrder.type !== 'MARKET' &&
                BigInt(buyOrder.price) < BigInt(sellOrder.price)) {
                buyIndex++;
            }
            if (sellOrder.type !== 'MARKET' &&
                BigInt(sellOrder.price) > BigInt(buyOrder.price)) {
                sellIndex++;
            }
        }
    }
    return { matchedOrders, bookUpdates };
};
exports.matchAndCalculateOrders = matchAndCalculateOrders;
const SCALING_FACTOR = BigInt(10 ** 18);
const processMatchedOrders = async (buyOrder, sellOrder, currentOrderBook, bookUpdates) => {
    const amountToFill = BigInt(buyOrder.remaining) < BigInt(sellOrder.remaining)
        ? BigInt(buyOrder.remaining)
        : BigInt(sellOrder.remaining);
    updateOrderBook(bookUpdates, buyOrder, currentOrderBook, amountToFill);
    updateOrderBook(bookUpdates, sellOrder, currentOrderBook, amountToFill);
    [buyOrder, sellOrder].forEach((order) => {
        order.filled += amountToFill;
        order.remaining -= amountToFill;
        order.status = order.remaining === 0n ? 'CLOSED' : 'OPEN';
    });
    // Wallet updates
    const [currency, pair] = buyOrder.symbol.split('/');
    const buyerWallet = await (0, queries_1.getWalletOnly)(buyOrder.user_id, currency);
    const sellerWallet = await (0, queries_1.getWalletOnly)(sellOrder.user_id, pair);
    if (buyerWallet && sellerWallet) {
        // Perform the calculations directly using BigInt
        const cost = (amountToFill * BigInt(buyOrder.price)) / SCALING_FACTOR;
        const fee = (cost * BigInt(sellOrder.fee)) / (100n * SCALING_FACTOR);
        // Update the buyer and seller wallets
        await (0, controller_1.updateWalletBalance)(buyerWallet, (0, blockchain_1.fromBigInt)((0, blockchain_1.removeTolerance)(amountToFill)), 'add');
        await (0, controller_1.updateWalletBalance)(sellerWallet, (0, blockchain_1.fromBigInt)((0, blockchain_1.removeTolerance)(cost - fee)), 'add');
    }
    // Create trade detail
    const finalPrice = buyOrder.type === 'MARKET'
        ? sellOrder.price
        : sellOrder.type === 'MARKET'
            ? buyOrder.price
            : buyOrder.price;
    const tradeDetail = {
        uuid: `${buyOrder.uuid}`,
        amount: (0, blockchain_1.fromBigInt)(amountToFill),
        price: (0, blockchain_1.fromBigInt)(finalPrice),
        cost: (0, blockchain_1.fromBigIntMultiply)(amountToFill, finalPrice),
        side: buyOrder.side,
        timestamp: Date.now(),
    };
    addTradeToOrder(buyOrder, tradeDetail);
    addTradeToOrder(sellOrder, tradeDetail);
    return tradeDetail;
};
exports.processMatchedOrders = processMatchedOrders;
const updateOrderBook = (bookUpdates, order, currentOrderBook, amount) => {
    const priceStr = order.price.toString();
    const bookSide = order.side === 'BUY' ? 'bids' : 'asks';
    // Update the current order book first
    if (currentOrderBook[bookSide][priceStr]) {
        currentOrderBook[bookSide][priceStr] -= amount;
    }
    // Then update bookUpdates based on currentOrderBook
    bookUpdates[bookSide][priceStr] = currentOrderBook[bookSide][priceStr];
};
const filterAndSortOrders = (orders, side, isBuy) => {
    return orders
        .filter((o) => o.side === side)
        .sort((a, b) => {
        if (isBuy) {
            return (Number(b.price) - Number(a.price) ||
                a.created_at.getTime() - b.created_at.getTime());
        }
        else {
            return (Number(a.price) - Number(b.price) ||
                a.created_at.getTime() - b.created_at.getTime());
        }
    })
        .filter((order) => !isBuy || BigInt(order.price) >= 0n);
};
exports.filterAndSortOrders = filterAndSortOrders;
function validateOrder(order) {
    if (!order ||
        !order.uuid ||
        !order.user_id ||
        !order.symbol ||
        !order.type ||
        !order.side ||
        typeof order.price !== 'bigint' ||
        typeof order.amount !== 'bigint' ||
        typeof order.filled !== 'bigint' ||
        typeof order.remaining !== 'bigint' ||
        typeof order.cost !== 'bigint' ||
        typeof order.fee !== 'bigint' ||
        !order.fee_currency ||
        !order.status ||
        !(order.created_at instanceof Date) || // Validate if it's a Date object
        !(order.updated_at instanceof Date) // Validate if it's a Date object
    ) {
        console.error('Order validation failed: ', order);
        return false;
    }
    return true;
}
exports.validateOrder = validateOrder;
// Assuming buyOrder.trades and sellOrder.trades are stringified JSON arrays in the database
function addTradeToOrder(order, trade) {
    let trades = [];
    if (order.trades) {
        try {
            trades = JSON.parse(order.trades);
        }
        catch (e) {
            console.error('Error parsing trades', e);
        }
    }
    const mergedTrades = [...trades, trade].sort((a, b) => {
        return a.timestamp - b.timestamp;
    });
    // Update the order's trades
    order.trades = JSON.stringify(mergedTrades, blockchain_1.BigIntReplacer);
    return order.trades;
}
exports.addTradeToOrder = addTradeToOrder;
function sortOrders(orders, isBuy) {
    return orders.sort((a, b) => {
        const priceComparison = isBuy
            ? Number(b.price - a.price)
            : Number(a.price - b.price);
        if (priceComparison !== 0)
            return priceComparison;
        if (a.created_at < b.created_at)
            return -1;
        if (a.created_at > b.created_at)
            return 1;
        return 0;
    });
}
exports.sortOrders = sortOrders;
