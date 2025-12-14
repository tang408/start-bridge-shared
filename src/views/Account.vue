<template>
  <div class="back-background">
    <div class="container d-flex-block gap-5">
      <Sidebar
          :displayName="user.name"
          :avatar="user.avatar"
          :upload-user-avatar="handleUploadAvatar"
          :update-user-avatar="handleUpdateAvatar"
          @select="onSelect"
          @logout="onLogout"
          @avatar-updated="onAvatarUpdated"
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
                    :displayName="user.name"
                    :avatar="user.avatar"
                    :upload-user-avatar="handleUploadAvatar"
                    :update-user-avatar="handleUpdateAvatar"
                    @select="onSelect"
                    @logout="onLogout"
                    @avatar-updated="onAvatarUpdated"
                />
              </div>
            </transition>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import {
  mobileAccountSidebarOpen,
  toggleMobileAccountSidebar,
} from '@/composables/useAccountSidebar'
import { onMounted, ref } from 'vue'
import { userApi } from '@/api/modules/user.js'
import { fileApi } from '@/api/modules/file.js' // 確保引入 fileApi
import { useAuth } from '@/composables/useAuth.js'
import { useNotifications } from '@/composables/useNotifications.js'

const { initUnreadCounts } = useNotifications('user')

const router = useRouter()
const route = useRoute()
const { isLoggedIn, currentUser } = useAuth()

const user = ref({
  name: '',
  avatar: '',
  type: 0
})

// 獲取用戶名稱和頭像
async function getUserNameAndAvatar() {
  try {
    const formData = {
      userId: currentUser.value,
    }
    const response = await userApi.getUserNameAndAvatar(formData)
    user.value = response.data
    console.log('用戶資料:', response.data)
  } catch (error) {
    console.error('獲取用戶資料失敗:', error)
  }
}

// 上傳頭像圖片
const handleUploadAvatar = async (file) => {
  try {
    console.log('開始上傳頭像圖片...', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })

    // ✅ 直接傳 file、account 和 name 參數
    const response = await fileApi.uploadUserAvatar(
        file,              // File 物件
        currentUser.value, // 用戶 ID/帳號
        user.value.name    // 用戶名稱（可選）
    )

    console.log('圖片上傳成功:', response)

    // 返回包含 id 的對象
    return {
      id: response.data.id,
      url: response.data.url || response.data.displayName
    }
  } catch (error) {
    console.error('上傳頭像失敗:', error)
    throw new Error(error.message || '上傳頭像失敗，請稍後再試')
  }
}

// 更新用戶頭像
const handleUpdateAvatar = async (imageId) => {
  try {
    console.log('更新用戶頭像，圖片 ID:', imageId)

    const formData = {
      userId: currentUser.value,
      avatar: imageId
    }

    // 調用更新頭像 API
    await userApi.updateUserAvatar(formData)

    console.log('頭像更新成功')
  } catch (error) {
    console.error('更新頭像失敗:', error)
    throw new Error(error.message || '更新頭像失敗，請稍後再試')
  }
}

// 頭像更新成功的回調
const onAvatarUpdated = async (imageId) => {
  console.log('頭像已更新，圖片 ID:', imageId)

  // 重新獲取用戶資料以更新頭像顯示
  await getUserNameAndAvatar()
}

onMounted(() => {
  if (isLoggedIn.value) {
    getUserNameAndAvatar()
    initUnreadCounts(currentUser.value)
  } else {
    router.push({ name: 'login' })
  }
})

function onSelect(item) {
  if (route.name !== item.key) {
    router.push({ name: item.key })
  }
}

function onLogout() {
  router.push({ name: 'login' })
}
</script>

<style lang="scss" scoped>
.account-sidebar {
  @media (max-width: 991px) {
    display: none;
  }
}
</style>
