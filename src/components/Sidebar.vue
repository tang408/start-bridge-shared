<template>
  <aside class="sidebar">
    <div class="sidebar-card">
      <div class="profile">
        <div class="avatar-img" @click="triggerFileUpload">
          <img class="avatar" :src="displayAvatar" alt="用戶頭像" />
          <div class="avatar-overlay">
            <img
                class="avatar-edit"
                src="@/assets/icon/avatar-edit.png"
                alt="編輯頭像"
            />
            <span class="avatar-text">更換頭像</span>
          </div>
          <!-- 載入中遮罩 -->
          <div v-if="uploading" class="avatar-loading">
            <div class="spinner"></div>
          </div>
          <!-- 隱藏的文件上傳 input -->
          <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileSelect"
          />
        </div>
        <div>
          <div class="roles">
            <span class="role">創業家</span><span class="sep">|</span
          ><span class="role">共創者</span>
          </div>
          <div class="name" :title="displayName">{{ displayName }}</div>
        </div>
      </div>

      <nav class="menu">
        <button
            v-for="item in items"
            :key="item.key"
            class="menu-item"
            :class="{ active: $route.name === item.key }"
            @click="$emit('select', item)"
            @mouseenter="hoveredKey = item.key"
            @mouseleave="hoveredKey = ''"
        >
          <div class="menu-item-content">
            <img class="icon" :src="getIcon(item)" :alt="item.label" />
            <span class="label"
            >{{ item.label }}
              <span v-if="item.key === 'email' && totalUnreadCount > 0" class="notice">
                {{ totalUnreadCount }}
              </span>
            </span>
          </div>
        </button>

        <div class="logout">
          <button class="logout-btn" @click="$emit('logout')">登出</button>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications.js'
import {computed, ref} from 'vue'
import side1 from '@/assets/icon/side-1.svg'
import side2 from '@/assets/icon/side-2.svg'
import side3 from '@/assets/icon/side-3.svg'
import side4 from '@/assets/icon/side-4.svg'
import side5 from '@/assets/icon/side-5.svg'
import side6 from '@/assets/icon/side-6.svg'
import side8 from '@/assets/icon/side-8.svg'
import side9 from '@/assets/icon/side-9.svg'
import side1Active from '@/assets/icon/side-1-active.svg'
import side2Active from '@/assets/icon/side-2-active.svg'
import side3Active from '@/assets/icon/side-3-active.svg'
import side4Active from '@/assets/icon/side-4-active.svg'
import side5Active from '@/assets/icon/side-5-active.svg'
import side6Active from '@/assets/icon/side-6-active.svg'
import side8Active from '@/assets/icon/side-8-active.svg'
import side9Active from '@/assets/icon/side-9-active.svg'
import avatarImg from '@/assets/images/avatar.png'
import logoImg from '/favicon.svg'
const { totalUnreadCount } = useNotifications('user')

// ⭐ 計算屬性：如果沒有頭像，使用預設頭像
const displayAvatar = computed(() => {
  return props.avatar || logoImg
});

const props = defineProps({
  displayName: { type: String, default: '帳號名稱帳號名稱' },
  avatar: { type: String, default: avatarImg },
  uploadUserAvatar: { type: Function, required: true },
  updateUserAvatar: { type: Function, required: true }
})

const emit = defineEmits(['select', 'logout', 'avatar-updated'])

useRoute()

console.log(totalUnreadCount.value)

const items = [
  { key: 'profile', label: '基本資料', icon: side1, iconActive: side1Active },
  {
    key: 'email',
    label: '我的信箱',
    icon: side2,
    iconActive: side2Active,
    count: totalUnreadCount,
  },
  { key: 'favorites', label: '我的收藏', icon: side3, iconActive: side3Active },
  {
    key: 'participation',
    label: '參與專案管理',
    icon: side4,
    iconActive: side4Active,
  },
  {
    key: 'startup',
    label: '創業計劃管理',
    icon: side5,
    iconActive: side5Active,
  },
  { key: 'contracts', label: '公版合約', icon: side6, iconActive: side6Active },
  {
    key: 'courses',
    label: '課程/講座報名',
    icon: side8,
    iconActive: side8Active,
  },
  { key: 'faq', label: '幫助中心(FAQ)', icon: side9, iconActive: side9Active },
]

const route = useRoute()
const hoveredKey = ref('')
const fileInput = ref(null)
const uploading = ref(false)

const getIcon = (item) => {
  if (route.name === item.key || hoveredKey.value === item.key) {
    return item.iconActive
  }
  return item.icon
}

// 觸發文件選擇
const triggerFileUpload = () => {
  if (uploading.value) return
  fileInput.value?.click()
}

// 處理文件選擇
const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 驗證文件類型
  if (!file.type.startsWith('image/')) {
    alert('請選擇圖片文件')
    return
  }

  // 驗證文件大小（例如限制 5MB）
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    alert('圖片大小不能超過 5MB')
    return
  }

  uploading.value = true

  try {
    // 步驟 1: 上傳圖片，獲取 ID
    console.log('開始上傳圖片...')
    const uploadResult = await props.uploadUserAvatar(file)

    if (!uploadResult || !uploadResult.id) {
      throw new Error('上傳失敗：未返回圖片 ID')
    }

    const imageId = uploadResult.id
    console.log('圖片上傳成功，ID:', imageId)

    // 步驟 2: 使用獲取的 ID 更新用戶頭像
    console.log('更新用戶頭像...')
    await props.updateUserAvatar(imageId)

    console.log('頭像更新成功')

    // 發送事件通知父組件
    emit('avatar-updated', imageId)

  } catch (error) {
    console.error('頭像上傳失敗:', error)
    alert(error.message || '頭像上傳失敗，請稍後再試')
  } finally {
    uploading.value = false
    // 清空 input，允許重新選擇相同文件
    event.target.value = ''
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 240px;
  @media (max-width: 576px) {
    width: 100%;
  }
  &-card {
    padding: 70px 0;
    min-height: 520px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    @media (min-width: 577px) {
      background: $card-bg;
      box-shadow: 4px 4px 20px #0000000d;
      border-radius: 30px;
      width: 250px;
    }
  }
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $gap-25;
  padding: 6px 0 10px;
  text-align: center;

  .avatar-img {
    position: relative;
    cursor: pointer;
    width: 92px;
    height: 92px;
    border-radius: 50%;
    overflow: hidden;

    &:hover .avatar-overlay {
      opacity: 1;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s;
  }

  // Hover 遮罩層
  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  .avatar-edit {
    width: 32px;
    height: 32px;
    filter: brightness(0) invert(1);
  }

  .avatar-text {
    color: white;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  // 載入中遮罩
  .avatar-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .roles {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: $brand-orange;
    gap: $gap-2;

    span {
      font-weight: $fw-600;
      font-size: $fs-12;
      line-height: $lh-17;
    }

    .role {
      font-weight: $fw-700;
      letter-spacing: 0.02em;
    }
    .sep {
      opacity: 0.7;
    }
  }
  .name {
    font-weight: $fw-400;
    font-size: $fs-14;
    line-height: $lh-17;
    color: $text-dark;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 0.5rem;
  }
}

.logout {
  width: 100%;
  text-align: center;
  &-btn {
    margin-top: auto;
    align-self: flex-start;
    padding: 10px 12px;
    border: none;
    background: transparent;
    color: $text-dark;
    cursor: pointer;

    font-weight: $fw-400;
    font-size: $fs-16;
    line-height: $lh-19;
    letter-spacing: 0.04em;
    color: $text-dark;
  }
}
</style>
