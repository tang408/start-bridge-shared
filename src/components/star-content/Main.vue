<template>
  <div class="project-content">
    <div class="container">
      <SharedProjectContent
        :photo="partnerInterviewData.photo"
        :description="partnerInterviewData.description"
      />
    </div>
    <div class="swiper-pic">
      <div class="container">
        <div class="row">
          <div
            class="col-md-4"
            v-for="(image, index) in partnerInterviewData.brandImages || []"
            :key="index"
          >
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
            <div class="title">聯絡資訊</div>
            <div
                v-if="partnerInterviewData.contact"
                class="title-content"
                style="white-space: pre-line;"
            >
              {{ partnerInterviewData.contact }}
            </div>
            <div v-else class="title-content">不提供</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">官方網址</div>
            <div v-if="partnerInterviewData.website"class="title-content">
              {{ partnerInterviewData.website }}
            </div>
            <div v-else class="title-content">不提供</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">產業類型</div>
            <div v-if="partnerInterviewData.industryType" class="title-content">
              {{
                industryTypesData.find(
                  (type) => type.id === partnerInterviewData.industryType
                )?.name || "未分類"
              }}
            </div>
            <div v-else class="title-content">不提供</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">社群網址</div>
            <div v-if="partnerInterviewData.facebook"class="title-content">
              {{ partnerInterviewData.facebook }}
            </div>
            <div v-else class="title-content">不提供</div>
          </li>
          <li class="col-12 col-md-6">
            <div class="title">資本額</div>
            <div v-if="partnerInterviewData.capital" class="title-content">
              {{ partnerInterviewData.capital }} 萬元
            </div>
            <div v-else class="title-content">不提供</div>
          </li>
          <li class="col-12 col-md-6">
          </li>
          <li class="col-12 col-md-6">
            <div class="title">加盟金</div>
            <div v-if="partnerInterviewData.franchiseFee" class="title-content">
              {{ partnerInterviewData.franchiseFee }} 萬元
            </div>
            <div v-else class="title-content">不提供</div>
          </li>
          <li class="col-12 col-md-6">
          </li>
          <li class="col-12 col-md-6">
            <div class="title">合作特約優惠</div>
            <div v-if="partnerInterviewData.specialOffer" class="title-content">
              {{ partnerInterviewData.specialOffer }} 萬元
            </div>
            <div v-else class="title-content">不提供</div>
          </li>



        </ul>
        <hr class="hr-basic w-100" />
        <h3>合作品牌專訪(背景經歷/營運狀況分享...)</h3>
        <div v-if="partnerInterviewData.interview" v-html="partnerInterviewData.interview"></div>
        <p v-else>尚無專訪內容</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import SharedProjectContent from "@/components/shared/Shared-project-content.vue";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {partnerInterviewApi} from "@/api/modules/partnerInterview.js";
import {industryTypeApi} from "@/api/modules/industryType.js";
const route = useRoute();
const emit = defineEmits(['data-loaded']);
const partnerInterviewData = ref({})
const industryTypesData = ref([]);
async function getIndustryTypes() {
  const res = await industryTypeApi.getIndustryTypes();
  if (res && res.data) {
    industryTypesData.value = res.data;
  }
}
const getCurrentId = () => {
  return route.params.id
}

async function getPartnerInterview(partnerInterviewId) {
  const formData = {
    partnerInterviewId: Number(partnerInterviewId),
  }

  const response = await partnerInterviewApi.getPartnerInterview(formData)
  if (response.code === 0) {
    partnerInterviewData.value = response.data
    emit('data-loaded', response.data);
  } else {
    console.error("Failed to fetch partner interview:", response.message)
  }
}

onMounted(async () => {
  const id = getCurrentId()
  if (id) {
    await getIndustryTypes()
    await getPartnerInterview(id)
  } else {
    console.error("No partner interview ID found in route parameters.")
  }
})

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
    top: px;
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
