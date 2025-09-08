<template>
  <div class="row pt-5 pb-5 g-4">
    <div class="col-md-4">
      <img src="@/assets/images/project-content-img-1.png" class="w-100" />
    </div>

    <div class="col-md-8">
      <p>
        相傳元朝最會煮奶茶的人- 《元太祖的姑姑》 <br />
        手中隨時捧著一杯厚奶茶 茶香四溢，路人無一不駐足<br />
        姑姑穿越各朝代，改名為顏太煮 盼天下人嘗盡這杯好滋味！
      </p>
    </div>
  </div>
</template>

<script setup></script>

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
