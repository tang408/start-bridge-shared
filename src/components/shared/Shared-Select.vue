<template>
  <div class="form-group" ref="dropdownRef">
    <div class="label-row">
      <label :for="id">{{ label }}</label>
      <label v-if="publicable" class="public-opt">
        <input type="checkbox" v-model="publicModel" />
        <span>{{ publicLabel }}</span>
      </label>
    </div>

    <div class="custom-select" @click="toggleDropdown">
      <div class="selected" :class="{ 'is-invalid': error }">
        {{ selectedLabel || placeholder }}
        <span class="arrow" :class="{ open }"></span>
      </div>
      <ul v-if="open" class="dropdown">
        <li
          v-for="opt in options"
          :key="opt.value"
          :class="{ active: opt.value === model }"
          @click.stop="selectOption(opt.value)"
        >
          {{ opt.text }}
        </li>
      </ul>
    </div>

    <p class="error-msg" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const model = defineModel({ type: [String, Number], default: "" });
const publicModel = defineModel("public", { type: Boolean, default: false });

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  options: { type: Array, required: true },
  placeholder: { type: String, default: "請選擇" },
  error: { type: String, default: "" },
  publicable: { type: Boolean, default: false },
  publicLabel: { type: String, default: "公開" },
});

const open = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  open.value = !open.value;
};

const selectOption = (value) => {
  model.value = value;
  open.value = false;
};

const selectedLabel = computed(() => {
  const opt = props.options.find((o) => o.value === model.value);
  return opt ? opt.text : "";
});

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    open.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped lang="scss">
.form-group {
  .custom-select {
    position: relative;
    user-select: none;

    .selected {
      width: 100%;
      padding: 10px 36px 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background-color: transparent;
      font-size: 14px;
      cursor: pointer;

      background-image: url("@/assets/icon/arrow.png");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 14px;
      &.is-invalid {
        border-color: #db3838;
        background-color: #fff0f0;
      }
    }

    .dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: #ffffff;
      border: 1px solid #ddd;
      border-radius: 6px;
      margin-top: 1px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 10;
      padding-left: 0;
      li {
        padding: 10px 12px;
        cursor: pointer;
        background-color: #ffffff;

        &:hover {
          background-color: #f1f1f1;
        }

        &.active {
          background-color: #eeeeee;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
