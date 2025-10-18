<template>
  <form class="form mt-4" @submit.prevent="submitStep">
    <div class="gap-2 d-grid">
      <h5 class="form-title">二、創業企劃題</h5>

      <SharedTextarea
        id="p4-q1"
        label="1. 請問您為何選擇該品牌做為您創業的起點？"
        v-model="local.q1"
        :rows="4"
        :error="props.errors.q1"
        :readonly="readonly"
      />

      <SharedCheckline
        id="p4-q2"
        v-model="local.q2"
        label="2. 請問您同期是否有接洽其他品牌的加盟合作或已參加過創業說明會？"
        :options="[
          { key: 'yes', text: '是，請簡述：', placeholder: '' },
          { key: 'plan', text: '尚未，但計畫參加時間為：', placeholder: '' },
        ]"
        :error="props.errors.q2"
        :single="true"
      />

      <SharedTextarea
        id="p4-q3"
        label="3. 請問您是否有測算過營運目標及預期成果？若如期達成後的下一階段計劃為何？"
        v-model="local.q3"
        :rows="4"
        placeholder="placeholder"
        :error="props.errors.q3"
      />

      <SharedCheckline
        id="p4-q4"
        v-model="local.q4"
        label="4. 請問您創業的初創團隊是如何組成？(可複選)"
        :options="[
          { key: 'founder', text: '本人親自參與經營' },
          { key: 'family', text: '邀約親友加入，關係：', placeholder: '' },
          { key: 'recruit', text: '另行招募，管道：', placeholder: '' },
          { key: 'other', text: '其他：', placeholder: '' },
        ]"
        :error="props.errors.q4"
      />

      <div>
        <SharedCheckline
          id="p4-q5"
          label="5. 完成籌備後，正式營運所需人數與招聘方式"
          v-model="local.q5"
          :options="[
            {
              key: 'total',
              text: '總共需要多少人數：',
              withInput: true,
              inputType: 'number',
            },
          ]"
          :error="props.errors.q5Total"
        />
        <SharedRecruit
          id="p4-q5-channels"
          v-model="local.q5.channels"
          :options="[
            { key: 'jobBank', text: '人力銀行' },
            { key: 'social', text: '社群平台' },
            { key: 'referral', text: '親友介紹' },
            { key: 'poster', text: '門店張貼' },
            { key: 'other', text: '其他' },
          ]"
          :error="props.errors.q5Channels"
        />
      </div>

      <SharedTime
        id="p4-q6"
        v-model="local.q6"
        label="6. 創業期間的時間規劃"
        :options="[
          { key: 'fulltime', text: '全職投入並同步參與經營', withTime: true },
          { key: 'parttime', text: '全職投入但隨機參與經營', withTime: true },
          { key: 'other', text: '其他，請描述投入情況：' },
        ]"
        :error="props.errors.q6"
      />

      <SharedRecruit
        id="p4-q7"
        label="7. 預計門店顧客來源？(可複選)"
        v-model="local.q7"
        :options="[
          { key: 'social', text: '親友推薦' },
          { key: 'passenger', text: '過路散客' },
          { key: 'business', text: '商圈經營' },
          { key: 'web', text: '網路口碑' },
          { key: 'other', text: '其他' },
        ]"
        :error="props.errors.q7"
      />

      <SharedRadio
        id="p4-q8"
        v-model="local.q8Location"
        v-model:extra="local.q8LocationNote"
        label="8. 成功媒合後，預計門市地點屬性？"
        name="q8Location"
        :options="[
          { text: '核心商圈', value: 'core' },
          { text: '住家型商圈', value: 'residential' },
          { text: '辦公型商圈', value: 'office' },
          { text: '學校周邊', value: 'school' },
          { text: '百貨商場', value: 'mall' },
          { text: '其他', value: 'other', withInput: true },
        ]"
        :error="props.errors.q8Location"
      />

      <SharedRadio
        id="p4-q9"
        v-model="local.q9Location"
        v-model:extra="local.q9LocationNote"
        label="9. 期待的共同創業者附加價值？"
        name="q9Location"
        :options="[
          { text: '協助經營', value: 'operation' },
          { text: '推廣親友及資源', value: 'network' },
          { text: '協助行銷', value: 'sales' },
          { text: '能協助籌資', value: 'finance' },
          { text: '獨立經營', value: 'independent' },
          { text: '其他', value: 'other', withInput: true },
        ]"
        :error="props.errors.q9Location"
      />
    </div>
    <button type="button" class="apply-btn previous w-100 " @click="$emit('next', 'step3')">上一步</button>
    <button type="button" class="apply-btn write w-100 mt-2" @click="submitStep">下一步</button>
  </form>
</template>

<script setup>
import { reactive, watch } from "vue";
import SharedTextarea from "@/components/shared/Shared-Textarea.vue";
import SharedCheckline from "@/components/shared/Shared-Checkline.vue";
import SharedRecruit from "@/components/shared/Shared-Recruit.vue";
import SharedTime from "@/components/shared/Shared-Time.vue";
import SharedRadio from "@/components/shared/Shared-Radio.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: true },
  readonly: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "next"]);

const local = reactive(props.modelValue);

watch(local, (val) => emit("update:modelValue", val), { deep: true });

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

function submitStep() {
  Object.keys(props.errors).forEach((k) => (props.errors[k] = ""));

  let firstErrorField = null;

  // 創業的起點
  if (!local.q1) props.errors.q1 = "請填寫答案";
  if (props.errors.q1) firstErrorField = 'p4-q1';
  // 接洽其他品牌或創業說明會
  const hasQ2Selection = local.q2 && Object.values(local.q2).some(item => item?.checked);
  if (!hasQ2Selection) {
    props.errors.q2 = "請至少選擇一項";
    if (!firstErrorField) firstErrorField = 'p4-q2';
  } else if (local.q2.yes?.checked && !local.q2.yes?.value?.trim()) {
    props.errors.q2 = "請填寫簡述內容";
    if (!firstErrorField) firstErrorField = 'p4-q2';
  } else if (local.q2.plan?.checked && !local.q2.plan?.value?.trim()) {
    props.errors.q2 = "請填寫計畫參加時間";
    if (!firstErrorField) firstErrorField = 'p4-q2';
  } else {
    props.errors.q2 = "";
  }

  // 下一階段計畫
  if (!local.q3) props.errors.q3 = "請填寫答案";
  if (props.errors.q3 && !firstErrorField) firstErrorField = 'p4-q3';

  // 創業團隊
  const hasQ4Selection = local.q4 && Object.values(local.q4).some(item => item?.checked);
  if (!hasQ4Selection) {
    props.errors.q4 = "請至少選擇一項";
    if (!firstErrorField) firstErrorField = 'p4-q4';
  } else if (local.q4.family?.checked && !local.q4.family?.value?.trim()) {
    props.errors.q4 = "請填寫親友關係內容";
    if (!firstErrorField) firstErrorField = 'p4-q4';
  } else if (local.q4.recruit?.checked && !local.q4.recruit?.value?.trim()) {
    if (!firstErrorField) firstErrorField = 'p4-q4';
    props.errors.q4 = "請填寫招募管道內容";
  } else if (local.q4.other?.checked && !local.q4.other?.value?.trim()) {
    if (!firstErrorField) firstErrorField = 'p4-q4';
    props.errors.q4 = "請填寫其他內容";
  } else {
    props.errors.q4 = "";
  }

  // 總人數
  const hasQ5Selection = local.q5 && Object.values(local.q5).some(item => item?.checked);
  if (!hasQ5Selection) {
    if (!firstErrorField) firstErrorField = 'p4-q5';
    props.errors.q5Total = "必選";
  } else if (local.q5.total?.checked && (!local.q5.total?.value || isNaN(local.q5.total?.value) || Number(local.q5.total?.value) <= 0)) {
    if (!firstErrorField) firstErrorField = 'p4-q5';
    props.errors.q5Total = "請填寫正確人數";
  } else {
    props.errors.q5Total = "";
  }

  // 招聘管道
  const hasQ5ChannelsSelection = local.q5 && Object.values(local.q5).some(item => item?.checked);
  if (!hasQ5ChannelsSelection) {
    if (!firstErrorField) firstErrorField = 'p4-q5-channels';
    props.errors.q5Channels = "請至少選擇一個管道";
  } else if (local.q5.channels?.other?.checked && !local.q5.channels?.other?.value?.trim()) {
    if (!firstErrorField) firstErrorField = 'p4-q5-channels';
    props.errors.q5Channels = "請填寫其他管道的內容";
  } else {
    props.errors.q5Channels = "";
  }

  // 時間規劃
  const hasQ6Selection = local.q6 && Object.values(local.q6).some(item => item?.checked);
  if (!hasQ6Selection) {
    if (!firstErrorField) firstErrorField = 'p4-q6';
    props.errors.q6 = "請至少選擇一項";
  } else if (local.q6.other?.checked && !local.q6.other?.value?.trim()) {
    if (!firstErrorField) firstErrorField = 'p4-q6';
    props.errors.q6 = "請填寫其他內容";
  } else {
    props.errors.q6 = "";
  }

  // 門店顧客來源
  const hasSelection = local.q7 && Object.values(local.q7).some(item => item?.checked);

  if (!hasSelection) {
    if (!firstErrorField) firstErrorField = 'p4-q7';
    props.errors.q7 = "請至少選擇一個來源";
  } else if (local.q7.other?.checked && !local.q7.other?.value?.trim()) {
    if (!firstErrorField) firstErrorField = 'p4-q7';
    props.errors.q7 = "請填寫其他來源的內容";
  } else {
    props.errors.q7 = "";
  }

  // 地點屬性
  if (!local.q8Location) {
    if (!firstErrorField) firstErrorField = 'p4-q8';
    props.errors.q8Location = "請選擇地點屬性";
  } else if (local.q8Location === 'other' && !local.q8LocationNote?.other?.trim()) {
    if (!firstErrorField) firstErrorField = 'p4-q8';
    props.errors.q8Location = "請填寫其他地點屬性的內容";
  } else {
    props.errors.q8Location = "";
  }


  // 附加價值
  if (!local.q9Location) {
    props.errors.q9Location = "請選擇地點屬性";
  } else if (local.q9Location === 'other' && !local.q9LocationNote?.other?.trim()) {
    props.errors.q9Location = "請填寫其他地點屬性的內容";
  } else {
    props.errors.q9Location = "";
  }
  console.log(local.q9Location)

  // 滾動到第一個錯誤
  if (firstErrorField) {
    scrollToError(firstErrorField);
  }

  const hasError = Object.values(props.errors).some((e) => e);
  if (!hasError) {
    emit("next", "step5");
  }
}
</script>

<style scoped>
.form-title {
  font-weight: 600;
  margin-bottom: 10px;
}


</style>
