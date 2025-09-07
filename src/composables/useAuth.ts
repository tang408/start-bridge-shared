import { ref, computed } from "vue";

const tokenRef = ref<string | null>(null);
const userRef = ref<any>(null);
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
    }
  } catch {}
}

function persist() {
  if (typeof localStorage === "undefined") return;
  const data = JSON.stringify({ token: tokenRef.value, user: userRef.value });
  localStorage.setItem("auth", data);
}

export function useAuth() {
  hydrateFromStorage();

  const isLoggedIn = computed(() => !!tokenRef.value);

  async function login(payload: { token: string; user?: any }) {
    tokenRef.value = payload.token;
    userRef.value = payload.user ?? null;
    persist();
  }

  async function logout() {
    tokenRef.value = null;
    userRef.value = null;
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("auth");
    }
  }

  const currentUser = computed(() => userRef.value);

  return {
    isLoggedIn,
    currentUser,
    login,
    logout,
  };
}
