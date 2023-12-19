"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAiInvestment = exports.processAiInvestments = exports.checkInvestment = exports.createInvestment = exports.getInvestment = exports.getActiveInvestments = exports.getUserActiveInvestments = exports.getInvestments = void 0;
const date_fns_1 = require("date-fns");
const logger_1 = require("../../../logger");
const types_1 = require("../../../types");
const emails_1 = require("../../../utils/emails");
const passwords_1 = require("../../../utils/passwords");
const prisma_1 = __importDefault(require("../../../utils/prisma"));
// Constants
const ONE_HOUR = 3600 * 1000;
const logger = (0, logger_1.createLogger)('AI Trading Investments');
const investmentInclude = {
    plan: {
        select: {
            id: true,
            name: true,
            title: true,
            description: true,
            image: true,
        },
    },
    user: {
        select: {
            id: true,
            uuid: true,
            avatar: true,
            first_name: true,
            last_name: true,
        },
    },
    duration: {
        select: {
            id: true,
            duration: true,
            timeframe: true,
        },
    },
};
async function getInvestments(userId) {
    return (await prisma_1.default.ai_trading.findMany({
        where: {
            user_id: userId,
            status: {
                not: 'ACTIVE', // Exclude records where status is 'ACTIVE'
            },
        },
        include: investmentInclude,
        orderBy: [
            {
                status: 'asc', // 'asc' for ascending or 'desc' for descending
            },
            {
                created_at: 'asc', // 'asc' for oldest first, 'desc' for newest first
            },
        ],
    }));
}
exports.getInvestments = getInvestments;
async function getUserActiveInvestments(userId) {
    return (await prisma_1.default.ai_trading.findMany({
        where: {
            user_id: userId,
            status: 'ACTIVE',
        },
        select: {
            id: true,
            uuid: true,
            user_id: true,
            plan_id: true,
            duration_id: true,
            market: true,
            amount: true,
            status: true,
            created_at: true,
            updated_at: true,
            plan: {
                select: {
                    id: true,
                    name: true,
                    title: true,
                    description: true,
                    image: true,
                },
            },
            duration: {
                select: {
                    id: true,
                    duration: true,
                    timeframe: true,
                },
            },
        },
        orderBy: [
            {
                status: 'asc',
            },
            {
                created_at: 'asc',
            },
        ],
    }));
}
exports.getUserActiveInvestments = getUserActiveInvestments;
async function getActiveInvestments() {
    return (await prisma_1.default.ai_trading.findMany({
        where: {
            status: 'ACTIVE',
        },
        include: {
            plan: {
                select: {
                    id: true,
                    name: true,
                    title: true,
                    description: true,
                    default_profit: true,
                    default_result: true,
                },
            },
            duration: {
                select: {
                    id: true,
                    duration: true,
                    timeframe: true,
                },
            },
        },
        orderBy: [
            {
                status: 'asc', // 'asc' for ascending or 'desc' for descending
            },
            {
                created_at: 'asc', // 'asc' for oldest first, 'desc' for newest first
            },
        ],
    }));
}
exports.getActiveInvestments = getActiveInvestments;
async function getInvestment(id) {
    return (await prisma_1.default.ai_trading.findUnique({
        where: { id },
        include: investmentInclude,
    }));
}
exports.getInvestment = getInvestment;
async function createInvestment(userId, planId, duration, amount, currency, pair) {
    const user = (await prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
    }));
    if (!user) {
        throw new Error('User not found');
    }
    const plan = (await prisma_1.default.ai_trading_plan.findUnique({
        where: {
            id: planId,
        },
    }));
    if (!plan) {
        throw new Error('Plan not found');
    }
    if (amount < plan.min_amount || amount > plan.max_amount) {
        throw new Error('Amount is not within plan limits');
    }
    const wallet = (await prisma_1.default.wallet.findUnique({
        where: {
            wallet_user_id_currency_type_unique: {
                user_id: userId,
                currency: pair,
                type: 'SPOT',
            },
        },
    }));
    if (!wallet) {
        throw new Error('Wallet not found');
    }
    if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
    }
    const durationData = (await prisma_1.default.ai_trading_duration.findUnique({
        where: {
            id: duration,
        },
    }));
    try {
        const investment = (await prisma_1.default.$transaction(async (prisma) => {
            const investment = await prisma.ai_trading.create({
                data: {
                    uuid: (0, passwords_1.makeUuid)(),
                    user_id: userId,
                    plan_id: planId,
                    market: `${currency}/${pair}`,
                    amount: amount,
                    status: types_1.AiTradingStatus.ACTIVE,
                    duration_id: duration,
                },
                include: investmentInclude,
            });
            await prisma.wallet.update({
                where: {
                    wallet_user_id_currency_type_unique: {
                        user_id: userId,
                        currency: pair,
                        type: 'SPOT',
                    },
                },
                data: {
                    balance: wallet.balance - amount,
                },
            });
            await prisma.transaction.create({
                data: {
                    uuid: (0, passwords_1.makeUuid)(),
                    user_id: userId,
                    wallet_id: wallet.id,
                    amount: amount,
                    description: `Investment: Plan "${plan.title}" | Duration: ${durationData.duration} ${durationData.timeframe}`,
                    status: 'COMPLETED',
                    type: 'AI_INVESTMENT',
                    reference_id: investment.uuid,
                },
            });
            return investment;
        }));
        try {
            await (0, emails_1.sendAiInvestmentEmail)(user, investment, 'NewAiInvestmentCreated');
        }
        catch (error) {
            logger.error(`Error sending email: ${error.message}`);
        }
        return investment;
    }
    catch (error) {
        logger.error(`Error creating investment: ${error.message}`);
    }
}
exports.createInvestment = createInvestment;
async function fetchTransactionByReferenceId(referenceId) {
    return prisma_1.default.transaction.findUnique({
        where: { reference_id: referenceId },
    });
}
async function fetchWalletById(walletId) {
    return prisma_1.default.wallet.findUnique({
        where: { id: walletId },
    });
}
async function checkInvestment(uuid) {
    const investment = (await prisma_1.default.ai_trading.findUnique({
        where: { uuid },
        include: {
            plan: {
                select: {
                    id: true,
                    name: true,
                    title: true,
                    description: true,
                    default_profit: true,
                    default_result: true,
                },
            },
            duration: {
                select: {
                    id: true,
                    duration: true,
                    timeframe: true,
                },
            },
        },
    }));
    if (!investment) {
        throw new Error('Investment not found');
    }
    return await processAiInvestment(investment);
}
exports.checkInvestment = checkInvestment;
async function processAiInvestments() {
    const activeInvestments = await getActiveInvestments();
    for (const investment of activeInvestments) {
        try {
            await processAiInvestment(investment);
        }
        catch (error) {
            logger.error(`Error processing investment: ${error.message}`);
            continue;
        }
    }
}
exports.processAiInvestments = processAiInvestments;
async function processAiInvestment(investment) {
    const { id, duration, created_at, amount, profit, result, plan } = investment;
    const roi = profit || plan.default_profit;
    const investment_result = result || plan.default_result;
    let endDate;
    switch (duration.timeframe) {
        case 'HOUR':
            endDate = (0, date_fns_1.addHours)(new Date(created_at), duration.duration);
            break;
        case 'DAY':
            endDate = (0, date_fns_1.addDays)(new Date(created_at), duration.duration);
            break;
        case 'WEEK':
            endDate = (0, date_fns_1.addDays)(new Date(created_at), duration.duration * 7);
            break;
        case 'MONTH':
            endDate = (0, date_fns_1.addDays)(new Date(created_at), duration.duration * 30);
            break;
        default:
            endDate = (0, date_fns_1.addHours)(new Date(created_at), duration.duration);
            break;
    }
    if ((0, date_fns_1.isPast)(endDate)) {
        let updatedInvestment;
        try {
            const transaction = await fetchTransactionByReferenceId(investment.uuid);
            if (!transaction)
                throw new Error('Transaction not found');
            const wallet = await fetchWalletById(transaction.wallet_id);
            if (!wallet)
                throw new Error('Wallet not found');
            let newBalance = wallet.balance;
            if (investment_result === 'WIN') {
                newBalance += amount + roi;
            }
            else if (investment_result === 'LOSS') {
                newBalance += amount - roi;
            }
            else {
                newBalance += amount;
            }
            // Update Wallet
            updatedInvestment = await prisma_1.default.$transaction(async (prisma) => {
                await prisma.wallet.update({
                    where: { id: wallet.id },
                    data: { balance: newBalance },
                });
                await prisma.transaction.create({
                    data: {
                        uuid: (0, passwords_1.makeUuid)(),
                        user_id: wallet.user_id,
                        wallet_id: wallet.id,
                        amount: investment_result === 'WIN'
                            ? roi
                            : investment_result === 'LOSS'
                                ? -roi
                                : 0,
                        description: `Investment ROI: Plan "${investment.plan.title}" | Duration: ${investment.duration.duration} ${investment.duration.timeframe}`,
                        status: 'COMPLETED',
                        type: 'AI_INVESTMENT_ROI',
                    },
                });
                const updatedAiTrading = await prisma.ai_trading.update({
                    where: { id },
                    data: {
                        status: types_1.AiTradingStatus.COMPLETED,
                        result: investment_result,
                        profit: roi,
                    },
                    include: investmentInclude,
                });
                return updatedAiTrading;
            });
        }
        catch (error) {
            logger.error(`Error processing investment: ${error.message}`);
        }
        if (updatedInvestment) {
            try {
                if (!updatedInvestment)
                    throw new Error('Investment not found');
                const user = (await prisma_1.default.user.findUnique({
                    where: {
                        id: investment.user_id,
                    },
                }));
                if (!user)
                    throw new Error('User not found');
                await (0, emails_1.sendAiInvestmentEmail)(user, updatedInvestment, 'AiInvestmentCompleted');
            }
            catch (error) {
                logger.error(`Error sending email: ${error.message}`);
            }
        }
        return updatedInvestment;
    }
}
exports.processAiInvestment = processAiInvestment;
