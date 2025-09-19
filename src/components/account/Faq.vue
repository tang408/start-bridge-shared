<template>
  <div class="fs-24">幫助中心(FAQ)</div>

  <div>
    <SharedTabs
      class="mt-05 flow-col-mobile"
      v-model="activeTab"
      :tabs="[
        { label: '創業者常見問題(前台)', value: 1 },
        { label: '共創者常見問題(前台)', value: 2 },
      ]"
    />

    <div v-if="activeTab === 1" class="faq-form">
      <form @submit.prevent="handleForm(1)" class="form">
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

    <div v-if="activeTab === 2" class="faq-form">
      <form @submit.prevent="handleForm(2)" class="form">
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
import {ref, reactive, onMounted} from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedSelect from "@/components/shared/Shared-Select.vue";
import SharedTextarea from "@/components/shared/Shared-Textarea.vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";
import {useAuth} from "@/composables/useAuth.js";
import {inquiryTypeApi} from "@/api/modules/inquiryType.js";
import {helpCenterFaqApi} from "@/api/modules/helpCenterFaq.js";

const { isLoggedIn, currentUser } = useAuth();

const activeTab = ref(1);

const topics = [
  { value: "1", text: "產品問題" },
  { value: "2", text: "付款問題" },
  { value: "3", text: "其他" },
];

const timeOptions = [
  { text: "9:00–12:00", value: "9:00-12:00" },
  { text: "14:00–18:00", value: "14:00–18:00" },
  { text: "18:00–22:00", value: "18:00–22:00" },
  { text: "任何時間", value: "任何時間" },
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

const inquiryTypes = ref([]);
async function getInquiryTypes() {
  const formData = {
    userId: currentUser.value
  }
  const response = await inquiryTypeApi.getInquiryTypes(formData);
  inquiryTypes.value = response.data;
  topics.splice(0, topics.length, ...inquiryTypes.value.map(item => ({ value: item.id.toString(), text: item.name })));
}



async function handleForm(type) {
  const form = type === 1 ? formEnt : formCreator;
  const errors = type === 2 ? errorsEnt : errorsCreator;

  Object.keys(errors).forEach((k) => (errors[k] = ""));
  if (!form.brand) errors.brand = "請輸入品牌或專案名稱";
  if (!form.topic) errors.topic = "請選擇詢問內容";
  if (!form.contactTime) errors.contactTime = "請選擇聯繫時間";
  if (Object.values(errors).some(Boolean)) return;

  const formData = {
    userId: currentUser.value,
    formType: type,
    name: form.brand,
    inquiryType: Number(form.topic),
    otherRequests: form.other,
    contactTime: form.contactTime,
  };

  const response = await helpCenterFaqApi.createHelpCenterFaq(formData)
  if (response.code !== 0) {
    alert(response.message || "表單送出失敗，請稍後再試");
    return;
  }
  form.brand = "";
  form.topic = "";
  form.other = "";
  form.contactTime = "";

  alert(`${type === 1 ? "創業者" : "共創者"}表單送出成功！`);
}

onMounted(() => {
  if (isLoggedIn.value) {
    getInquiryTypes();
  }
});
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
