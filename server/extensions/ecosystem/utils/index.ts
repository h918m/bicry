import { JsonRpcProvider, WebSocketProvider } from 'ethers'
import fs from 'fs'
import { createLogger } from '../../../logger'
import {
  fetchGeneralTransactions,
  fetchPublicTransactions,
} from './transactions'

const logger = createLogger('Ecosystem Wallets')

type FetchFunction = (address: string) => Promise<any>

interface ChainConfig {
  name: string
  decimals: number
  fetchFunction: FetchFunction
  cache: boolean
  networks: Record<string, Network>
  currency: string
  smartContract?: SmartContract
}

interface Network {
  explorer: string
}

interface SmartContract {
  file: string
  name: string
}

export const getProvider = (chainSymbol: string): JsonRpcProvider => {
  try {
    const chainConfig = chainConfigs[chainSymbol]

    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chainSymbol}`)
    }

    // Determine the network to use for this chain
    const networkEnvVar = `${chainSymbol}_NETWORK`
    const networkName = process.env[networkEnvVar]

    if (!networkName) {
      throw new Error(`Environment variable ${networkEnvVar} is not set`)
    }

    const rpcEnvVar = `${chainSymbol}_${networkName.toUpperCase()}_RPC`
    const rpcName = process.env[rpcEnvVar]

    if (!rpcName) {
      throw new Error(`Environment variable ${rpcName} is not set`)
    }

    return new JsonRpcProvider(rpcName)
  } catch (error) {
    logger.error(error.message)
    throw new Error(`Failed to initialize provider for chain ${chainSymbol}`)
  }
}

export const getWssProvider = (chainSymbol: string): WebSocketProvider => {
  try {
    const chainConfig = chainConfigs[chainSymbol]

    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chainSymbol}`)
    }

    // Determine the network to use for this chain
    const networkEnvVar = `${chainSymbol}_NETWORK`
    const networkName = process.env[networkEnvVar]

    if (!networkName) {
      throw new Error(`Environment variable ${networkEnvVar} is not set`)
    }

    const rpcEnvVar = `${chainSymbol}_${networkName.toUpperCase()}_RPC_WSS`
    const rpcName = process.env[rpcEnvVar]

    if (!rpcName) {
      throw new Error(`Environment variable ${rpcName} is not set`)
    }

    return new WebSocketProvider(rpcName)
  } catch (error) {
    logger.error(error.message)
    throw new Error(`Failed to initialize provider for chain ${chainSymbol}`)
  }
}

export async function getSmartContract(path, name) {
  const filePath = `${process.cwd()}/ecosystem/smart-contracts/${path}/${name}.json`

  let contractJson

  try {
    const fileContent = await fs.readFileSync(filePath, 'utf8')
    contractJson = JSON.parse(fileContent)
  } catch (e) {
    throw new Error(`Failed to read contract JSON for ${name}`)
  }

  // Extract bytecode
  const { abi, bytecode } = contractJson
  if (!bytecode || !abi) {
    throw new Error(`Failed to extract bytecode or ABI for ${name}`)
  }

  return {
    abi,
    bytecode,
  }
}

// Get chain ID
export const getChainId = async (provider) => {
  return (await provider.getNetwork()).chainId
}

export function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000)
}

// Initialize Ethereum provider
export const initializeProvider = (chain) => {
  const provider = getProvider(chain)
  if (!provider) {
    throw new Error(`Failed to initialize provider for chain ${chain}`)
  }
  return provider
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type ChainSymbol =
  | 'ETH'
  | 'BSC'
  | 'POLYGON'
  | 'FTM'
  // | 'HECO'
  | 'OPTIMISM'
  | 'TRON'
  | 'ARBITRUM'
  | 'BASE'
  // | 'CRONOS'
  | 'CELO'
  | 'RSK'

export const chainConfigs: Record<string, ChainConfig> = {
  ETH: {
    name: 'Ethereum',
    decimals: 18,
    fetchFunction: (address: string) =>
      fetchGeneralTransactions('ETH', address),
    cache: true,
    networks: {
      mainnet: {
        explorer: 'api.etherscan.io',
      },
      sepolia: {
        explorer: 'api-sepolia.etherscan.io',
      },
    },
    currency: 'ETH',
    smartContract: {
      file: 'ERC20',
      name: 'ERC20',
    },
  },
  BSC: {
    name: 'Binance Smart Chain',
    decimals: 18,
    fetchFunction: (address: string) =>
      fetchGeneralTransactions('BSC', address),
    cache: true,
    networks: {
      mainnet: {
        explorer: 'api.bscscan.com',
      },
      testnet: {
        explorer: 'api-testnet.bscscan.com',
      },
    },
    currency: 'BNB',
    smartContract: {
      file: 'ERC20',
      name: 'BEP20',
    },
  },
  POLYGON: {
    name: 'Polygon',
    decimals: 18,
    fetchFunction: (address: string) =>
      fetchGeneralTransactions('POLYGON', address),
    cache: true,
    networks: {
      matic: {
        explorer: 'api.polygonscan.com',
      },
      'matic-mumbai': {
        explorer: 'api-testnet.polygonscan.com',
      },
    },
    currency: 'MATIC',
    smartContract: {
      file: 'ERC20',
      name: 'ERC20',
    },
  },
  FTM: {
    name: 'Fantom',
    decimals: 18,
    fetchFunction: (address: string) =>
      fetchGeneralTransactions('FTM', address),
    cache: true,
    networks: {
      mainnet: {
        explorer: 'api.ftmscan.com',
      },
      testnet: {
        explorer: 'api-testnet.ftmscan.com',
      },
    },
    currency: 'FTM',
    smartContract: {
      file: 'ERC20',
      name: 'ERC20',
    },
  },
  OPTIMISM: {
    name: 'Optimism',
    decimals: 18,
    fetchFunction: (address: string) =>
      fetchGeneralTransactions('OPTIMISM', address),
    cache: true,
    networks: {
      mainnet: {
        explorer: 'api-optimistic.etherscan.io',
      },
      goerli: {
        explorer: 'api-goerli-optimistic.etherscan.io',
      },
    },
    currency: 'ETH',
    smartContract: {
      file: 'ERC20',
      name: 'ERC20',
    },
  },
  ARBITRUM: {
    name: 'Arbitrum',
    decimals: 18,
    fetchFunction: (address: string) =>
      fetchGeneralTransactions('ARBITRUM', address),
    cache: true,
    networks: {
      mainnet: {
        explorer: 'api.arbiscan.io',
      },
      goerli: {
        explorer: 'api-goerli.arbiscan.io',
      },
    },
    currency: 'ETH',
    smartContract: {
      file: 'ERC20',
      name: 'ERC20',
    },
  },
  BASE: {
    name: 'Base',
    decimals: 18,
    fetchFunction: (address: string) =>
      fetchGeneralTransactions('BASE', address),
    cache: true,
    networks: {
      mainnet: {
        explorer: 'api.basescan.org',
      },
      goerli: {
        explorer: 'api-goerli.basescan.org',
      },
    },
    currency: 'ETH',
    smartContract: {
      file: 'ERC20',
      name: 'ERC20',
    },
  },
  CELO: {
    name: 'Celo',
    decimals: 18,
    fetchFunction: (address: string) =>
      fetchGeneralTransactions('CELO', address),
    cache: true,
    networks: {
      mainnet: {
        explorer: 'api.celoscan.io',
      },
      alfajores: {
        explorer: 'api-alfajores.celoscan.io',
      },
    },
    currency: 'CELO',
    smartContract: {
      file: 'ERC20',
      name: 'ERC20',
    },
  },
  TRON: {
    name: 'Tron',
    decimals: 6,
    fetchFunction: (address: string) =>
      fetchPublicTransactions(
        `https://api.trongrid.io/v1/accounts/${address}/transactions?only_to=true&only_confirmed=true&limit=50&order_by=block_timestamp,asc`,
      ),
    cache: false,
    networks: {
      mainnet: {
        explorer: 'api.trongrid.io',
      },
      shasta: {
        explorer: 'api.shasta.trongrid.io',
      },
      nile: {
        explorer: 'api.nileex.io',
      },
    },
    currency: 'TRX',
  },
  RSK: {
    name: 'RSK',
    decimals: 18,
    fetchFunction: (address: string) =>
      fetchPublicTransactions(
        `https://rootstock.blockscout.com/api/v2/addresses/${address}/transactions?filter=to%20%7C%20from`,
      ),
    cache: true,
    networks: {
      mainnet: {
        explorer: 'rootstock.blockscout.com/api/v2',
      },
    },
    currency: 'RBTC',
  },
  HECO: {
    name: 'Huobi ECO Chain',
    decimals: 18,
    fetchFunction: (address: string) =>
      fetchPublicTransactions(
        `https://api.hecoinfo.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc`,
      ),
    cache: false,
    networks: {
      mainnet: {
        explorer: 'api.hecoinfo.com',
      },
    },
    currency: 'HT',
    smartContract: {
      file: 'ERC20',
      name: 'HRC20',
    },
  },
  CRONOS: {
    name: 'Cronos',
    decimals: 18,
    fetchFunction: (address: string) =>
      fetchGeneralTransactions('CRONOS', address),
    cache: true,
    networks: {
      mainnet: {
        explorer: 'api.cronoscan.com',
      },
    },
    currency: 'CRON',
    smartContract: {
      file: 'ERC20',
      name: 'CRC20',
    },
  },
}
