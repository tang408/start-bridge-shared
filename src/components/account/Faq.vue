<template>
  <div class="fs-24">幫助中心(FAQ)</div>

  <div>
    <div  class="faq-form">
      <form @submit.prevent="handleForm()" class="form">
        <div class="ent-content">詢問表單</div>

        <SharedInput
          id="question"
          label="我的問題*"
          v-model="formEnt.question"
          :error="errorsEnt.question"
        />

        <SharedTextarea
          id="content"
          label="諮詢內容"
          v-model="formEnt.content"
          :error="errorsEnt.content"
        />

        <SharedRadio
          id="contact-time"
          label="聯繫時間*"
          :options="timeOptions"
          v-model="formEnt.contactTime"
          :error="errorsEnt.contactTime"
        />

        <SharedRadio
            id="contact-func"
            label="聯繫方式*"
            :options="contactOptions"
            v-model="formEnt.contactFunc"
            :error="errorsEnt.contactFunc"
        />


        <button type="submit" class="btn-submit">送出</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import SharedInput from "@/components/shared/Shared-Input.vue";
import SharedTextarea from "@/components/shared/Shared-Textarea.vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";
import {useAuth} from "@/composables/useAuth.js";
import {helpCenterFaqApi} from "@/api/modules/helpCenterFaq.js";

const { isLoggedIn, currentUser } = useAuth();

const timeOptions = [
  { text: "9:00–12:00", value: "9:00-12:00" },
  { text: "14:00–18:00", value: "14:00–18:00" },
  { text: "18:00–22:00", value: "18:00–22:00" },
  { text: "任何時間", value: "任何時間" },
];

const contactOptions = [
  { text: "來電", value: "來電" },
  { text: "Email", value: "email" }
];

const formEnt = reactive({
  question: "",
  content: "",
  contactTime: "",
  contactFunc: "",
});

const errorsEnt = reactive({
  question: "",
  content: "",
  contactTime: "",
  contactFunc: "",
});

function scrollToError(fieldId) {
  const element = document.getElementById(fieldId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    // 可選：增加視覺提示
    element.classList.add('highlight-error');
    setTimeout(() => {
      element.classList.remove('highlight-error');
    }, 2000);
  }
}

async function handleForm() {
  let firstErrorField = null;

  if (!formEnt.question) errorsEnt.question = "請填寫您的問題";
  if (errorsEnt.question) firstErrorField = 'question';

  if (!formEnt.content) errorsEnt.content = "請填寫諮詢內容";
  if (errorsEnt.content && !firstErrorField) firstErrorField = 'content';

  if (!formEnt.contactTime) errorsEnt.contactTime = "請選擇聯繫時間";
  if (errorsEnt.contactTime && !firstErrorField) firstErrorField = 'contact-time';

  if (!formEnt.contactFunc) errorsEnt.contactFunc = "請選擇聯繫方式";
  if (errorsEnt.contactFunc && !firstErrorField) firstErrorField = 'contact-func';

  if (firstErrorField) {
    scrollToError(firstErrorField);
    return;
  }


  try {
    const payload = {
      question: formEnt.question,
      content: formEnt.content,
      contactTime: formEnt.contactTime,
      contactFunc: formEnt.contactFunc,
      userId: currentUser.value,
    };

    const response = await helpCenterFaqApi.createHelpCenterFaq(payload);
    if (response.code === 0) {
      alert("您的詢問已送出，我們會盡快與您聯繫。");
      // Reset form
      formEnt.question = "";
      formEnt.content = "";
      formEnt.contactTime = "";
      formEnt.contactFunc = "";
    } else {
      alert("送出失敗，請稍後再試。");
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      const apiErrors = error.response.data.errors;
      for (const key in apiErrors) {
        if (errorsEnt.hasOwnProperty(key)) {
          errorsEnt[key] = apiErrors[key][0];
        }
      }
    } else {
      alert("送出失敗，請稍後再試。");
    }

  }
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
