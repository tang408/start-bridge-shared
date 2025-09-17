<template>
  <div class="fs-24">幫助中心(FAQ)</div>

  <div>
    <SharedTabs
      class="mt-05 flow-col-mobile"
      v-model="activeTab"
      :tabs="[
        { label: '創業者常見問題(前台)', value: 'ent' },
        { label: '共創者常見問題(前台)', value: 'creator' },
      ]"
    />

    <div v-if="activeTab === 'ent'" class="faq-form">
      <form @submit.prevent="handleForm('ent')" class="form">
        <div class="ent-content">詢問表單</div>

        <SharedInput
          id="brand-ent"
          label="品牌/專案名稱*"
          v-model="formEnt.brand"
          :error="errorsEnt.brand"
        />

        <SharedSelect
          id="topic-ent"
          label="諮詢內容*"
          :options="topics"
          v-model="formEnt.topic"
          :error="errorsEnt.topic"
        />

        <SharedTextarea
          id="other-ent"
          label="其他需求"
          v-model="formEnt.other"
        />

        <SharedRadio
          id="time-ent"
          label="聯繫時間*"
          :options="timeOptions"
          v-model="formEnt.contactTime"
          :error="errorsEnt.contactTime"
        />

        <button type="submit" class="btn-submit">送出</button>
      </form>
    </div>

    <div v-if="activeTab === 'creator'" class="faq-form">
      <form @submit.prevent="handleForm('creator')" class="form">
        <div class="ent-content">詢問表單</div>

        <SharedInput
          id="brand-creator"
          label="品牌/專案名稱*"
          v-model="formCreator.brand"
          :error="errorsCreator.brand"
        />

        <SharedSelect
          id="topic-creator"
          label="諮詢內容*"
          :options="topics"
          v-model="formCreator.topic"
          :error="errorsCreator.topic"
        />

        <SharedTextarea
          id="other-creator"
          label="其他需求"
          v-model="formCreator.other"
        />

        <SharedRadio
          id="time-creator"
          label="聯繫時間*"
          :options="timeOptions"
          v-model="formCreator.contactTime"
          :error="errorsCreator.contactTime"
        />

        <button type="submit" class="btn-submit">送出</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedSelect from "@/components/shared/Shared-Select.vue";
import SharedTextarea from "@/components/shared/Shared-Textarea.vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";

const activeTab = ref("ent");

const topics = [
  { value: "1", text: "產品問題" },
  { value: "2", text: "付款問題" },
  { value: "3", text: "其他" },
];

const timeOptions = [
  { text: "9:00–12:00", value: "morning" },
  { text: "14:00–18:00", value: "afternoon" },
  { text: "18:00–22:00", value: "evening" },
  { text: "任何時間", value: "any" },
];

const formEnt = reactive({
  brand: "",
  topic: "",
  other: "",
  contactTime: "",
});
const errorsEnt = reactive({
  brand: "",
  topic: "",
  contactTime: "",
});

const formCreator = reactive({
  brand: "",
  topic: "",
  other: "",
  contactTime: "",
});
const errorsCreator = reactive({
  brand: "",
  topic: "",
  contactTime: "",
});

function handleForm(type) {
  const form = type === "ent" ? formEnt : formCreator;
  const errors = type === "ent" ? errorsEnt : errorsCreator;

  Object.keys(errors).forEach((k) => (errors[k] = ""));
  if (!form.brand) errors.brand = "請輸入品牌或專案名稱";
  if (!form.topic) errors.topic = "請選擇詢問內容";
  if (!form.contactTime) errors.contactTime = "請選擇聯繫時間";

  if (Object.values(errors).some(Boolean)) return;

  alert(`${type === "ent" ? "創業者" : "共創者"}表單送出成功！`);
}
</script>

<style lang="scss" scoped>
.faq-form {
  margin-top: 20px;
  .form {
    display: grid;
    gap: 16px;
  }
}

.btn-submit {
  background: #ff6634;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #ff7f50;
  }
}

.ent-content {
  font-weight: $fw-500;
  font-size: $fs-18;
  line-height: $lh-22;
}
</style>
