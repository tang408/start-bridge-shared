<template>
  <SharedFilter
    mode="store"
    :items="storeLocationsData"
    :filters="filtersB"
    @update:city="changeCity"
    @update:industryType="changeIndustryType"
    @card-click="
      (item) => $router.push({ name: 'ProjectDetail', params: { id: item.id } })
    "
  />
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import SharedFilter from "@/components/Shared-Filter.vue";
import {aboutMeApi as aboutMeApiApi} from "@/api/modules/aboutMe.js";
import {cityApi} from "@/api/modules/city.js";
import {industryTypeApi} from "@/api/modules/industryType.js";
import {storeLocationApi} from "@/api/modules/storeLocation.js";

const items = ref([
  {
    id: 1,
    img: new URL("@/assets/images/store.jpg", import.meta.url).href,
    title: "OOOOOOOOOO",
    address: "OOOOOOOOOO",
    phone: "0123456789",
  },
  {
    id: 2,
    img: new URL("@/assets/images/store.jpg", import.meta.url).href,
    title: "OOOOOOOOOO",
    address: "OOOOOOOOOO",
    phone: "0123456789",
  },
  {
    id: 3,
    img: new URL("@/assets/images/store.jpg", import.meta.url).href,
    title: "OOOOOOOOOO",
    address: "OOOOOOOOOO",
    phone: "0123456789",
  },
  {
    id: 4,
    img: new URL("@/assets/images/store.jpg", import.meta.url).href,
    title: "OOOOOOOOOO",
    address: "OOOOOOOOOO",
    phone: "0123456789",
    to: { name: "ProjectDetail", params: { id: 4 } },
  },
  {
    id: 5,
    img: new URL("@/assets/images/store.jpg", import.meta.url).href,
    title: "OOOOOOOOOO",
    address: "OOOOOOOOOO",
    phone: "0123456789",
  },
  {
    id: 6,
    img: new URL("@/assets/images/store.jpg", import.meta.url).href,
    title: "OOOOOOOOOO",
    address: "OOOOOOOOOO",
    phone: "0123456789",
  },
  {
    id: 7,
    img: new URL("@/assets/images/store.jpg", import.meta.url).href,
    title: "OOOOOOOOOO",
    address: "OOOOOOOOOO",
    phone: "0123456789",
  },
  {
    id: 8,
    img: new URL("@/assets/images/store.jpg", import.meta.url).href,
    title: "OOOOOOOOOO",
    address: "OOOOOOOOOO",
    phone: "0123456789",
  },
]);


const loading = ref(false);
const selectedCity = ref(0);
const selectedIndustryType = ref(0);

const citiesData = ref([]);
const industryTypesData = ref([]);
const storeLocationsData = ref([]);
async function getCities() {
  loading.value = true;
  try {
    const response = await cityApi.getCities();
    if (response.code === 0) {
      citiesData.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取關於我們內容失敗:', error);
  } finally {
    loading.value = false;
  }

}

async function getIndustryTypes() {
  loading.value = true;
  try {
    const response = await industryTypeApi.getIndustryTypes();
    if (response.code === 0) {
      industryTypesData.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取關於我們內容失敗:', error);
  } finally {
    loading.value = false;
  }

}

// 組件掛載時獲取數據
onMounted(async () => {
  await Promise.all([
    getCities(),
    getIndustryTypes()

  ]);
});

const filtersB = computed(() => [
  {
    key: "city",
    placeholder: "縣市",
    anyLabel: "全部縣市",
    options:  citiesData.value.map(city => city.name || city)
  },
  {
    key: "industryType",
    placeholder: "類別",
    anyLabel: "全部類別",
    options: industryTypesData.value.map(industryType => industryType.name || industryType),
  },
]);

// 獲取店鋪位置資料
async function getStoreLocations(city = 0, industryType = 0) {
  loading.value = true;
  try {
    const params = {
      city: selectedCity.value,
      industryType: selectedIndustryType.value
    };

    const response = await storeLocationApi.getStoreLocations(params);
    if (response.code === 0) {
      storeLocationsData.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取店鋪位置資料失敗:', error);
  } finally {
    loading.value = false;
  }
}

function changeCity(cityName) {
  const cityId = getCityId(cityName);
  selectedCity.value = cityId;
  getStoreLocations();
}

function changeIndustryType(industryTypeName) {
  const industryTypeId = getIndustryTypeId(industryTypeName);
  selectedIndustryType.value = industryTypeId;
  getStoreLocations();
}

function getCityId(cityName) {
  if (!cityName) return 0; // 如果沒有選擇，返回0表示全部
  const city = citiesData.value.find(item => item.name === cityName);
  return city ? city.id : 0;
}

function getIndustryTypeId(industryTypeName) {
  if (!industryTypeName) return 0; // 如果沒有選擇，返回0表示全部
  const industryType = industryTypesData.value.find(item => item.name === industryTypeName);
  return industryType ? industryType.id : 0;
}

// 組件掛載時獲取數據
onMounted(async () => {
  await Promise.all([
    getCities(),
    getIndustryTypes(),
  ]);

  // 獲取初始店鋪資料
  await getStoreLocations();
});

</script>

<style lang="scss" scoped>
.about-block {
  position: relative;
  .d-flex-block {
    padding: 60px 0 190px;
    min-height: 510px;
    @media (max-width: 576px) {
      padding: 0;
    }
  }
  .pic-content-1 {
    position: relative;
    img {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      left: 50%;
    }
  }
  .col-md-6 {
    align-content: center;
    display: grid;
    padding: 0 1.5rem;
    gap: 10px;
    @media (max-width: 576px) {
      padding: 0;
      min-height: auto;
    }
    &.block-text {
      position: relative;
      @media (max-width: 576px) {
        display: flex;
        flex-flow: column;
        align-items: center;
      }
    }
  }
  .pic {
    &-1 {
      width: 82%;
      border-radius: 50px;
      left: 54% !important;
    }
    &-2 {
      top: 35% !important;
      left: 38% !important;
      width: 73%;
      border-radius: 50px;
    }
  }
  .shape-project {
    position: absolute;
    right: 15%;
    bottom: 5%;
    z-index: -1;
    @media (max-width: 576px) {
      right: 0;
      bottom: 0;
    }
  }
}

.qa-content {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
    url("@/assets/images/project-qa.png");
  height: 550px;
  position: relative;
  &-text {
    width: 446px;
    padding: 40px;
    gap: 20px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 30px;
    justify-content: center;
    display: flex;
    flex-flow: column;
    align-items: center;
    position: absolute;
    top: 150px;
    right: 200px;
    @media (max-width: 576px) {
      top: 50%;
      right: 50%;
      transform: translate(50%, -50%);
      width: 340px;
    }

    h3 {
      text-align: center;
      color: #373a36;
      font-weight: 600;
    }
    span {
      letter-spacing: 0.1em;
      color: #373a36;
    }
    button {
      padding: 10px 20px;
      background: #262626;
      border-radius: 50px;
      color: #fff;
      width: 250px;
      gap: 8px;
      display: flex;
      justify-content: center;
      border: none;
      letter-spacing: 2px;
      margin-top: 0.7rem;
    }
  }
}

.about-block {
  @media (max-width: 576px) {
    padding: 0 30px;
  }
}

.filter-data {
  @media (max-width: 576px) {
    padding: 30px;
  }
}
</style>
