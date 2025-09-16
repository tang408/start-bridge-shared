<template>
  <div class="form-group">
    <label :for="id"> {{ label }}</label>

    <div class="upload-row">
      <div class="fake-input-wrap">
        <input
          class="fake-input"
          type="text"
          :value="displayName"
          :placeholder="placeholder"
          :class="{ 'is-invalid': error }"
          readonly
          @click="openDialog"
        />
        <button
          v-if="hasFile"
          type="button"
          class="btn-clear-x"
          aria-label="清除檔案"
          title="清除檔案"
          @click.stop="clearFiles"
        >
          ×
        </button>
      </div>

      <button type="button" class="btn-upload" @click="openDialog">上傳</button>

      <input
        class="real-input"
        :id="id"
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="onChange"
      />
    </div>

    <p class="hint">
      僅接受 .jpg、.gif、.png、.pdf，檔案大小請勿超過 {{ maxSizeMb }}mb
    </p>
    <p class="error-msg" v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const model = defineModel({
  type: [File, Object, String, Array, null],
  default: null,
});

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  accept: { type: String, default: ".jpg,.jpeg,.gif,.png,application/pdf" },
  required: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  maxSizeMb: { type: Number, default: 10 },
  error: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  buttonText: { type: String, default: "" },
});

const emit = defineEmits(["invalid"]);
const fileInput = ref(null);

function normOne(v) {
  if (!v) return null;
  if (v instanceof File) return { name: v.name, file: v };
  if (typeof v === "string") return { name: v.split("/").pop(), url: v };
  if (typeof v === "object") {
    const name = v.name || (v.url ? String(v.url).split("/").pop() : "");
    return {
      name,
      url: v.url,
      file: v.file instanceof File ? v.file : undefined,
    };
  }
  return null;
}

const filesArray = computed(() => {
  const v = model.value;
  if (props.multiple) {
    const arr = Array.isArray(v) ? v : [];
    return arr.map(normOne).filter(Boolean);
  } else {
    const one = normOne(v);
    return one ? [one] : [];
  }
});

const hasFile = computed(() => filesArray.value.length > 0);

const displayName = computed(() => {
  if (!hasFile.value) return "";
  if (!props.multiple) return filesArray.value[0].name || "";
  const names = filesArray.value.map((x) => x.name || "").filter(Boolean);
  return names.length > 1
    ? `已選 ${names.length} 個檔案：${names.join("、")}`
    : names[0] || "";
});

function openDialog() {
  fileInput.value?.click();
}

function onChange(e) {
  const picked = Array.from(e.target.files || []);
  if (!picked.length) return;

  const over = picked.find((f) => f.size > props.maxSizeMb * 1024 * 1024);
  if (over) {
    emit("invalid", `檔案「${over.name}」超過 ${props.maxSizeMb}MB`);
    resetInput();
    return;
  }
  model.value = props.multiple ? picked : picked[0];
}

function clearFiles() {
  model.value = props.multiple ? [] : null;
  resetInput();
}

function resetInput() {
  if (fileInput.value) fileInput.value.value = "";
}
</script>

<style scoped lang="scss">
.form-group {
  .upload-row {
    display: flex;
    align-items: center;
    gap: $gap-12;
    margin-top: 6px;
  }

  .fake-input-wrap {
    position: relative;
    flex: 1 1 auto;
  }
  .fake-input {
    width: 100%;
    height: 40px;
    padding: 10px 36px 10px 12px;
    border: 1px solid #ddd;
    border-radius: $br-6;
    font-size: $fs-14;
    cursor: pointer;
    &.is-invalid {
      border-color: $text-red;
    }
  }
  .btn-clear-x {
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    font-size: $fs-18;
    line-height: 1;
    cursor: pointer;
    padding: 0 4px;
    color: $text-dark;
  }
  .btn-clear-x:hover {
    color: $text-deep;
  }

  .btn-upload {
    flex: 0 0 108px;
    height: 40px;
    border: none;
    border-radius: $br-8;
    background: $btn-orange;
    color: #fff;
    font-weight: $fw-600;
    cursor: pointer;
    transition: 0.2s;
  }
  .btn-upload:hover {
    background: $text-red;
  }

  .real-input {
    display: none;
  }

  .hint {
    margin-top: 6px;
    font-size: $fs-12;
    color: #888;
  }
}
</style>
