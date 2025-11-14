<template>
  <div class="row pt-5 pb-5 g-4">
    <div class="col-md-4">
      <!-- 使用傳入的 photo -->
      <img :src="photo || '@/assets/images/project-content-img-1.png'" class="w-100" />
    </div>

    <div class="col-md-8">
      <!-- 使用傳入的 description -->
      <p v-html="description" v-if="description" />
    </div>
  </div>
</template>

<script setup>
// 定義 props
const props = defineProps({
  photo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<style scoped lang="scss">
.col-md-8 {
  color: #373a36;
  padding-left: 3rem;
  align-content: center;
  @media (max-width: 576px) {
    padding-left: 0;
  }
  p {
    border-left: 5px solid #d9d9d9;
    font-weight: 400;
    font-size: 18px;
    line-height: 30px;
    padding-left: 1rem;
    margin-bottom: 0;
  }
}
</style>
