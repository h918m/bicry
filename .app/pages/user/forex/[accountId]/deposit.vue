<script setup lang="ts">
definePageMeta({
  title: 'Deposit',
})

const route = useRoute()
const router = useRouter()
const { toast } = useUtils()
const { storeDepositTransaction } = useForex()
const { getWallets } = useWallet()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const { accountId } = route.params

const depositAmount = ref(0)
const isDepositing = ref(false)
const selectedWallet = ref(null)
const wallets = ref([])
const validWallets = computed(() =>
  wallets.value.filter(
    (wallet) =>
      wallet.balance > 0 &&
      wallet.type === settings.value?.forex_deposit_wallet_type,
  ),
)

onMounted(async () => {
  const response = await getWallets()
  if (response.status === 'success') {
    wallets.value = response.data.result
  }
})

async function deposit() {
  isDepositing.value = true
  if (selectedWallet.value?.value === null) {
    toast.dangerText('Please select a wallet')
    return
  }

  try {
    const response = await storeDepositTransaction(
      accountId,
      selectedWallet.value?.value?.uuid,
      depositAmount.value,
    )

    toast.response(response)
    if (response.status === 'success') {
      router.push(`/user/forex`)
    }
  } catch (e) {
    toast.danger(e)
  }
  isDepositing.value = false
}
</script>

<template>
  <div>
    <TairoContentWrapper>
      <template #left>
        <BaseHeading size="xl">
          {{ $t('Deposit') }} to account ID: {{ accountId }}
        </BaseHeading>
      </template>
      <template #right>
        <div>
          <BaseButton to="/user/forex" color="muted" flavor="pastel">
            <Icon name="line-md:chevron-left" class="h-4 w-4" />
            <span>{{ $t('Cancel') }}</span>
          </BaseButton>
        </div>
      </template>

      <div class="space-y-5 min-h-screen pb-20">
        <div>
          <BaseHeading
            as="h3"
            size="2xl"
            weight="bold"
            class="text-muted-800 dark:text-white items-center flex"
          >
            <Icon
              name="line-md:loading-alt-loop"
              class="h-6 w-6 mr-2"
              v-if="!selectedWallet"
            />
            <Icon name="line-md:confirm-circle" class="h-6 w-6 mr-2" v-else />
            {{ $t('Select Wallet') }}
          </BaseHeading>
          <BaseListbox
            class="max-w-sm mt-5 pl-8 z-40"
            v-model="selectedWallet"
            :items="
              validWallets.length > 0
                ? validWallets.map((wallet) => ({
                    label: `${wallet.type} - ${wallet.currency} - ${wallet.balance}`,
                    value: wallet,
                  }))
                : [{ label: 'No wallet available', value: null }]
            "
            :properties="{
              label: 'label',
              value: 'value',
            }"
            placeholder="Select a wallet"
            shape="rounded"
          />
        </div>
        <template v-if="selectedWallet && selectedWallet.value !== null">
          <hr />
          <BaseHeading
            as="h3"
            size="2xl"
            weight="bold"
            class="text-muted-800 dark:text-white flex items-center gap-2"
          >
            <Icon name="line-md:downloading-loop" class="h-6 w-6" />
            {{ $t('Deposital Details') }}
          </BaseHeading>
          <div class="space-y-5 pl-8">
            <div class="w-full">
              <BaseInput
                v-model="depositAmount"
                :key="selectedWallet"
                shape="rounded"
                type="number"
                label="Deposit amount"
                placeholder="Enter your deposit amount..."
              />
            </div>
          </div>

          <hr />
          <div>
            <BaseButton
              class="w-full"
              color="success"
              @click="deposit"
              :disabled="!depositAmount || isDepositing"
              :loading="isDepositing"
              >{{ $t('Deposit') }}</BaseButton
            >
          </div>
        </template>
      </div>
    </TairoContentWrapper>
  </div>
</template>
