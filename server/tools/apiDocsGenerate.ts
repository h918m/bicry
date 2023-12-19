import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { routeGroups as coreRouteGroups } from '~~/routes' // Replace with your actual core routes

const isProduction = process.env.NODE_ENV === 'production'
const fileExtension = isProduction ? '.js' : '.ts'

// Define the extensions directory
const extensionsDir = path.resolve(
  process.cwd(),
  isProduction ? 'dist' : 'server',
  'extensions',
)
const rootPath = process.cwd()
const apiInfo = {
  title: `${process.env.APP_PUBLIC_SITE_NAME} API`,
  version: '1.0.1',
}

const paths = {}

const successResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        result: { type: 'object' },
        message: { type: 'string' },
      },
    },
  },
}

const failResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    error: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
}

// Function to process each route group
const extractRoutes = (routeGroups) => {
  routeGroups.forEach((group) => {
    if (group.basePath.startsWith('/api/admin')) {
      return
    }

    if (group.basePath.startsWith('/api/exchange/settings')) {
      return
    }

    if (group.basePath.startsWith('/api/cron')) {
      return
    }

    group.routes.forEach((route) => {
      if (route.permission) {
        return
      }
      const fullPath = `${group.basePath}${route.path}`
      if (!paths[fullPath]) {
        paths[fullPath] = {}
      }

      const httpMethod = route.method === 'del' ? 'delete' : route.method

      paths[fullPath][httpMethod] = {
        summary: route.controller,
        parameters: route.params
          ? route.params.map((param) => ({
              name: param,
              in: 'path',
              required: true,
              schema: { type: 'string' },
            }))
          : [],
        requestBody: route.body
          ? {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: Object.fromEntries(
                      route.body.map((key) => [key, { type: 'string' }]),
                    ),
                  },
                },
              },
            }
          : undefined,
        responses: {
          '200': {
            description: 'Success',
            content: { 'application/json': { schema: successResponseSchema } },
          },
          '400': {
            description: 'Bad Request',
            content: { 'application/json': { schema: failResponseSchema } },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: failResponseSchema } },
          },
          '404': {
            description: 'Not Found',
            content: { 'application/json': { schema: failResponseSchema } },
          },
          '500': {
            description: 'Internal Server Error',
            content: { 'application/json': { schema: failResponseSchema } },
          },
        },
      }
    })
  })
}

// Extract routes from core
extractRoutes(coreRouteGroups)

let extensionNames = []
try {
  extensionNames = fs.readdirSync(extensionsDir)
} catch (error) {
  console.error(`Error reading extensions directory: ${error}`)
}

// Extract routes from each extension and add to documentation
extensionNames.forEach((extension) => {
  try {
    const extensionRoutesPath = path.resolve(
      extensionsDir,
      extension,
      `routes${fileExtension}`,
    )
    if (fs.existsSync(extensionRoutesPath)) {
      const extensionRoutes = require(extensionRoutesPath).default
      extractRoutes(extensionRoutes)
    } else {
      console.warn(`No routes.ts found for extension ${extension}`)
    }
  } catch (error) {
    console.error(`Error reading routes for extension ${extension}: ${error}`)
  }
})

const swaggerObject = {
  openapi: '3.0.0',
  info: apiInfo,
  paths,
}

const swaggerYaml = yaml.dump(swaggerObject)

fs.writeFileSync(`${rootPath}/api.yaml`, swaggerYaml)
