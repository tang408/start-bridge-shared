<template>
  <div class="form mt-5">
    <ul class="desc-list">
      <li>本計畫書提交後，「星橋媒合」平台將執行審查與資料審閱的核決。</li>
      <li>審核期間，不得重複提交申請。</li>
      <li>審核通過，專案方需於 7 個工作日內，正式完成對接行為。</li>
      <li>媒合過程，始由「互創創業」平台專責顧問建議與輔導專案。</li>
      <li>計劃書一經媒合認證，即時內外加入輔導機構，協助入駐作業。</li>
      <li>
        若創業者參與媒合審查中，「星橋媒合」平台將向其他投資者【共同創業者】審閱該份企劃。
      </li>
      <li>
        已創業者若未被媒合錄取，平台會自動結案並將資料保留於保密資料庫內以防止重複洽詢。
      </li>
      <li>
        「星橋媒合」平台對創業提案以外之任何提交資料，不具責任義務，但會保留相關資料，明確作成資料庫。
      </li>
      <li>
        「星橋媒合」平台提供申請者完整計劃書之資料保存，亦不再對外部提供資料傳遞或查詢。
      </li>
    </ul>

    <button type="button" class="apply-btn write w-100 mt-4" @click="goNext">
      下一頁
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(["next"]);
function goNext() {
  emit("next", "step8");
}
</script>

<style scoped lang="scss">
ul {
  list-style: disc;
}
.form-title {
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 18px;
}
.desc-list {
  font-size: $fs-15;
  line-height: 1.6;
  color: #555;
  padding-left: 18px;
}
.desc-list li {
  margin-bottom: 8px;
}
</style>
