import * as fs from 'fs'
import * as path from 'path'
import * as tsconfigPaths from 'tsconfig-paths'
import * as uWS from 'uWebSockets.js'
import { setupExchangeWebsocket } from './exchange'
import { createLogger } from './logger'
import { routeGroups } from './routes'
import { setupApiDocsRoutes } from './tools/apiDocsSetup'
import { setupChat } from './tools/chat'
import { setupHtmlRoutes } from './tools/htmlSetup'
import { setCORSHeaders, setupRouteHandler } from './utils'
import ExchangeManager from './utils/exchange'

const logger = createLogger('uWS-Server')
const exchangeLogger = createLogger('Exchange')
const app = uWS.App()
const isProduction = process.env.NODE_ENV === 'production'
const fileExtension = isProduction ? '.js' : '.ts'
const baseUrl = path.join(process.cwd(), isProduction ? '/dist' : '/server')
const routeHandlerCache = new Map<string, any>()

const cleanup = tsconfigPaths.register({
  baseUrl,
  paths: {
    '~~/*': ['./*'],
  },
})

import './tools/apiDocsGenerate'
// import './tools/permissionsGenerate'

const isValidMethod = (method: string) => typeof app[method] === 'function'

const setupIndividualRoute = (
  basePath: string,
  route: any,
  controllers: any,
) => {
  if (isValidMethod(route.method)) {
    const fullPath = `${basePath}${route.path}`
    app[route.method](fullPath, setupRouteHandler(route, controllers))
  } else {
    logger.error(`Invalid method ${route.method} for route ${route.path}`)
  }
}

const getAddonFolders = async () => {
  const addonPath = `${baseUrl}/extensions`
  try {
    const dirents = await fs.promises.readdir(addonPath, {
      withFileTypes: true,
    })
    return dirents
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
  } catch (error) {
    logger.warn(`Addon path ${addonPath} does not exist or couldn't be read.`)
    return []
  }
}

const setupRouteGroup = async (group: any) => {
  const { basePath, routes, controllerPath } = group

  let controllers: any

  // Determine file extension based on NODE_ENV
  const fullControllerPath = path.resolve(
    baseUrl,
    `${controllerPath}${fileExtension}`,
  )

  // Check if controllers are already in cache
  if (routeHandlerCache.has(fullControllerPath)) {
    controllers = routeHandlerCache.get(fullControllerPath)
  } else {
    // Check if the controller file exists before importing
    if (fs.existsSync(fullControllerPath)) {
      try {
        const mod = await import(fullControllerPath)
        controllers = mod.controllers

        // Cache the controllers
        routeHandlerCache.set(fullControllerPath, controllers)
      } catch (error) {
        logger.error(
          `Failed to import controllers from ${fullControllerPath}: ${error}`,
        )
        return
      }
    } else {
      logger.error(`Controller file does not exist: ${fullControllerPath}`)
      return
    }
  }

  // Check if controllers are found for all routes
  const notFoundControllers = routes.filter(
    (route) => !(controllers && controllers.hasOwnProperty(route.controller)),
  )

  if (notFoundControllers.length > 0) {
    logger.error(
      `Controllers not found for the following routes under basePath ${basePath}:`,
    )
    notFoundControllers.forEach((route) => {
      logger.error(
        `Method: ${route.method}, Path: ${route.path}, Controller: ${route.controller}`,
      )
    })
    return
  }

  // Setup individual routes
  routes.forEach((route) => setupIndividualRoute(basePath, route, controllers))
}

const setupRoutes = async () => {
  console.time('SetupRoutes Duration')
  const promises = []
  const addonFolders = await getAddonFolders()

  for (const group of routeGroups) {
    promises.push(setupRouteGroup(group))
  }

  for (const folder of addonFolders) {
    const addonRoutePath = `${baseUrl}/extensions/${folder}/routes${fileExtension}`

    try {
      const addonRouteGroups = await import(addonRoutePath)
      for (const group of addonRouteGroups.default) {
        promises.push(setupRouteGroup(group))
      }
    } catch (error) {
      logger.error(
        `Failed to import addon routes from ${addonRoutePath}: ${error}`,
      )
    }
  }

  await Promise.all(promises)
  console.timeEnd('SetupRoutes Duration')
}

const loadMarket = async () => {
  const exchange = await ExchangeManager.startExchange()
  try {
    await exchange.loadMarkets()
  } catch (error) {
    exchangeLogger.error(`Failed to load markets: ${error.message}`)
  }
}

const setupEcosystemWebsocketIfAvailable = async () => {
  const filePath = path.join(
    __dirname,
    'extensions',
    'ecosystem',
    'websocket',
    `index${fileExtension}`,
  ) // Adjust the path as needed

  if (fs.existsSync(filePath)) {
    try {
      // Using a variable to make TypeScript treat this as a dynamic import
      const moduleName = `./extensions/ecosystem/websocket${
        process.env.NODE_ENV === 'production' ? '/index.js' : ''
      }`
      const ecosystemModule = await import(moduleName)
      if (
        ecosystemModule &&
        typeof ecosystemModule.setupEcosystemWebsocket === 'function'
      ) {
        ecosystemModule.setupEcosystemWebsocket(app)
      }
    } catch (error) {
      console.log('Ecosystem websocket setup failed:', error)
    }
  } else {
    console.log('Ecosystem websocket module does not exist.')
  }
}

// Handle OPTIONS for all routes
app.options('/*', (res, req) => {
  res.cork(() => {
    setCORSHeaders(res)
    res.writeStatus('204 No Content')
    res.end()
  })
})

const initializeApp = async () => {
  setupApiDocsRoutes(app)
  setupHtmlRoutes(app)
  loadMarket()
  setupExchangeWebsocket(app)
  setupChat(app)
  setupEcosystemWebsocketIfAvailable()
  await setupRoutes()

  app.listen(4000, (token) => {
    if (token) {
      logger.info('Server started on port 4000')
    } else {
      logger.error('Failed to start server')
    }
  })
}

initializeApp().catch((error) => {
  logger.error(`Failed to initialize app: ${error}`)
})

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
})

process.on('SIGINT', () => {
  cleanup()
  process.exit()
})
