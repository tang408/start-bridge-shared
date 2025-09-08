import { ref } from "vue";

export const mobileAccountSidebarOpen = ref(false);

export function toggleMobileAccountSidebar(val?: boolean) {
  mobileAccountSidebarOpen.value =
    typeof val === "boolean" ? val : !mobileAccountSidebarOpen.value;
}
