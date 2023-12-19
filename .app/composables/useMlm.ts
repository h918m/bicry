import useMlmReferral from './mlm/user/referrals'

// Composable to make blog tasks easier
export default function useMlm() {
  const mlmReferrals = useMlmReferral()

  return {
    ...mlmReferrals,
  }
}
