"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendP2POfferAmountDepletionEmail = exports.sendP2PReviewNotificationEmail = exports.sendP2PTradePaymentConfirmationEmail = exports.sendP2PTradeCancellationEmail = exports.sendP2PTradeCompletionEmail = exports.sendP2PDisputeClosingEmail = exports.sendP2PDisputeResolvingEmail = exports.sendP2PDisputeResolutionEmail = exports.sendP2PDisputeOpenedEmail = exports.sendP2PTradeReplyEmail = exports.sendP2PTradeSaleConfirmationEmail = exports.sendP2PReviewEmail = exports.sendP2PTradeDisputeEmail = exports.sendP2PTradeStatusUpdateEmail = exports.sendP2PNewTradeEmail = exports.sendOrderStatusUpdateEmail = exports.sendOrderConfirmationEmail = exports.sendStakingRewardEmail = exports.sendStakingInitiationEmail = exports.sendIcoContributionEmail = exports.sendForexTransactionEmail = exports.sendForexInvestmentEmail = exports.sendAiInvestmentEmail = exports.sendSpotWalletDepositConfirmationEmail = exports.sendSpotWalletWithdrawalConfirmationEmail = exports.sendIncomingTransferEmail = exports.sendOutgoingTransferEmail = exports.sendAuthorStatusUpdateEmail = exports.sendTransactionStatusUpdateEmail = exports.sendWalletBalanceUpdateEmail = exports.sendBinaryOrderEmail = exports.sendFiatTransactionEmail = exports.sendChatEmail = exports.sendInvestmentEmail = exports.sendKycEmail = exports.replaceTemplateVariables = exports.emailWithNodemailerSmtp = exports.emailWithNodemailerService = exports.emailWithSendgrid = exports.sendEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const index_1 = require("./index");
const prisma_1 = __importDefault(require("./prisma"));
const logger_1 = require("../logger");
const logger = (0, logger_1.createLogger)('Email');
const rootPath = `${process.cwd()}/.app`;
const APP_EMAILER = process.env.APP_EMAILER || 'nodemailer-service';
const APP_NODEMAILER_SERVICE = process.env.APP_NODEMAILER_SERVICE || '';
const APP_NODEMAILER_SERVICE_SENDER = process.env.APP_NODEMAILER_SERVICE_SENDER || '';
const APP_NODEMAILER_SERVICE_PASSWORD = process.env.APP_NODEMAILER_SERVICE_PASSWORD || '';
const APP_NODEMAILER_SMTP_SENDER = process.env.APP_NODEMAILER_SMTP_SENDER || '';
const APP_NODEMAILER_SMTP_PASSWORD = process.env.APP_NODEMAILER_SMTP_PASSWORD || '';
const APP_NODEMAILER_SMTP_HOST = process.env.APP_NODEMAILER_SMTP_HOST || 'smtp.gmail.com';
const APP_NODEMAILER_SMTP_PORT = process.env.APP_NODEMAILER_SMTP_PORT || '465';
const APP_NODEMAILER_SMTP_ENCRYPTION = process.env.APP_NODEMAILER_SMTP_ENCRYPTION || 'ssl';
const APP_SENDGRID_API_KEY = process.env.APP_SENDGRID_API_KEY || '';
const APP_SENDGRID_SENDER = process.env.APP_SENDGRID_SENDER || '';
const APP_PUBLIC_URL = process.env.APP_PUBLIC_URL || '';
const APP_PUBLIC_SITE_NAME = process.env.APP_PUBLIC_SITE_NAME || '';
async function sendEmail(specificVariables, templateName) {
    let processedTemplate;
    let processedSubject;
    let templateRecord;
    try {
        const result = await fetchAndProcessEmailTemplate(specificVariables, templateName);
        processedTemplate = result.processedTemplate;
        processedSubject = result.processedSubject; // New line
        templateRecord = result.templateRecord;
    }
    catch (error) {
        return error;
    }
    const finalEmailHtml = await prepareEmailTemplate(processedTemplate, processedSubject);
    const options = {
        to: specificVariables['TO'],
        subject: processedSubject,
        html: finalEmailHtml,
    };
    const emailer = APP_EMAILER;
    try {
        return await sendEmailWithProvider(emailer, options);
    }
    catch (error) {
        return error;
    }
}
exports.sendEmail = sendEmail;
async function sendEmailWithProvider(provider, options) {
    if (provider === 'nodemailer-service') {
        options.from = APP_NODEMAILER_SERVICE_SENDER;
        return await emailWithNodemailerService(APP_NODEMAILER_SERVICE_SENDER, APP_NODEMAILER_SERVICE_PASSWORD, APP_NODEMAILER_SERVICE, options);
    }
    if (provider === 'nodemailer-smtp') {
        options.from = APP_NODEMAILER_SMTP_SENDER;
        return await emailWithNodemailerSmtp(APP_NODEMAILER_SMTP_SENDER, APP_NODEMAILER_SMTP_PASSWORD, APP_NODEMAILER_SMTP_HOST, APP_NODEMAILER_SMTP_PORT, APP_NODEMAILER_SMTP_ENCRYPTION === 'ssl', options);
    }
    if (provider === 'nodemailer-sendgrid') {
        options.from = APP_SENDGRID_SENDER;
        return await emailWithSendgrid(options);
    }
    throw (0, index_1.createError)({
        statusCode: 500,
        statusMessage: 'Unknown email provider',
    });
}
/**
 * @desc Sends email with Sendgrid
 * @param options Email message options like to, from etc.
 * @returns {Promise<Error | true>}
 */
async function emailWithSendgrid(options) {
    const apiKey = APP_SENDGRID_API_KEY;
    let emailError = null;
    // If Sendgrid api key not found
    if (!apiKey) {
        logger.error('Sendgrid Api key not found. Cannot send email. Aborting.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Attempting to send mail with Sendgrid
    mail_1.default.setApiKey(apiKey);
    // Create messag object
    const msg = {
        to: options.to,
        from: options.from,
        subject: options.subject,
        html: options.html ? options.html : options.text,
    };
    await mail_1.default.send(msg).catch((error) => {
        logger.error(`Error when sending email in Sendgrid: ${error}`);
        emailError = error;
    });
    // If error, return error
    if (emailError) {
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // If successful
    return true;
}
exports.emailWithSendgrid = emailWithSendgrid;
/**
 *@desc Sends email using Nodemailer service (e.g. hotmail)
 * @param sender Sender's email address
 * @param password Sender's password
 * @param service Sender's service such as hotmail
 * @param options Options for email such as to, from, subject etc.
 * @returns
 */
async function emailWithNodemailerService(sender, password, service, options) {
    // Error flag
    let errorFound = null;
    const emailOptions = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };
    if (!service) {
        logger.error('Error: Email service not specified. Aborting email send.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Check for email user
    if (!sender) {
        logger.error('Error: Email user not specified. Aborting email send.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Check for password
    if (!password) {
        logger.error('Error: Email password not specified. Aborting email send.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Create transporter
    const transporter = nodemailer_1.default.createTransport({
        service: service,
        auth: {
            user: sender,
            pass: password,
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
        },
    });
    // Check if email server is ready to take our messages
    transporter.verify(function (error, success) {
        if (error) {
            logger.error(`Error when verifying email server: ${error}`);
            errorFound = error;
        }
    });
    // If transporter verify error, return
    if (errorFound)
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    // Attempt to send email
    transporter.sendMail(emailOptions, (err, result) => {
        // If error, log error and return
        if (err) {
            logger.error(`Error when sending email: ${err}`);
            errorFound = err;
        }
    });
    // If errorFound, return error
    if (errorFound)
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    // Otherwise successful
    return true;
}
exports.emailWithNodemailerService = emailWithNodemailerService;
/**
 * @desc Sends email using Nodemailer SMTP
 * @param sender Sender's email address
 * @param password Sender's password
 * @param host Email server host
 * @param port Email server port
 * @param options Options for email such as to, from, subject etc.
 * @returns
 */
async function emailWithNodemailerSmtp(sender, password, host, port, smtpEncryption, options) {
    // Error flag
    let errorFound = null;
    const emailOptions = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };
    // Sending email using nodemailer-service
    if (!host) {
        logger.error('Error: Email host not specified. Aborting email send.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Check for email user
    if (!sender) {
        logger.error('Error: Email user not specified. Aborting email send.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Check for password
    if (!sender) {
        logger.error('Error: Email password not specified. Aborting email send.');
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    }
    // Create transporter
    const transporter = nodemailer_1.default.createTransport({
        host: host,
        port: port,
        pool: true,
        secure: false,
        auth: {
            user: sender,
            pass: password,
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
        },
    });
    // Check if email server is ready to take our messages
    transporter.verify(function (error, success) {
        if (error) {
            logger.error(`Error when verifying email server: ${error}`);
            errorFound = error;
        }
    });
    // If transporter verify error, return
    if (errorFound)
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    // Attempt to send email
    transporter.sendMail(emailOptions, (err, result) => {
        // If error, log error and return
        if (err) {
            logger.error(`Error when sending email: ${err}`);
            errorFound = err;
        }
    });
    // If errorFound, return error
    if (errorFound)
        throw (0, index_1.createError)({ statusCode: 500, statusMessage: 'Server error' });
    // Otherwise successful
    return true;
}
exports.emailWithNodemailerSmtp = emailWithNodemailerSmtp;
// Function to prepare the email template
async function prepareEmailTemplate(processedTemplate, processedSubject) {
    const generalTemplate = fs_1.default.readFileSync(`${rootPath}/data/emails/generalTemplate.html`, 'utf-8');
    if (!generalTemplate) {
        logger.error('General email template not found');
        throw (0, index_1.createError)({
            statusCode: 500,
            statusMessage: 'General email template not found',
        });
    }
    // Fetching both 'full_logo' and 'site_name' in a single query
    const settings = await prisma_1.default.settings.findMany({
        where: {
            key: {
                in: ['full_logo', 'site_name'],
            },
        },
    });
    // Convert the settings array to an object for easier access
    const settingsObj = Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
    // Define values to replace placeholders in the email template
    const replacements = {
        '%SITE_URL%': APP_PUBLIC_URL,
        '%HEADER%': settingsObj['full_logo']
            ? `<img src="${APP_PUBLIC_URL}${settingsObj['full_logo']}" style="max-height:96px;" />` // Replace with the logo image if available
            : `<h1>${settingsObj['site_name'] || APP_PUBLIC_SITE_NAME || 'Bicrypto'}</h1>`,
        '%MESSAGE%': processedTemplate,
        '%SUBJECT%': processedSubject,
        '%FOOTER%': settingsObj['site_name'] || APP_PUBLIC_SITE_NAME || 'Bicrypto', // Replace with the footer text
    };
    return Object.entries(replacements).reduce((acc, [key, value]) => replaceAllOccurrences(acc, key, value), generalTemplate);
}
async function fetchAndProcessEmailTemplate(specificVariables, templateName) {
    const templateRecord = await prisma_1.default.notification_templates.findUnique({
        where: { name: templateName },
    });
    if (!templateRecord || !templateRecord.email || !templateRecord.email_body) {
        logger.error('Email template not found or email not enabled');
        throw (0, index_1.createError)({
            statusCode: 404,
            statusMessage: 'Email template not found or email not enabled',
        });
    }
    const basicVariables = {
        URL: APP_PUBLIC_URL,
    };
    const variables = { ...basicVariables, ...specificVariables };
    // Process the email body
    const processedTemplate = replaceTemplateVariables(templateRecord.email_body, variables);
    // Process the email subject
    const processedSubject = replaceTemplateVariables(templateRecord.subject, variables);
    return { processedTemplate, processedSubject, templateRecord };
}
function replaceTemplateVariables(template, variables) {
    return Object.entries(variables).reduce((acc, [key, value]) => acc.replace(new RegExp(`%${key}%`, 'g'), String(value)), template);
}
exports.replaceTemplateVariables = replaceTemplateVariables;
function replaceAllOccurrences(str, search, replace) {
    const regex = new RegExp(search, 'g');
    return str.replace(regex, replace);
}
async function sendKycEmail(user, kyc, emailType) {
    const timestampLabel = emailType === 'KycSubmission' ? 'CREATED_AT' : 'UPDATED_AT';
    const timestampDate = emailType === 'KycSubmission'
        ? new Date(kyc.created_at).toISOString()
        : new Date(kyc.updated_at).toISOString();
    const emailTemplate = emailType;
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        [timestampLabel]: timestampDate,
        LEVEL: kyc.level,
        STATUS: kyc.status,
    };
    if (emailType === 'KycRejected' && kyc.notes) {
        emailData['MESSAGE'] = kyc.notes;
    }
    const errorOrSent = await sendEmail(emailData, emailTemplate);
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send ${emailType} email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendKycEmail = sendKycEmail;
async function sendInvestmentEmail(user, investment, emailType) {
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        PLAN_NAME: investment.plan.name,
        AMOUNT: investment.amount.toString(),
        CURRENCY: investment.plan.currency,
        DURATION: investment.duration.toString(),
        ROI: investment.roi.toString(),
        STATUS: investment.status,
    };
    const errorOrSent = await sendEmail(emailData, emailType);
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send ${emailType} email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendInvestmentEmail = sendInvestmentEmail;
async function sendChatEmail(sender, receiver, chat, message, emailType) {
    const emailData = {
        TO: receiver.email,
        SENDER_NAME: sender.first_name,
        RECEIVER_NAME: receiver.first_name,
        MESSAGE: message.text,
        TICKET_ID: chat.uuid,
    };
    const errorOrSent = await sendEmail(emailData, emailType);
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send ${emailType === 'UserMessage' ? 'User' : 'Support'} message email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendChatEmail = sendChatEmail;
async function sendFiatTransactionEmail(user, transaction, newBalance) {
    // Define the type of email template to use, which matches the SQL record
    const emailTemplate = 'FiatWalletTransaction';
    // Prepare the email data
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        TRANSACTION_TYPE: transaction.type,
        TRANSACTION_ID: transaction.uuid,
        AMOUNT: transaction.amount,
        CURRENCY: transaction.wallet.currency,
        TRANSACTION_STATUS: transaction.status,
        NEW_BALANCE: newBalance,
        DESCRIPTION: transaction.description || 'N/A',
    };
    // Send the email
    const errorOrSent = await sendEmail(emailData, emailTemplate);
    // Handle the outcome
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send Fiat Wallet Transaction email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendFiatTransactionEmail = sendFiatTransactionEmail;
async function sendBinaryOrderEmail(user, order) {
    // Define the type of email template to use, which matches the SQL record
    const emailTemplate = 'BinaryOrderResult';
    let profit = 0;
    let sign;
    switch (order.status) {
        case 'WIN':
            profit = order.amount + order.amount * (order.profit / 100);
            sign = '+';
            break;
        case 'LOSS':
            profit = order.amount;
            sign = '-';
            break;
        case 'DRAW':
            profit = 0;
            sign = '';
            break;
    }
    const currency = order.symbol.split('/')[1];
    // Prepare the email data
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        ORDER_ID: order.uuid,
        RESULT: order.status,
        MARKET: order.symbol,
        CURRENCY: currency,
        AMOUNT: order.amount,
        PROFIT: `${sign}${profit}`,
        ENTRY_PRICE: order.price,
        CLOSE_PRICE: order.close_price,
        SIDE: order.side,
    };
    // Send the email
    const errorOrSent = await sendEmail(emailData, emailTemplate);
    // Handle the outcome
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send Binary Order Result email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendBinaryOrderEmail = sendBinaryOrderEmail;
async function sendWalletBalanceUpdateEmail(user, wallet, action, amount, newBalance) {
    // Define the type of email template to use, which matches the SQL record
    const emailTemplate = 'WalletBalanceUpdate';
    // Prepare the email data
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        ACTION: action,
        AMOUNT: amount,
        CURRENCY: wallet.currency,
        NEW_BALANCE: newBalance,
    };
    // Send the email
    const errorOrSent = await sendEmail(emailData, emailTemplate);
    // Handle the outcome
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send Wallet Balance Update email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendWalletBalanceUpdateEmail = sendWalletBalanceUpdateEmail;
async function sendTransactionStatusUpdateEmail(user, transaction, wallet, newBalance, note) {
    // Define the type of email template to use, which matches the SQL record
    const emailTemplate = 'TransactionStatusUpdate';
    // Prepare the email data
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        TRANSACTION_TYPE: transaction.type,
        TRANSACTION_ID: transaction.uuid,
        TRANSACTION_STATUS: transaction.status,
        AMOUNT: transaction.amount,
        CURRENCY: wallet.currency,
        NEW_BALANCE: newBalance,
        NOTE: note || 'N/A',
    };
    // Send the email
    const errorOrSent = await sendEmail(emailData, emailTemplate);
    // Handle the outcome
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send Transaction Status Update email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendTransactionStatusUpdateEmail = sendTransactionStatusUpdateEmail;
async function sendAuthorStatusUpdateEmail(user, author) {
    // Define the type of email template to use, which matches the SQL record
    const emailTemplate = 'AuthorStatusUpdate';
    // Prepare the email data
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        AUTHOR_STATUS: author.status,
        APPLICATION_ID: author.uuid,
    };
    // Send the email
    const errorOrSent = await sendEmail(emailData, emailTemplate);
    // Handle the outcome
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send Author Status Update email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendAuthorStatusUpdateEmail = sendAuthorStatusUpdateEmail;
async function sendOutgoingTransferEmail(user, toUser, wallet, amount, transactionId) {
    const emailTemplate = 'OutgoingWalletTransfer';
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        AMOUNT: amount,
        CURRENCY: wallet.currency,
        NEW_BALANCE: wallet.balance,
        TRANSACTION_ID: transactionId,
        RECIPIENT_NAME: `${toUser.first_name} ${toUser.last_name}`,
    };
    const errorOrSent = await sendEmail(emailData, emailTemplate);
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send Outgoing Wallet Transfer email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendOutgoingTransferEmail = sendOutgoingTransferEmail;
async function sendIncomingTransferEmail(user, fromUser, wallet, amount, transactionId) {
    const emailTemplate = 'IncomingWalletTransfer';
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        AMOUNT: amount,
        CURRENCY: wallet.currency,
        NEW_BALANCE: wallet.balance,
        TRANSACTION_ID: transactionId,
        SENDER_NAME: `${fromUser.first_name} ${fromUser.last_name}`,
    };
    const errorOrSent = await sendEmail(emailData, emailTemplate);
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send Incoming Wallet Transfer email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendIncomingTransferEmail = sendIncomingTransferEmail;
async function sendSpotWalletWithdrawalConfirmationEmail(user, transaction, wallet) {
    // Define the type of email template to use, which matches the SQL record
    const emailTemplate = 'SpotWalletWithdrawalConfirmation';
    // Prepare the email data
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        AMOUNT: transaction.amount,
        CURRENCY: wallet.currency,
        ADDRESS: transaction.metadata.address,
        FEE: transaction.fee,
        CHAIN: transaction.metadata.chain,
        MEMO: transaction.metadata.memo || 'N/A',
        STATUS: transaction.status,
    };
    // Send the email
    const errorOrSent = await sendEmail(emailData, emailTemplate);
    // Handle the outcome
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send Spot Wallet Withdrawal Confirmation email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendSpotWalletWithdrawalConfirmationEmail = sendSpotWalletWithdrawalConfirmationEmail;
async function sendSpotWalletDepositConfirmationEmail(user, transaction, wallet) {
    // Define the type of email template to use, which should match the SQL record
    const emailTemplate = 'SpotWalletDepositConfirmation';
    // Prepare the email data
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        TRANSACTION_ID: transaction.reference_id,
        AMOUNT: transaction.amount,
        CURRENCY: wallet.currency,
        CHAIN: transaction.metadata.chain,
        FEE: transaction.fee,
    };
    // Send the email
    const errorOrSent = await sendEmail(emailData, emailTemplate);
    // Handle the outcome
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send Spot Wallet Deposit Confirmation email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendSpotWalletDepositConfirmationEmail = sendSpotWalletDepositConfirmationEmail;
async function sendAiInvestmentEmail(user, investment, emailType) {
    const resultSign = investment.result === 'WIN' ? '+' : investment.result === 'LOSS' ? '-' : '';
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        PLAN_NAME: investment.plan.title,
        AMOUNT: investment.amount.toString(),
        CURRENCY: investment.market.split('/')[1],
        DURATION: investment.duration.duration.toString(),
        TIMEFRAME: investment.duration.timeframe,
        STATUS: investment.status,
        PROFIT: investment.profit !== undefined
            ? `${resultSign}${investment.profit}`
            : 'N/A',
    };
    const errorOrSent = await sendEmail(emailData, emailType);
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send ${emailType} email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendAiInvestmentEmail = sendAiInvestmentEmail;
async function sendForexInvestmentEmail(user, investment, emailType) {
    const resultSign = investment.result === 'WIN' ? '+' : investment.result === 'LOSS' ? '-' : '';
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        PLAN_NAME: investment.plan.title,
        AMOUNT: investment.amount.toString(),
        DURATION: investment.duration.duration.toString(),
        TIMEFRAME: investment.duration.timeframe,
        STATUS: investment.status,
        PROFIT: `${resultSign}${investment.profit}` || 'N/A',
    };
    const errorOrSent = await sendEmail(emailData, emailType);
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send ${emailType} email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendForexInvestmentEmail = sendForexInvestmentEmail;
async function sendForexTransactionEmail(user, transaction, transactionType) {
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        ACCOUNT_ID: transaction.account_id,
        TRANSACTION_ID: transaction.transaction_id,
        AMOUNT: transaction.amount.toString(),
        CURRENCY: transaction.currency,
        STATUS: transaction.status,
    };
    let emailType = '';
    if (transactionType === 'FOREX_DEPOSIT') {
        emailType = 'ForexDepositConfirmation';
    }
    else if (transactionType === 'FOREX_WITHDRAW') {
        emailType = 'ForexWithdrawalConfirmation';
    }
    const errorOrSent = await sendEmail(emailData, emailType);
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send ${emailType} email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendForexTransactionEmail = sendForexTransactionEmail;
async function sendIcoContributionEmail(user, contribution, token, phase, emailType, transactionId) {
    const contributionDate = new Date(contribution.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    // Common email data
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        TOKEN_NAME: token.name,
        PHASE_NAME: phase.name,
        AMOUNT: contribution.amount.toString(),
        CURRENCY: token.purchase_currency,
        DATE: contributionDate,
    };
    // Customize email data based on the type
    if (emailType === 'IcoContributionPaid') {
        emailData['TRANSACTION_ID'] = transactionId || 'N/A';
    }
    else if (emailType === 'IcoNewContribution') {
        emailData['CONTRIBUTION_STATUS'] = contribution.status;
    }
    const errorOrSent = await sendEmail(emailData, emailType);
    if (errorOrSent instanceof Error) {
        logger.error(`Failed to send ${emailType} email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendIcoContributionEmail = sendIcoContributionEmail;
// Function to send an email when a user initiates a stake
async function sendStakingInitiationEmail(user, stake, pool, reward) {
    const stakeDate = new Date(stake.stake_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const releaseDate = new Date(stake.release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        TOKEN_NAME: pool.name,
        STAKE_AMOUNT: stake.amount.toString(),
        TOKEN_SYMBOL: pool.currency,
        STAKE_DATE: stakeDate,
        RELEASE_DATE: releaseDate,
        EXPECTED_REWARD: reward,
    };
    const errorOrSent = await sendEmail(emailData, 'StakingInitiationConfirmation');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send StakingInitiationConfirmation email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendStakingInitiationEmail = sendStakingInitiationEmail;
// Function to send an email when a user's staking reward has been distributed
async function sendStakingRewardEmail(user, stake, pool, reward) {
    const distributionDate = new Date(stake.release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        TOKEN_NAME: pool.name,
        REWARD_AMOUNT: reward.toString(),
        TOKEN_SYMBOL: pool.currency,
        DISTRIBUTION_DATE: distributionDate,
    };
    const errorOrSent = await sendEmail(emailData, 'StakingRewardDistribution');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send StakingRewardDistribution email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendStakingRewardEmail = sendStakingRewardEmail;
async function sendOrderConfirmationEmail(user, order, product) {
    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const emailData = {
        TO: user.email,
        CUSTOMER_NAME: user.first_name,
        ORDER_NUMBER: order.uuid,
        ORDER_DATE: orderDate,
        ORDER_TOTAL: product.price.toString(),
    };
    const errorOrSent = await sendEmail(emailData, 'OrderConfirmation');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send OrderConfirmation email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendOrderConfirmationEmail = sendOrderConfirmationEmail;
async function sendOrderStatusUpdateEmail(user, order) {
    // Retrieve all products in the order
    const orderItems = await prisma_1.default.ecommerce_order_item.findMany({
        where: { order_id: order.id },
        include: { product: true },
    });
    // Construct the product details string
    const productDetails = orderItems
        .map((item) => `
    <li>Product Name: ${item.product.name}</li>
    <li>Quantity: ${item.quantity}</li>
    <li>Price: ${item.product.price} ${item.product.currency}</li>
  `)
        .join('');
    const emailData = {
        TO: user.email,
        CUSTOMER_NAME: user.first_name,
        ORDER_NUMBER: order.uuid,
        ORDER_STATUS: order.status,
        PRODUCT_DETAILS: productDetails, // Replacing product-specific placeholders with this
    };
    const errorOrSent = await sendEmail(emailData, 'OrderStatusUpdate');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send OrderStatusUpdate email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendOrderStatusUpdateEmail = sendOrderStatusUpdateEmail;
async function sendP2PNewTradeEmail(user, trade) {
    const tradeDate = new Date(trade.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        TRADE_ID: trade.uuid,
        OFFER_ID: trade.offer_id.toString(),
        TRADE_AMOUNT: trade.amount.toString(),
        CURRENCY: trade.offer.currency,
        TRADE_STATUS: trade.status,
        TRADE_DATE: tradeDate,
    };
    const errorOrSent = await sendEmail(emailData, 'NewTradeNotification');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send NewTradeNotification email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PNewTradeEmail = sendP2PNewTradeEmail;
async function sendP2PTradeStatusUpdateEmail(user, trade) {
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        TRADE_ID: trade.uuid,
        TRADE_STATUS: trade.status,
    };
    const errorOrSent = await sendEmail(emailData, 'TradeStatusUpdate');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send TradeStatusUpdate email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PTradeStatusUpdateEmail = sendP2PTradeStatusUpdateEmail;
async function sendP2PTradeDisputeEmail(user, dispute, trade) {
    const disputeDate = new Date(dispute.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        TRADE_ID: trade.uuid,
        DISPUTE_REASON: dispute.reason,
        DISPUTE_DATE: disputeDate,
    };
    const errorOrSent = await sendEmail(emailData, 'TradeDisputeNotification');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send TradeDisputeNotification email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PTradeDisputeEmail = sendP2PTradeDisputeEmail;
async function sendP2PReviewEmail(user, review, trade) {
    const emailData = {
        TO: user.email,
        FIRSTNAME: user.first_name,
        TRADE_ID: trade.uuid,
        REVIEW_RATING: review.rating.toString(),
        REVIEW_COMMENT: review.comment,
    };
    const errorOrSent = await sendEmail(emailData, 'ReviewNotification');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send ReviewNotification email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PReviewEmail = sendP2PReviewEmail;
async function sendP2PTradeSaleConfirmationEmail(seller, buyer, trade) {
    const emailData = {
        TO: seller.email,
        SELLER_NAME: seller.first_name,
        BUYER_NAME: buyer.first_name,
        CURRENCY: trade.offer.currency,
        AMOUNT: trade.amount.toString(),
        PRICE: trade.offer.price.toString(),
        TRADE_ID: trade.uuid,
    };
    const errorOrSent = await sendEmail(emailData, 'P2PTradeSaleConfirmation');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send P2PTradeSaleConfirmation email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PTradeSaleConfirmationEmail = sendP2PTradeSaleConfirmationEmail;
async function sendP2PTradeReplyEmail(receiver, sender, trade, message) {
    const emailData = {
        TO: receiver.email,
        RECEIVER_NAME: receiver.first_name,
        SENDER_NAME: sender.first_name,
        TRADE_ID: trade.uuid,
        MESSAGE: message.text,
    };
    const errorOrSent = await sendEmail(emailData, 'P2PTradeReply');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send P2PTradeReply email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PTradeReplyEmail = sendP2PTradeReplyEmail;
async function sendP2PDisputeOpenedEmail(disputed, disputer, trade, disputeReason) {
    const emailData = {
        TO: disputed.email,
        PARTICIPANT_NAME: disputed.first_name,
        OTHER_PARTY_NAME: disputer.first_name,
        TRADE_ID: trade.uuid,
        DISPUTE_REASON: disputeReason,
    };
    const errorOrSent = await sendEmail(emailData, 'P2PDisputeOpened');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send P2PDisputeOpened email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PDisputeOpenedEmail = sendP2PDisputeOpenedEmail;
async function sendP2PDisputeResolutionEmail(participant, trade, resolutionMessage) {
    const emailData = {
        TO: participant.email,
        PARTICIPANT_NAME: participant.first_name,
        TRADE_ID: trade.uuid,
        RESOLUTION_MESSAGE: resolutionMessage,
    };
    const errorOrSent = await sendEmail(emailData, 'P2PDisputeResolution');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send P2PDisputeResolution email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PDisputeResolutionEmail = sendP2PDisputeResolutionEmail;
async function sendP2PDisputeResolvingEmail(participant, trade) {
    const emailData = {
        TO: participant.email,
        PARTICIPANT_NAME: participant.first_name,
        TRADE_ID: trade.uuid,
    };
    const errorOrSent = await sendEmail(emailData, 'P2PDisputeResolving');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send P2PDisputeResolving email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PDisputeResolvingEmail = sendP2PDisputeResolvingEmail;
async function sendP2PDisputeClosingEmail(participant, trade) {
    const emailData = {
        TO: participant.email,
        PARTICIPANT_NAME: participant.first_name,
        TRADE_ID: trade.uuid,
    };
    const errorOrSent = await sendEmail(emailData, 'P2PDisputeClosing');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send P2PDisputeClosing email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PDisputeClosingEmail = sendP2PDisputeClosingEmail;
async function sendP2PTradeCompletionEmail(seller, buyer, trade) {
    const emailData = {
        TO: seller.email,
        SELLER_NAME: seller.first_name,
        BUYER_NAME: buyer.first_name,
        AMOUNT: trade.amount.toString(),
        CURRENCY: trade.offer.currency,
        TRADE_ID: trade.uuid,
    };
    const errorOrSent = await sendEmail(emailData, 'P2PTradeCompletion');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send P2PTradeCompletion email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PTradeCompletionEmail = sendP2PTradeCompletionEmail;
async function sendP2PTradeCancellationEmail(participant, trade) {
    const emailData = {
        TO: participant.email,
        PARTICIPANT_NAME: participant.first_name,
        TRADE_ID: trade.uuid,
    };
    const errorOrSent = await sendEmail(emailData, 'P2PTradeCancellation');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send P2PTradeCancellation email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PTradeCancellationEmail = sendP2PTradeCancellationEmail;
async function sendP2PTradePaymentConfirmationEmail(seller, buyer, trade, transactionId) {
    const emailData = {
        TO: seller.email,
        SELLER_NAME: seller.first_name,
        BUYER_NAME: buyer.first_name,
        TRADE_ID: trade.uuid,
        TRANSACTION_ID: transactionId,
    };
    const errorOrSent = await sendEmail(emailData, 'P2PTradePaymentConfirmation');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send P2PTradePaymentConfirmation email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PTradePaymentConfirmationEmail = sendP2PTradePaymentConfirmationEmail;
async function sendP2PReviewNotificationEmail(seller, review, offer) {
    const emailData = {
        TO: seller.email,
        SELLER_NAME: seller.first_name,
        OFFER_ID: offer.uuid,
        REVIEWER_NAME: review.reviewer.first_name,
        RATING: review.rating.toString(),
        COMMENT: review.comment,
    };
    const errorOrSent = await sendEmail(emailData, 'P2PReviewNotification');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send P2PReviewNotification email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2PReviewNotificationEmail = sendP2PReviewNotificationEmail;
async function sendP2POfferAmountDepletionEmail(seller, offer, currentAmount) {
    const emailData = {
        TO: seller.email,
        SELLER_NAME: seller.first_name,
        OFFER_ID: offer.id.toString(),
        CURRENT_AMOUNT: currentAmount.toString(),
        CURRENCY: offer.currency,
    };
    const errorOrSent = await sendEmail(emailData, 'P2POfferAmountDepletion');
    if (errorOrSent instanceof Error) {
        console.error(`Failed to send P2POfferAmountDepletion email:`, errorOrSent);
        return errorOrSent;
    }
    return true;
}
exports.sendP2POfferAmountDepletionEmail = sendP2POfferAmountDepletionEmail;
