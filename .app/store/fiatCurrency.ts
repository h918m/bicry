import { defineStore } from 'pinia'
import type { Currency, JSONResponse } from '~~/types'
import useSettings from '~~/composables/useSettings'

export const useFiatCurrencyStore = defineStore({
  // unique id of the store across your application
  id: 'fiatCurrencies',

  // a function that returns a fresh state
  state: () => ({
    currencies: [] as Currency[],
    currentCurrency: null as Currency | null,
    loading: false,
  }),

  // optional getters
  getters: {
    currencyCount(state) {
      return state.currencies.length
    },
  },

  // actions/mutations
  actions: {
    async fetchCurrencies() {
      this.loading = true
      const { getCurrencies } = useSettings()
      const response: JSONResponse = await getCurrencies()
      if (response.status === 'success') {
        this.currencies = response.data.result
      }
      this.loading = false
    },

    async fetchCurrency(currencyId: string) {
      const { getCurrency } = useSettings()
      const response: JSONResponse = await getCurrency(currencyId)
      if (response.status === 'success') {
        this.currentCurrency = response.data.result
      }
    },

    async updateCurrenciesStatus(ids: number[], status: boolean) {
      try {
        // Here you can call an API to update Currencies' status by IDs
        // Assuming you have a composable function like `updateCurrenciesStatus` to do this
        const { updateCurrenciesStatus } = useSettings()
        const response = await updateCurrenciesStatus(ids, status)

        // Update the Currencies in the state
        this.currencies = this.currencies.map((currency) =>
          ids.includes(currency.id) ? { ...currency, status } : currency,
        )

        return response
      } catch (error) {
        return error
      }
    },

    getCurrencyByCode(code: string) {
      return this.currencies.find((currency) => currency.code === code)
    },
  },
})
