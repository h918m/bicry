import type { JSONResponse } from '~~/types'

export default function useMlmReferral() {
  const apiPath = useRuntimeConfig().public.apiPath
  return {
    getReferrals,
  }

  async function getReferrals(): Promise<JSONResponse> {
    const response = await $fetch(apiPath + `/api/affiliate/referrals`, {
      credentials: 'include',
      headers: {
        'client-platform': 'browser',
      },
    })
    return response
  }
}
