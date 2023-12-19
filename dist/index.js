"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tsconfigPaths = __importStar(require("tsconfig-paths"));
const uWS = __importStar(require("uWebSockets.js"));
const exchange_1 = require("./exchange");
const logger_1 = require("./logger");
const routes_1 = require("./routes");
const apiDocsSetup_1 = require("./tools/apiDocsSetup");
const chat_1 = require("./tools/chat");
const htmlSetup_1 = require("./tools/htmlSetup");
const utils_1 = require("./utils");
const exchange_2 = __importDefault(require("./utils/exchange"));
const logger = (0, logger_1.createLogger)('uWS-Server');
const exchangeLogger = (0, logger_1.createLogger)('Exchange');
const app = uWS.App();
const isProduction = process.env.NODE_ENV === 'production';
const fileExtension = isProduction ? '.js' : '.ts';
const baseUrl = path.join(process.cwd(), isProduction ? '/dist' : '/server');
const routeHandlerCache = new Map();
const cleanup = tsconfigPaths.register({
    baseUrl,
    paths: {
        '~~/*': ['./*'],
    },
});
require("./tools/apiDocsGenerate");
// import './tools/permissionsGenerate'
const isValidMethod = (method) => typeof app[method] === 'function';
const setupIndividualRoute = (basePath, route, controllers) => {
    if (isValidMethod(route.method)) {
        const fullPath = `${basePath}${route.path}`;
        app[route.method](fullPath, (0, utils_1.setupRouteHandler)(route, controllers));
    }
    else {
        logger.error(`Invalid method ${route.method} for route ${route.path}`);
    }
};
const getAddonFolders = async () => {
    const addonPath = `${baseUrl}/extensions`;
    try {
        const dirents = await fs.promises.readdir(addonPath, {
            withFileTypes: true,
        });
        return dirents
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);
    }
    catch (error) {
        logger.warn(`Addon path ${addonPath} does not exist or couldn't be read.`);
        return [];
    }
};
const setupRouteGroup = async (group) => {
    const { basePath, routes, controllerPath } = group;
    let controllers;
    // Determine file extension based on NODE_ENV
    const fullControllerPath = path.resolve(baseUrl, `${controllerPath}${fileExtension}`);
    // Check if controllers are already in cache
    if (routeHandlerCache.has(fullControllerPath)) {
        controllers = routeHandlerCache.get(fullControllerPath);
    }
    else {
        // Check if the controller file exists before importing
        if (fs.existsSync(fullControllerPath)) {
            try {
                const mod = await Promise.resolve(`${fullControllerPath}`).then(s => __importStar(require(s)));
                controllers = mod.controllers;
                // Cache the controllers
                routeHandlerCache.set(fullControllerPath, controllers);
            }
            catch (error) {
                logger.error(`Failed to import controllers from ${fullControllerPath}: ${error}`);
                return;
            }
        }
        else {
            logger.error(`Controller file does not exist: ${fullControllerPath}`);
            return;
        }
    }
    // Check if controllers are found for all routes
    const notFoundControllers = routes.filter((route) => !(controllers && controllers.hasOwnProperty(route.controller)));
    if (notFoundControllers.length > 0) {
        logger.error(`Controllers not found for the following routes under basePath ${basePath}:`);
        notFoundControllers.forEach((route) => {
            logger.error(`Method: ${route.method}, Path: ${route.path}, Controller: ${route.controller}`);
        });
        return;
    }
    // Setup individual routes
    routes.forEach((route) => setupIndividualRoute(basePath, route, controllers));
};
const setupRoutes = async () => {
    console.time('SetupRoutes Duration');
    const promises = [];
    const addonFolders = await getAddonFolders();
    for (const group of routes_1.routeGroups) {
        promises.push(setupRouteGroup(group));
    }
    for (const folder of addonFolders) {
        const addonRoutePath = `${baseUrl}/extensions/${folder}/routes${fileExtension}`;
        try {
            const addonRouteGroups = await Promise.resolve(`${addonRoutePath}`).then(s => __importStar(require(s)));
            for (const group of addonRouteGroups.default) {
                promises.push(setupRouteGroup(group));
            }
        }
        catch (error) {
            logger.error(`Failed to import addon routes from ${addonRoutePath}: ${error}`);
        }
    }
    await Promise.all(promises);
    console.timeEnd('SetupRoutes Duration');
};
const loadMarket = async () => {
    const exchange = await exchange_2.default.startExchange();
    try {
        await exchange.loadMarkets();
    }
    catch (error) {
        exchangeLogger.error(`Failed to load markets: ${error.message}`);
    }
};
const setupEcosystemWebsocketIfAvailable = async () => {
    const filePath = path.join(__dirname, 'extensions', 'ecosystem', 'websocket', `index${fileExtension}`); // Adjust the path as needed
    if (fs.existsSync(filePath)) {
        try {
            // Using a variable to make TypeScript treat this as a dynamic import
            const moduleName = `./extensions/ecosystem/websocket${process.env.NODE_ENV === 'production' ? '/index.js' : ''}`;
            const ecosystemModule = await Promise.resolve(`${moduleName}`).then(s => __importStar(require(s)));
            if (ecosystemModule &&
                typeof ecosystemModule.setupEcosystemWebsocket === 'function') {
                ecosystemModule.setupEcosystemWebsocket(app);
            }
        }
        catch (error) {
            console.log('Ecosystem websocket setup failed:', error);
        }
    }
    else {
        console.log('Ecosystem websocket module does not exist.');
    }
};
// Handle OPTIONS for all routes
app.options('/*', (res, req) => {
    res.cork(() => {
        (0, utils_1.setCORSHeaders)(res);
        res.writeStatus('204 No Content');
        res.end();
    });
});
const initializeApp = async () => {
    (0, apiDocsSetup_1.setupApiDocsRoutes)(app);
    (0, htmlSetup_1.setupHtmlRoutes)(app);
    loadMarket();
    (0, exchange_1.setupExchangeWebsocket)(app);
    (0, chat_1.setupChat)(app);
    setupEcosystemWebsocketIfAvailable();
    await setupRoutes();
    app.listen(4000, (token) => {
        if (token) {
            logger.info('Server started on port 4000');
        }
        else {
            logger.error('Failed to start server');
        }
    });
};
initializeApp().catch((error) => {
    logger.error(`Failed to initialize app: ${error}`);
});
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
});
process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});
process.on('SIGINT', () => {
    cleanup();
    process.exit();
});
