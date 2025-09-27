<template>
  <div class="dropdown" :class="{ open: isOpen }" @click.stop>
    <label v-if="label" class="dropdown-label">{{ label }}</label>
    <button
      class="dropdown-btn"
      type="button"
      @click="toggle"
      :aria-expanded="isOpen ? 'true' : 'false'"
    >
      {{ currentLabel }}
    </button>

    <ul class="dropdown-list">
      <li
        v-for="opt in options"
        :key="opt.value"
        :class="{ active: modelValue === opt.value }"
        @click="select(opt.value)"
      >
        {{ opt.label }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
} from "vue";

const props = defineProps({
  modelValue: [String, Number, null],
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: "請選擇" },
  emptyAsUnselected: { type: Boolean, default: true },
  label: { type: String, default: "" },
  readonly: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);

const uid = getCurrentInstance()?.uid ?? Math.random().toString(36).slice(2);

function open() {
  if (props.readonly) return;
  if (isOpen.value) return;
  isOpen.value = true;
  window.dispatchEvent(
    new CustomEvent("shared-dropdown:opened", { detail: { uid } })
  );
}

function toggle() {
  isOpen.value ? close() : open();
}
function close() {
  isOpen.value = false;
}
function select(val) {
  emit("update:modelValue", val);
  close();
}

function onDocClick() {
  close();
}

function onOtherOpened(e) {
  const other = e?.detail?.uid;
  if (other && other !== uid) close();
}

onMounted(() => {
  document.addEventListener("click", onDocClick);
  window.addEventListener("shared-dropdown:opened", onOtherOpened);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  window.removeEventListener("shared-dropdown:opened", onOtherOpened);
});

const currentLabel = computed(() => {
  const unselected =
    props.modelValue === null ||
    (props.emptyAsUnselected && props.modelValue === "");
  if (unselected) return props.placeholder;

  const found = props.options.find((o) => o.value === props.modelValue);
  return found ? found.label : props.placeholder;
});
</script>

<style scoped lang="scss">
.dropdown {
  position: relative;
  display: grid;
  @media (max-width: 576px) {
    width: 100%;
  }
}

.dropdown-label {
  font-weight: 400 !important;
}

.dropdown-btn {
  border: 1px solid #e9ece8;
  background: transparent;
  padding: 4px 36px 4px 12px;
  border-radius: 8px;
  cursor: pointer;
  min-width: 160px;
  text-align: left;
  position: relative;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: #555555;
  @media (max-width: 576px) {
    min-width: 120px;
  }
}

.dropdown-btn::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 12px;
  width: 8px;
  height: 8px;
  border-right: 2px solid #8a8f8c;
  border-bottom: 2px solid #8a8f8c;
  transform: translateY(-60%) rotate(45deg);
  transition: transform 0.15s ease;
}

.dropdown.open .dropdown-btn::after {
  transform: translateY(-40%) rotate(-135deg);
}

.dropdown-list {
  position: absolute;
  top: 110%;
  left: 0;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  min-width: 160px;
  padding: 6px;
  list-style: none;
  margin: 0;
  display: none;
  z-index: 10;
  @media (max-width: 576px) {
    min-width: 120px;
  }
}

.dropdown.open .dropdown-list {
  display: block;
}

.dropdown-list li {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
}
.dropdown-list li:hover {
  background: #f7f7f7;
}
.dropdown-list li.active {
  background: #fff1e0;
  color: #a65b12;
  font-weight: 700;
}
</style>
