<template>
  <form class="form mt-5" @submit.prevent="submitStep">
    <div>
      <p class="desc">在您提交本創業計劃書前，請審慎閱讀以下風險提示條款：</p>

      <ul class="desc-list">
        <li>
          1.創業具有風險，請務必自行評估承擔能力。
          <p >
            創業過程涉及營運、人事、資金、行銷、法規等多面向挑戰，可能遭遇市場不確定性與經營虧損。
          </p>
        </li>
        <li>
          2.平台僅提供媒合與輔導服務，不提供成功保證或投資回報承諾。
          <p>
            「星橋創媒」不涉入日後經營決策與財務結果，亦無提供任何保本承諾。
          </p>
        </li>
        <li>
          3.計劃書內容須屬實、完整，不得造假或誤導。
          <p >
            計劃書內容將作為【共同創業者】的評估參考，如有虛構或隱匿重要資訊，將影響媒合資格並可能產生法律責任。
          </p>
        </li>
        <li>
          4.計劃書內容之「三、財務規劃與資金用途」籌備期間及營運期間之「開辦費預算」與「營運損益預估」須經過完整輔導後確認。
          <p >
            填寫之訊息內容及數據須經由加盟品牌方確認合理性，並且根據創業者自身經驗及合理營運預測，避免過度樂觀或是主觀認定。
          </p>
        </li>
        <li>
          5.【共同創業者】僅為初期出資之角色，無實際參與經營之責任與義務。
          <p>
            成功媒合後，雙方可依據平台提供之公版合約建立合作關係，明訂權責分界。
          </p>
        </li>
        <li>
          6.若有違約、爭議或異常情況，平台保留資訊揭示、異常通報與媒合暫停之權利。
          <p >
            「星橋創媒」平台不介入雙方協調與法律仲裁，但有義務維護其他用戶安全。
          </p>
        </li>
        <li>
          7.創業計劃書審核通過不代表任何形式之保證、背書或建議投資。
          <p >
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
          <input type="radio" value="reject" v-model="local.agree" disabled />
          <span class="radio-mark"></span>
          不同意(將無法進行媒合程序)
        </label>
      </div>
      <p v-if="errors.agree" class="error-msg">{{ errors.agree }}</p>
    </div>
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

  if (local.agree !== "agree") {
    props.errors.agree = "不同意將無法進行媒合程序";
  }
}
</script>

<style lang="scss" scoped>
.form {
  /* 移除原本的 min-width: 576px */
  width: 100%;
  max-width: 800px; /* 設定最大寬度即可 */
  margin: 0 auto;
  padding: 0 15px; /* 給手機端留一點邊距 */
  box-sizing: border-box;

  @media (max-width: 576px) {
    margin-top: 2rem !important; /* 手機端上方間距縮小 */
  }
}

.desc {
  font-size: $fs-15;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.desc-list {
  font-size: $fs-15;
  line-height: 1.6;
  padding-left: 0;
  list-style: none; /* 移除預設點點，因為你有手寫數字 */

  li {
    margin-bottom: 16px; /* 增加條目間距，方便手機閱讀 */
    color: #444;
  }

  .sub {
    margin-top: 6px;
    margin-left: 0; /* 手機端取消縮排，爭取橫向空間 */
    font-size: $fs-14; /* 手機端次要文字稍微縮小 */
    line-height: 1.5;
    color: #666;
    background: #f9f9f9; /* 加入輕微背景色區隔 */
    padding: 8px 12px;
    border-radius: 8px;

    @media (min-width: 768px) {
      margin-left: 1.5em;
      background: transparent;
      padding: 0;
    }
  }
}

.agree-box {
  font-size: $fs-15;
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap; /* 自動換行 */
  gap: 15px;

  @media (max-width: 576px) {
    display: grid;
    grid-template-columns: 1fr; /* 手機端一條一行 */
  }
}

.custom-radio {
  position: relative;
  display: flex;
  align-items: flex-start; /* 讓 Radio 對齊第一行文字而非中心 */
  cursor: pointer;
  padding: 10px;
  border: 1px solid #eee; /* 手機端增加邊框像按鈕一樣好點 */
  border-radius: 10px;
  transition: all 0.2s;

  &:hover {
    background-color: #fffaf9;
  }

  input[type="radio"] {
    position: absolute;
    opacity: 0;
  }

  .radio-mark {
    flex-shrink: 0; /* 防止圓圈被文字擠壓變形 */
    width: 20px;
    height: 20px;
    border: 2px solid #bbb;
    border-radius: 50%;
    margin-right: 10px;
    margin-top: 2px;
    position: relative;
    box-sizing: border-box;
  }

  /* 選中狀態 */
  input[type="radio"]:checked ~ .radio-mark {
    border-color: #ff6634;
    background-color: #ff6634;

    &::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #fff;
    }
  }

  /* 禁用狀態樣式 */
  input[disabled] ~ span {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.error-msg {
  color: #dc3545;
  font-size: 14px;
  margin-top: 8px;
}
</style>
