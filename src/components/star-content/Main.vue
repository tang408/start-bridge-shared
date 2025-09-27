<template>
  <div class="project-content">
    <div class="container">
      <SharedProjectContent />
    </div>
    <div class="swiper-pic">
      <div class="container">
        <div class="row">
          <div class="col-md-4">
            <img src="/src/assets/images/success1.jpg" />
          </div>
          <div class="col-md-4">
            <img src="/src/assets/images/success2.jpg" />
          </div>
          <div class="col-md-4">
            <img src="/src/assets/images/success3.jpg" />
          </div>
        </div>
      </div>
    </div>

    <div class="success-content">
      <div class="container">
        <h3>案例資訊</h3>
        <ul class="row list-unstyled small text-body">
          <li class="col-12 col-md-6">
            <div class="title">店家地址</div>
            <div class="title-content">台中市OOOOOOOOOOO</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">媒合時間</div>
            <div class="title-content">1個月</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">連絡電話</div>
            <div class="title-content">0123456789</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">募資時間</div>
            <div class="title-content">3個月</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">創業人數</div>
            <div class="title-content">4</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">社群網址</div>
            <div class="title-content">
              https://www.facebook.com/milk.tea2022
            </div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">資本額</div>
            <div class="title-content">100萬元</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">社群網址</div>
            <div class="title-content">
              https://www.facebook.com/milk.tea2022
            </div>
          </li>
        </ul>
        <hr class="hr-basic w-100" />
        <h3>創業者專訪(背景經歷/營運狀況分享...)</h3>
        <p class="mb-2">三旬國際餐飲有限公司</p>
        <p class="mt-4 mb-4">
          於2022年創立「顏太煮奶茶」，從古穿越至今，打造獨家特色厚奶茶系列飲品，菜單料多實在增加更多豐富選項。
          【一杯顏太煮 生活不會苦】。
        </p>
        <p>
          為持續提升市場競爭力，不斷地研發新品與尋找高品質原物料，從中累積的務實經驗，以成熟技術打造特色連鎖奶茶店，拓展業務從加盟業務到開店技術指導，用不斷累積的know-how，造就全方位品牌力。
        </p>

        <p class="mt-5">經營理念</p>
        <p class="mb-0">品牌核心 — 「以人為本，從心出發」</p>
        <p class="mb-0">「堅持力」：堅持最好的服務、品質。</p>
        <p class="mb-0">「專業力」：將每個最細微的地方做到最好</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import SharedProjectContent from "@/components/shared/Shared-project-content.vue";
</script>

<style lang="scss" scoped>
.project {
  &-content {
    background: url("@/assets/images/project-bc.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100%;
    position: relative;
    z-index: 0;
    @media (max-width: 576px) {
      padding: 0 30px;
      background-size: cover;
    }

    &-img {
      margin: -50px 0;
      width: 100%;
    }
  }
  &-bc {
    &-img {
      position: absolute;
      left: 0;
      top: 10%;
      z-index: -1;
      height: 40vh;
    }
  }
  &-footer {
    position: relative;
    span {
      position: absolute;
      bottom: 35%;
      right: 10%;
      width: 400px;
      font-weight: 400;
      font-size: 16px;
      line-height: 26px;
      color: #ffffff;
    }
  }
}

.media-section-card {
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  letter-spacing: 2px;
  &-image {
    border-radius: 20px;
  }
}

.swiper-pic {
  position: relative;
  height: 215px;
  @media (max-width: 576px) {
    height: 105vh;
  }
  .container {
    position: absolute;
    top: -55px;
    right: 0;
    @media (max-width: 576px) {
      top: 0;
      right: 0;
    }
    .col-md-4 {
      @media (max-width: 576px) {
        padding: 10px;
      }
      img {
        width: 100%;
        border-radius: 30px;
      }
    }
  }
}

.success-content {
  padding-bottom: 3rem;
  .container {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2px);
    border-radius: 20px;
    padding: 50px;
    gap: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    @media (max-width: 576px) {
      padding: 25px;
      display: block;
    }
  }
}

.list-unstyled {
  gap: 10px 0;
  font-weight: 400;
  font-size: 16px;
  line-height: 28px;
}

.col-12 {
  display: flex;
}

.title {
  font-weight: 600;
  font-size: 16px;
  line-height: 28px;
  width: 120px;
  &-content {
    width: calc(100% - 120px);
    overflow-wrap: break-word;
  }
}
</style>
