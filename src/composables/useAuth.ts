import { ref, computed } from "vue";

const tokenRef = ref<string | null>(null);
const userRef = ref<any>(null);
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
      salesRef.value = obj?.sales ?? null;
    }
  } catch {}
}

function persist() {
  if (typeof localStorage === "undefined") return;
  const data = JSON.stringify({ 
    token: tokenRef.value, 
    user: userRef.value,
    sales: salesRef.value 
  });
  localStorage.setItem("auth", data);
}

export function useAuth() {
  hydrateFromStorage();

  const isLoggedIn = computed(() => !!tokenRef.value);
  const isSales = computed(() => !!salesRef.value);
  const isUser = computed(() => !!userRef.value);

  async function login(payload: { token: string; user?: any; sales?: any }) {
    tokenRef.value = payload.token;
    userRef.value = payload.user ?? null;
    salesRef.value = payload.sales ?? null;
    persist();
  }

  async function logout() {
    tokenRef.value = null;
    userRef.value = null;
    salesRef.value = null;
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("auth");
    }
  }

  const currentUser = computed(() => userRef.value);
  const currentSales = computed(() => salesRef.value);

  return {
    isLoggedIn,
    currentUser,
    currentSales,
    isSales,
    isUser,
    login,
    logout,
  };
}
