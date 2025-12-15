import { ref, computed } from "vue";

const tokenRef = ref<string | null>(null);
const userRef = ref<any>(null);
const userNameRef = ref<any>(null);
const salesRef = ref<any>(null);
let hydrated = false;

function hydrateFromStorage() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem("auth");
    if (raw) {
      const obj = JSON.parse(raw);
      tokenRef.value = obj?.token ?? null;
      userRef.value = obj?.user ?? null;
      userNameRef.value = obj?.userName ?? null;
      salesRef.value = obj?.sales ?? null;
    }
  } catch {}
}

function persist() {
  if (typeof localStorage === "undefined") return;
  const data = JSON.stringify({
    token: tokenRef.value,
    user: userRef.value,
    userName: userNameRef.value,
    sales: salesRef.value
  });
  localStorage.setItem("auth", data);
}

export function useAuth() {
  hydrateFromStorage();

  const isLoggedIn = computed(() => !!tokenRef.value);
  const isSales = computed(() => !!salesRef.value);
  const isUser = computed(() => !!userRef.value);

  async function login(payload: { token: string; user?: any; userName?: any; sales?: any }) {
    tokenRef.value = payload.token;
    userRef.value = payload.user ?? null;
    userNameRef.value = payload.userName ?? null;
    salesRef.value = payload.sales ?? null;
    persist();

    // ⭐ 登入時設定初始活動時間
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("lastActiveTime", Date.now().toString());
    }
  }

  async function logout() {
    tokenRef.value = null;
    userRef.value = null;
    userNameRef.value = null;
    salesRef.value = null;

    if (typeof localStorage !== "undefined") {
      // ⭐ 清除 auth 資料
      localStorage.removeItem("auth");

      // ⭐ 清除自動登出相關的時間記錄
      localStorage.removeItem("lastActiveTime");
      localStorage.removeItem("lastCloseTime");
    }
  }

  const currentUser = computed(() => userRef.value);
  const currentUserName = computed(() => userNameRef.value);
  const currentSales = computed(() => salesRef.value);

  return {
    isLoggedIn,
    currentUser,
    currentSales,
    currentUserName,
    isSales,
    isUser,
    login,
    logout,
  };
}
