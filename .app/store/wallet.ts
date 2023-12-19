import { defineStore } from 'pinia'
import type { Wallet } from '~~/types'

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    wallet: null as Wallet | null,
    wallets: [] as Wallet[],
    loading: false,
  }),
  getters: {
    getWallet: (state) => (currency: string) => {
      return state.wallets[currency]
    },
    getFiatWallets: (state) => {
      return Object.values(state.wallets).filter(
        (wallet: any) => wallet.type === 'FIAT',
      )
    },
    getFirstFiatWallet: (state) => {
      return Object.values(state.wallets).find(
        (wallet: any) => wallet.type === 'FIAT',
      )
    },
    getSpotWallets: (state) => {
      return Object.values(state.wallets).filter(
        (wallet: any) => wallet.type === 'SPOT',
      )
    },
    getFirstSpotWallet: (state) => {
      return Object.values(state.wallets).find(
        (wallet: any) => wallet.type === 'SPOT',
      )
    },
  },

  actions: {
    async fetchWallets() {
      const { getWallets } = useWallet()
      this.loading = true
      try {
        const response = await getWallets()
        let wallets = {}
        if (
          response?.status === 'success' &&
          response?.data?.result &&
          response?.data?.result.length > 0
        ) {
          response.data.result.map((wallet) => {
            wallets[wallet.currency] = wallet
          })
          this.wallets = wallets
        }
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },

    async fetchWallet(currency: string, type: string) {
      let response = null
      if (type === 'SPOT') {
        const { getSpotWallet } = useWallet()
        response = await getSpotWallet(currency, type)
      } else if (type === 'FIAT') {
        const { getFiatWallet } = useWallet()
        response = await getFiatWallet(currency, type)
      }
      this.wallet = response?.data?.result ?? null
    },
  },
})
