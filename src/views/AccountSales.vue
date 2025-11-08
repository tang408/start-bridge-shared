<template>
  <div class="back-background">
    <div class="container d-flex-block gap-5">
      <Sidebar
        :rank="user.rank"
        :name="user.name"
        :avatar="user.avatar"
        :notifyCount="user.notifyCount"
        :salesPerformance="user.salesPerformance"
        :founderCount="user.founderCount"
        :coreFounderCount="user.coreFounderCount"
        :teamMemberCount="user.teamMemberCount"
        :referralCode="user.referralCode"
        @select="onSelect"
        @logout="onLogout"
        @reset_password="onResetPassword"
        class="account-sidebar"
      />
      <div class="back-content w-100">
        <RouterView v-slot="{ Component, route }">
          <KeepAlive>
            <component v-if="route.meta?.keepAlive" :is="Component" />
          </KeepAlive>
          <component v-if="!route.meta?.keepAlive" :is="Component" />
        </RouterView>
        <transition name="fade">
          <div
            v-if="mobileAccountSidebarOpen"
            class="m-account-overlay d-lg-none"
            @click.self="toggleMobileAccountSidebar(false)"
          >
            <transition name="slide-right">
              <div class="m-account-panel" v-if="mobileAccountSidebarOpen">
                <Sidebar
                  :name="user.name"
                  :avatar="user.avatar"
                  :rank="user.rank"
                  :notifyCount="user.notifyCount"
                  :salesPerformance="user.salesPerformance"
                  :founderCount="user.founderCount"
                  :coreFounderCount="user.coreFounderCount"
                  :teamMemberCount="user.teamMemberCount"
                  :referralCode="user.referralCode"
                  @select="onSelect"
                  @logout="onLogout"
                  @reset_password="onResetPassword"
                />
              </div>
            </transition>
          </div>
        </transition>
      </div>
    </div>

    <!-- 密碼重設 Dialog -->
    <SharedModal
      v-model="showResetPasswordDialog"
      title="修改密碼"
      mode="confirm"
      confirmText="確認修改"
      cancelText="取消"
      :showCancel="true"
      @confirm="handleResetPassword"
    >
      <div class="reset-password-form">
        <SharedInput
          id="oldPassword"
          type="password"
          label="舊密碼*"
          placeholder="請輸入舊密碼"
          v-model="resetPasswordForm.oldPassword"
          :error="resetPasswordErrors.oldPassword"
          required
        />

        <SharedInput
          id="newPassword"
          type="password"
          label="新密碼*"
          placeholder="請輸入新密碼"
          v-model="resetPasswordForm.newPassword"
          :error="resetPasswordErrors.newPassword"
          required
        />

        <SharedInput
          id="confirmPassword"
          type="password"
          label="確認新密碼*"
          placeholder="請再次輸入新密碼"
          v-model="resetPasswordForm.confirmPassword"
          :error="resetPasswordErrors.confirmPassword"
          required
        />
      </div>
    </SharedModal>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import Sidebar from "@/components/SalesSidebar.vue";
import SharedModal from "@/components/shared/Shared-Modal.vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import {
  mobileAccountSidebarOpen,
  toggleMobileAccountSidebar,
} from "@/composables/useAccountSidebar";
import {useAuth} from "@/composables/useAuth.js";
import {onMounted, ref} from "vue";
import {salesApi} from "@/api/modules/sales.js";
import {salesLevelApi} from "@/api/modules/salesLevel.js";
import { useNotifications } from '@/composables/useNotifications.js';
import {NewAlert} from "@/composables/useAlert.js";

const router = useRouter();
const route = useRoute();
const { isLoggedIn, currentSales } = useAuth();
const { initUnreadCounts } = useNotifications('sales');

const user = ref({
  avatar: new URL("@/assets/images/avatar.png", import.meta.url).href,
  coreFounderCount:1234,
  founderCount:1234,
  name: "帳號名稱帳號名稱",
  notifyCount:1234,
  rank: "業務主管",
  referralCode:"ABCD1234",
  salesPerformance:1234,
  teamMemberCount:1234
});

// 密碼重設相關
const showResetPasswordDialog = ref(false);
const resetPasswordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});
const resetPasswordErrors = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const SalesLevels = ref([]);
async function getSalesLevel() {
  const response = await salesLevelApi.getSalesLevel();
  SalesLevels.value = response.data;
  console.log(SalesLevels.value);
}


async function getSalesInfo() {
  const formData = {
    salesId: currentSales.value,
  }

  try {
    const response = await salesApi.getSalesInfo(formData)
    if (response.code === 0) {
      const salesLevel = SalesLevels.value.find(level => level.id === response.data.rank);
      user.value = {
        ...user.value,
        ...response.data,
        rank: salesLevel ? salesLevel.name : `未知等級 (${response.data.rank})`
      }
    }
    console.log('Sales info:', response.data)
  } catch (error) {
    console.error('Error getting sales info:', error)
  }
}



onMounted(() => {
  if (isLoggedIn.value) {
    getSalesLevel();
    getSalesInfo();
    initUnreadCounts(currentSales.value);
  } else {
    router.push({ name: "Login" });
  }
});

function onSelect(item) {
  if (route.name !== item.key) {
    router.push({ name: item.key });
  }
}

function onLogout() {
  router.push({ name: "Login" });
}

function onResetPassword() {
  // 清空表單和錯誤訊息
  resetPasswordForm.value = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  };
  resetPasswordErrors.value = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  };
  showResetPasswordDialog.value = true;
}

async function handleResetPassword() {
  // 清空錯誤訊息
  resetPasswordErrors.value = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  };

  // 驗證表單
  let hasError = false;

  if (!resetPasswordForm.value.oldPassword) {
    resetPasswordErrors.value.oldPassword = "請輸入舊密碼";
    hasError = true;
  }

  if (!resetPasswordForm.value.newPassword) {
    resetPasswordErrors.value.newPassword = "請輸入新密碼";
    hasError = true;
  } else if (resetPasswordForm.value.newPassword.length < 6) {
    resetPasswordErrors.value.newPassword = "新密碼至少需要6個字元";
    hasError = true;
  }

  if (!resetPasswordForm.value.confirmPassword) {
    resetPasswordErrors.value.confirmPassword = "請確認新密碼";
    hasError = true;
  } else if (resetPasswordForm.value.newPassword !== resetPasswordForm.value.confirmPassword) {
    resetPasswordErrors.value.confirmPassword = "新密碼與確認密碼不一致";
    hasError = true;
  }

  if (hasError) return;

  try {
    const params = {
      salesId: currentSales.value,
      oldPassword: resetPasswordForm.value.oldPassword,
      newPassword: resetPasswordForm.value.newPassword
    };

    const response = await salesApi.resetPassword(params);

    if (response.code === 0) {
      await NewAlert.show("成功！", "密碼修改成功，請使用新密碼登入。");

      showResetPasswordDialog.value = false;
    } else {
     await NewAlert.show("注意！", response.message + "，密碼修改失敗，請洽客服人員。");
    }
  } catch (error) {
    console.error('Reset password error:', error);
    await NewAlert.show("注意！", "發生未知錯誤，請洽客服人員。");
  }
}
</script>
<style lang="scss" scoped>
.account-sidebar {
  @media (max-width: 991px) {
    display: none;
  }
}

.reset-password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 16px 0;
}
</style>
