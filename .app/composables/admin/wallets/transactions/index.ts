import type { JSONResponse } from '~~/types'

export default function useWallets() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    updateTransactionStatus,
  }

  async function updateTransactionStatus(
    referenceId: number,
    status: string,
    message?: string,
  ): Promise<JSONResponse> {
    const response = await $fetch(
      apiPath + `/api/admin/wallets/transactions/update-status`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'client-platform': 'browser',
        },
        body: {
          referenceId: referenceId,
          status: status,
          message: message,
        },
      },
    )
    return response
  }
}
