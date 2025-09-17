<template>
  <form class="form mt-4" @submit.prevent="submitStep">
    <div class="gap-2 d-grid">
      <h5 class="form-title">二、創業企劃題</h5>

      <SharedTextarea
        id="p4-q1"
        label="1. 請問您為何選擇該品牌做為您創業的起點？"
        v-model="local.q1"
        :rows="4"
        :error="errors.q1"
      />

      <SharedCheckline
        v-model="local.q2"
        label="2. 請問您同期是否有接洽其他品牌的加盟合作或已參加過創業說明會？"
        :options="[
          { key: 'yes', text: '是，請簡述：', placeholder: '' },
          { key: 'plan', text: '尚未，但計畫參加時間為：', placeholder: '' },
        ]"
        :error="errors.q2"
        :single="true"
      />

      <SharedTextarea
        id="p4-q3"
        label="3. 請問您是否有測算過營運目標及預期成果？若如期達成後的下一階段計劃為何？"
        v-model="local.q3"
        :rows="4"
        placeholder="placeholder"
        :error="errors.q3"
      />

      <SharedCheckline
        v-model="local.q4"
        label="4. 請問您創業的初創團隊是如何組成？(可複選)"
        :options="[
          { key: 'founder', text: '本人親自參與經營' },
          { key: 'family', text: '邀約親友加入，關係：', placeholder: '' },
          { key: 'recruit', text: '另行招募，管道：', placeholder: '' },
          { key: 'other', text: '其他：', placeholder: '' },
        ]"
        :error="errors.q4"
      />

      <div>
        <SharedCheckline
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
          :error="errors.q5"
        />
        <SharedRecruit
          v-model="local.q5.channels"
          :options="[
            { key: 'jobBank', text: '人力銀行' },
            { key: 'social', text: '社群平台' },
            { key: 'referral', text: '親友介紹' },
            { key: 'poster', text: '門店張貼' },
            { key: 'other', text: '其他' },
          ]"
          :error="errors.q5.channels"
        />
      </div>

      <SharedTime
        v-model="local.q6"
        label="6. 創業期間的時間規劃"
        :options="[
          { key: 'fulltime', text: '全職投入並同步參與經營', withTime: true },
          { key: 'parttime', text: '全職投入但隨機參與經營', withTime: true },
          { key: 'other', text: '其他，請描述投入情況：' },
        ]"
        :error="errors.q6"
      />

      <SharedRecruit
        label="7. 預計門店顧客來源？(可複選)"
        v-model="local.q7"
        :options="[
          { key: 'social', text: '親友推薦' },
          { key: 'passenger', text: '過路散客' },
          { key: 'business', text: '商圈經營' },
          { key: 'web', text: '網路口碑' },
          { key: 'other', text: '其他' },
        ]"
        :error="errors.q7"
      />

      <SharedRadio
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
        :error="errors.q8Location"
      />

      <SharedRadio
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
        :error="errors.q9Location"
      />
    </div>

    <button type="button" class="apply-btn write w-100 mt-4" @click="submitStep">下一步</button>
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
});
const emit = defineEmits(["update:modelValue", "next"]);

const local = reactive(props.modelValue);

watch(local, (val) => emit("update:modelValue", val), { deep: true });

function submitStep() {
  Object.keys(props.errors).forEach((k) => (props.errors[k] = ""));

  if (!local.q1) props.errors.q1 = "請填寫答案";

  if (!local.q2 || Object.keys(local.q2).length === 0) {
    props.errors.q2 = "請選擇或填寫內容";
  }

  if (!local.q3) props.errors.q3 = "請填寫答案";

  if (!local.q4 || Object.keys(local.q4).length === 0) {
    props.errors.q4 = "請選擇至少一項";
  }

  if (!local.q5.total) props.errors.q5 = "請輸入總人數";

  if (!local.q6 || Object.keys(local.q6).length === 0) {
    props.errors.q6 = "請填寫時間規劃";
  }

  if (!local.q7 || local.q7.length === 0) {
    props.errors.q7 = "請至少選擇一個來源";
  }

  if (!local.q8Location) {
    props.errors.q8Location = "請選擇地點屬性";
  }

  if (!local.q9Location) {
    props.errors.q9Location = "請選擇附加價值";
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
