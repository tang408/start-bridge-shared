<template>
  <div class="form-group" ref="dropdownRef">
    <div class="label-row">
      <label :for="id">{{ label }}</label>
      <label v-if="publicable" class="public-opt">
        <input type="checkbox" v-model="publicModel" :disabled="disabled" />
        <span>{{ publicLabel }}</span>
      </label>
    </div>

    <div class="custom-select" @click="toggleDropdown">
      <div class="selected" :class="{ 'is-invalid': error, 'disabled': disabled }">
        <span v-if="selectedLabels.length > 0" class="selected-items">
          {{ selectedLabels.join(', ') }}
        </span>
        <span v-else class="placeholder-text">{{ placeholder }}</span>
        <span class="arrow" :class="{ open: open && !disabled }"></span>
      </div>

      <ul v-if="open && !disabled" class="dropdown">
        <li
            v-for="opt in options"
            :key="opt.value"
            :class="{ active: isSelected(opt.value) }"
            @click.stop="toggleOption(opt.value)"
        >
          <input
              type="checkbox"
              :checked="isSelected(opt.value)"
              readonly
          />
          <span>{{ opt.text }}</span>
        </li>
      </ul>
    </div>

    <p class="error-msg" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

// 🆕 使用 String 類型，內部轉換為陣列處理
const model = defineModel({ type: String, default: "" });
const publicModel = defineModel("public", { type: Boolean, default: false });

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  options: { type: Array, required: true },
  placeholder: { type: String, default: "請選擇" },
  error: { type: String, default: "" },
  publicable: { type: Boolean, default: false },
  publicLabel: { type: String, default: "公開" },
  disabled: { type: Boolean, default: false },
});

const open = ref(false);
const dropdownRef = ref(null);

// 🆕 將字串轉換為陣列
const selectedArray = computed(() => {
  if (!model.value || model.value === "") {
    return [];
  }
  return model.value.split(',').map(v => v.trim()).filter(v => v !== "");
});

const toggleDropdown = () => {
  if (!props.disabled) {
    open.value = !open.value;
  }
};

const isSelected = (value) => {
  // 🆕 將 value 轉為字串比較
  return selectedArray.value.includes(String(value));
};

const toggleOption = (value) => {
  const valueStr = String(value);
  const current = selectedArray.value;
  const index = current.indexOf(valueStr);

  let newArray;
  if (index > -1) {
    // 已選中，取消選擇
    newArray = current.filter(v => v !== valueStr);
  } else {
    // 未選中，添加選擇
    newArray = [...current, valueStr];
  }

  // 🆕 將陣列轉回字串
  model.value = newArray.join(',');
};

const selectedLabels = computed(() => {
  return selectedArray.value
      .map(val => {
        const opt = props.options.find(o => String(o.value) === val);
        return opt ? opt.text : null;
      })
      .filter(Boolean);
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
      display: flex;
      align-items: center;
      min-height: 40px;

      &.is-invalid {
        border-color: #db3838;
        background-color: #fff0f0;
      }

      &.disabled {
        cursor: not-allowed;
        background-color: #f5f5f5;
        color: #999;
      }

      .selected-items {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .placeholder-text {
        color: #999;
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
        display: flex;
        align-items: center;
        gap: 8px;

        &:hover {
          background-color: #f1f1f1;
        }

        &.active {
          background-color: #eeeeee;
          font-weight: 600;
        }

        input[type="checkbox"] {
          cursor: pointer;
          width: 16px;
          height: 16px;
          margin: 0;
          pointer-events: none;
        }

        span {
          flex: 1;
        }
      }
    }
  }
}
</style>
