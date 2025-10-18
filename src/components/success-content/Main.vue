<template>
  <div class="project-content">
    <div class="container">
      <SharedProjectContent
        :photo="successPlanData.photo"
        :description="successPlanData.description"
      />
    </div>
    <div class="swiper-pic">
      <div class="container">
        <div class="row">
          <div class="col-md-4" v-for="(image, index) in successPlanData.brandImages || []" :key="index">
            <img :src="image" alt="Project Image" />
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
            <div v-if="successPlanData.address" class="title-content">{{ successPlanData.address }}</div>
            <div v-else class="title-content">不提供</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">媒合時間</div>
            <div v-if="matchTime" class="title-content">{{ matchTime }}</div>
            <div v-else class="title-content">不提供</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">連絡電話</div>
            <div v-if="successPlanData.contact" class="title-content">{{ successPlanData.contact }}</div>
            <div v-else class="title-content">不提供</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">募資時間</div>
            <div v-if="fundraisingTime" class="title-content">{{ fundraisingTime }}</div>
            <div v-else class="title-content">不提供</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">創業人數</div>
            <div v-if="successPlanData.founderNum" class="title-content">{{ successPlanData.founderNum }}</div>
            <div v-else class="title-content">不提供</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">社群網址</div>
            <div v-if="successPlanData.facebook" class="title-content">{{ successPlanData.facebook }}</div>
            <div v-else class="title-content">
              不提供
            </div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">加盟金</div>
            <div v-if="successPlanData.startupBudget" class="title-content">{{ successPlanData.startupBudget }}</div>
            <div v-else class="title-content">不提供</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">社群網址</div>
            <div v-if="successPlanData.instagram" class="title-content">{{ successPlanData.instagram }}</div>
            <div v-else class="title-content">
              不提供
            </div>
          </li>
        </ul>
        <hr class="hr-basic w-100" />
        <h3>創業者專訪(背景經歷/營運狀況分享...)</h3>
        <div v-if="successPlanData.interview" v-html="successPlanData.interview"></div>
        <p v-else>尚無專訪內容</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import SharedProjectContent from "@/components/shared/Shared-project-content.vue";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {successPlanApi} from "@/api/modules/successPlan.js";
const route = useRoute();

const successPlanData = ref({});
const matchTime = ref('');
const fundraisingTime = ref('');
const getCurrentId = () => {
  return route.params.id;
};

async function getSuccessPlan(successPlanId) {
  const formData = {
    successPlanId: Number(successPlanId),
  }

  const response = await successPlanApi.getSuccessPlan(formData)
  if (response.code === 0) {
    successPlanData.value = response.data
    matchTime.value = formatTime(successPlanData.value.matchDays || 0);
    fundraisingTime.value = formatTime(successPlanData.value.fundraisingDays || 0);
  } else {
    console.error("Failed to fetch success plan data:", response.message)
  }
}

function formatTime(days) {
  if (days < 30) {
    return `${days}天`;
  } else {
    const months = Math.floor(days / 30);
    return `${months}個月`;
  }
}



onMounted(async () => {
  const successPlanId = getCurrentId();
  if (successPlanId) {
    await getSuccessPlan(successPlanId);

  } else {
    console.error('無法獲取有效的項目 ID');
  }
});

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
    top: 0px;
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
  margin-top: 10rem;
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
