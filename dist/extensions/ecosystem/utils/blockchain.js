"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigIntReplacer = exports.getCachedTokenDecimals = exports.cacheTokenDecimals = exports.convertBigInt = exports.toWei = exports.fromWei = exports.fromBigIntMultiply = exports.fromBigInt = exports.removeTolerance = exports.toBigIntFloat = exports.toBigInt = exports.decodeTransactionData = exports.extractTransactionInfo = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const redis_1 = require("../../../utils/redis");
const queries_1 = require("../admin/tokens/queries");
const extractTransactionInfo = (tx) => {
    let targetAddress = null;
    let details = null;
    if (tx.data.startsWith('0x')) {
        if (tx.data === '0x') {
            targetAddress = tx.to;
            details = 'Direct transfer of main blockchain token';
        }
        else {
            const methodID = tx.data.substring(0, 10);
            switch (methodID) {
                case '0xa9059cbb':
                    targetAddress = `0x${tx.data.substring(34, 74)}`.toLowerCase();
                    const amount = parseInt(tx.data.substring(74, 138), 16);
                    details = `ERC20 token transfer of ${amount} tokens`;
                    break;
                case '0xf340fa01':
                    targetAddress = `0x${tx.data.substring(34, 74)}`.toLowerCase();
                    details = 'Deposit with an upline';
                    break;
                default:
                    details = 'Unknown function';
                    break;
            }
        }
    }
    return { targetAddress, details };
};
exports.extractTransactionInfo = extractTransactionInfo;
function decodeTransactionData(data) {
    if (data.startsWith('0xa9059cbb')) {
        const to = '0x' + data.slice(34, 74);
        const amount = BigInt(`0x${data.slice(74, 138)}`);
        return { type: 'ERC20', to, amount };
    }
    else if (data.startsWith('0xf340fa01')) {
        const to = '0x' + data.slice(34, 74);
        return { type: 'Deposit', to };
    }
    else if (data === '0x') {
        return { type: 'Native' };
    }
    else {
        return { type: 'Unknown' };
    }
}
exports.decodeTransactionData = decodeTransactionData;
function toBigInt(value) {
    const bigNumber = new bignumber_js_1.default(value);
    const scaledNumber = bigNumber.shiftedBy(18);
    return BigInt(scaledNumber.toFixed());
}
exports.toBigInt = toBigInt;
function toBigIntFloat(number) {
    const bigNumber = new bignumber_js_1.default(number);
    const scaledNumber = bigNumber.shiftedBy(18);
    return BigInt(scaledNumber.toFixed());
}
exports.toBigIntFloat = toBigIntFloat;
function removeTolerance(bigintValue, toleranceDigits = 2) {
    const bigNumberValue = new bignumber_js_1.default(bigintValue.toString());
    const tolerance = new bignumber_js_1.default(10).pow(toleranceDigits);
    if (bigNumberValue.isLessThan(tolerance)) {
        return bigintValue;
    }
    return BigInt(bigNumberValue
        .dividedToIntegerBy(tolerance)
        .multipliedBy(tolerance)
        .toFixed());
}
exports.removeTolerance = removeTolerance;
function fromBigInt(value) {
    const bigNumberValue = new bignumber_js_1.default(value.toString());
    return bigNumberValue.shiftedBy(-18).toNumber();
}
exports.fromBigInt = fromBigInt;
function fromBigIntMultiply(value1, value2) {
    const bigNumberValue1 = new bignumber_js_1.default(value1.toString());
    const bigNumberValue2 = new bignumber_js_1.default(value2.toString());
    const result = bigNumberValue1.multipliedBy(bigNumberValue2).shiftedBy(-36);
    return result.toNumber();
}
exports.fromBigIntMultiply = fromBigIntMultiply;
function fromWei(value) {
    return value / Math.pow(10, 18);
}
exports.fromWei = fromWei;
function toWei(value) {
    return value * Math.pow(10, 18);
}
exports.toWei = toWei;
function convertBigInt(obj) {
    if (Array.isArray(obj)) {
        return obj.map((item) => convertBigInt(item));
    }
    else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (obj[key] instanceof Date) {
                newObj[key] = obj[key].toISOString();
            }
            else if (typeof obj[key] === 'bigint') {
                newObj[key] = fromBigInt(obj[key]);
            }
            else {
                newObj[key] = convertBigInt(obj[key]);
            }
        }
        return newObj;
    }
    else if (typeof obj === 'bigint') {
        return obj.toString(); // Fallback to string if we don't have the token decimals
    }
    else {
        return obj;
    }
}
exports.convertBigInt = convertBigInt;
async function cacheTokenDecimals() {
    const tokenDecimals = await (0, queries_1.getTokenDecimal)();
    await redis_1.redis.setex('token_decimals', 86000, JSON.stringify(tokenDecimals));
    console.log('Cached token decimals');
}
exports.cacheTokenDecimals = cacheTokenDecimals;
async function getCachedTokenDecimals() {
    let cachedData = await redis_1.redis.get('token_decimals');
    if (cachedData) {
        return JSON.parse(cachedData);
    }
    // If cache is empty, populate it.
    await cacheTokenDecimals();
    // Fetch again after populating.
    cachedData = await redis_1.redis.get('token_decimals');
    if (cachedData) {
        return JSON.parse(cachedData);
    }
    // Return an empty object if it still fails.
    return {};
}
exports.getCachedTokenDecimals = getCachedTokenDecimals;
const BigIntReplacer = (key, value) => {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
};
exports.BigIntReplacer = BigIntReplacer;
