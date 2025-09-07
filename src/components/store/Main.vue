<template>
  <SharedFilter
    mode="store"
    :items="items"
    :filters="filtersB"
    @update:city="() => {}"
    @update:category="() => {}"
    @card-click="
      (item) => $router.push({ name: 'ProjectDetail', params: { id: item.id } })
    "
  />
</template>

<script setup>
import { ref } from "vue";
import SharedFilter from "@/components/shared/Shared-Filter.vue";

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

const filtersB = [
  {
    key: "city",
    placeholder: "縣市",
    anyLabel: "全部縣市",
    options: ["台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市"],
  },
  {
    key: "category",
    placeholder: "餐飲-咖啡",
    anyLabel: "全部類別",
    options: ["餐飲-咖啡", "餐飲-早午餐", "餐飲-輕食", "零售-雜貨"],
  },
];
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
