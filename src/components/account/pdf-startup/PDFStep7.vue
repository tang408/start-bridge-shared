<template>
  <div class="form mt-5">
    <ul class="desc-list">
      <li>本計畫書提交後，「星橋創媒」平台將執行書面審核與實體訪談 。</li>
      <li>審核期間，不得重複提交申請。</li>
      <li>審核通過後，專案方可於 7 個工作日內，正式刊登進行媒合。</li>
      <li>若未通過，將由「星橋創媒」平台業務專員提供建議與可行輔導方案。</li>
      <li>計劃書一經審核通過，即將內容納入媒合專案，並導入合約附件。</li>
      <li>媒合成功後，創業者須簽屬合約，「星橋創媒」平台將提供【共同創業者】審閱並共同簽署。</li>
      <li>
        若創業者違約不依協議執行,平台有權取消往後所有與星橋合作資格並得以告知協力廠商;【共同創業者】可依法主張權利。
      </li>
      <li>
        「星橋創媒」平台不經手服務費以外之任何金流、不具查核責任，但會保留「稽核與異常回報」機制以保障雙方權益。
      </li>
      <li>
        「星橋創媒」平台提供媒合與輔導服務，不保證獲利，亦不對品牌加盟資格進行審核或背書。
      </li>
    </ul>

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
  font-size: $fs-16;
  line-height: 1.6;
  color: #555;
  padding-left: 18px;
}
.desc-list li {
  margin-bottom: 8px;
}
</style>
