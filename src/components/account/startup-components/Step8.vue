<template>
  <form class="form mt-5" @submit.prevent="submitStep">
    <div>
      <p class="desc">在您提交本創業計劃書前，請審慎閱讀以下風險提示條款：</p>

      <ul class="desc-list">
        <li>
          1.創業具有風險，請務必自行評估承擔能力。
          <p class="sub">
            創業過程涉及營運、人事、資金、行銷、法規等多面向挑戰，可能遭遇市場不確定性與經營虧損。
          </p>
        </li>
        <li>
          2.平台僅提供媒合與輔導服務，不提供成功保證或投資回報承諾。
          <p class="sub">
            「星橋創媒」不涉入日後經營決策與財務結果，亦無提供任何保本承諾。
          </p>
        </li>
        <li>
          3.計劃書內容將作為【共同創業者】的評估參考，如有虛構或隱匿重要資訊，將影響媒合資格並可能產生法律責任。
        </li>
        <li>
          4.計劃書內容之「三、財務規劃與資金用途」籌備期間及營運期間之「開辦費預算」與「營運損益預估」須經過完整輔導後確認。
          <p class="sub">
            填寫之訊息內容及數據須經由加盟品牌方確認合理性，並且根據創業者自身經驗及合理營運預測，避免過度樂觀或是主觀認定。
          </p>
        </li>
        <li>
          5.【共同創業者】僅為初期出資之角色，無實際參與經營之責任與義務。
        </li>
        <li>
          6.若有違約、爭議或異常情況，平台保留資訊揭示、異常通報與媒合暫停之權利。
          <p class="sub">
            「星橋創媒」平台不介入雙方協調與法律仲裁，但有義務維護其他用戶安全。
          </p>
        </li>
        <li>
          7.創業計劃書審核通過不代表任何形式之保證、背書或建議投資。
          <p class="sub">
            僅表示該申請案具備一定企劃完整性與可刊登條件，是否媒合成功仍取決於市場反應與實際條件。
          </p>
        </li>
      </ul>

      <div class="fs-14">
        ※我已閱讀並理解上述風險提示與聲明，並確認內容屬實，願意自行承擔創業所可能產生之一切法律與財務風險。
      </div>
      <div class="agree-box mt-3">
        <label class="custom-radio">
          <input type="radio" value="agree" v-model="local.agree" />
          <span class="radio-mark"></span>
          同意
        </label>
        <label class="custom-radio">
          <input type="radio" value="reject" v-model="local.agree" />
          <span class="radio-mark"></span>
          不同意(將無法進行媒合程序)
        </label>
      </div>
      <p v-if="errors.agree" class="error-msg">{{ errors.agree }}</p>
    </div>

    <button type="submit" class="apply-btn write w-100 mt-4">送交審閱</button>
  </form>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  errors: { type: Object, required: true },
});
const emit = defineEmits(["update:modelValue", "next"]);

const local = reactive({ ...props.modelValue });

watch(local, (val) => emit("update:modelValue", val), { deep: true });

function submitStep() {
  props.errors.agree = "";

  if (!local.agree) {
    props.errors.agree = "請選擇是否同意";
    return;
  }

  if (local.agree === "agree") {
    alert("送出成功！(這裡可以改成 API 呼叫)");
  } else {
    props.errors.agree = "不同意將無法進行媒合程序";
  }
}
</script>

<style lang="scss" scoped>
.desc {
  font-size: $fs-15;
  margin-bottom: 12px;
}
.desc-list {
  font-size: $fs-15;
  line-height: 1.6;
  padding-left: 0;
  li {
    margin-bottom: 8px;
  }
  .sub {
    margin-top: 6px;
    margin-left: 1em;
    font-size: $fs-15;
    line-height: 1.5;
  }
}
.agree-box {
  font-size: $fs-15;
  margin-top: 20px;
  gap: 10px;
  display: flex;
  @media (max-width: 576px) {
    display: grid;
  }
}

.custom-radio {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 16px;
  font-size: 15px;

  input[type="radio"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .radio-mark {
    width: 18px;
    height: 18px;
    border: 2px solid #bbb;
    border-radius: 50%;
    margin-right: 8px;
    box-sizing: border-box;
    transition: border-color 0.2s, background-color 0.2s;
  }

  input[type="radio"]:checked ~ .radio-mark {
    background-color: #ff6634;
    border-color: #ff6634;
  }

  input[type="radio"]:checked ~ .radio-mark::after {
    content: "";
    position: absolute;
    left: 5px;
    top: 7px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fff;
  }
}
</style>
