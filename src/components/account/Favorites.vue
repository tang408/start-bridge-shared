<template>
  <div class="fs-24">我的收藏</div>
  <div>
    <SharedTabs
      v-model="activeTab"
      :tabs="[
        { label: '共創者', value: 'creator' },
        { label: '創業者', value: 'ent' },
      ]"
    />

    <div v-if="activeTab === 'creator'" class="favorites-grid">
      <SharedCard
        v-for="c in creatorCards"
        :key="c.id"
        :card="c"
        mode="progress"
        :showProgress="true"
        :showInfo="true"
      />
    </div>

    <div v-if="activeTab === 'ent'" class="favorites-grid">
      <SharedCard
        v-for="c in entCards"
        :key="c.id"
        :card="c"
        mode="progress"
        :showProgress="false"
        :showInfo="false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedCard from "@/components/shared/Shared-Card.vue";

const activeTab = ref("creator");

const creatorCards = [
  {
    id: 1,
    img: "/src/assets/images/porject-img.png",
    title: "專案名稱專案名稱專案名稱專案名稱",
    progress: 88,
    price: "99天",
    supporters: "9999人讚助",
  },
  {
    id: 2,
    img: "/src/assets/images/porject-img.png",
    title: "專案名稱專案名稱專案名稱專案名稱",
    progress: 88,
    price: "99天",
    supporters: "9999人讚助",
  },
];

const entCards = [
  {
    id: 1,
    img: "/src/assets/images/porject-img.png",
    title: "品牌名稱品牌名稱品牌名稱品牌名稱",
  },
  {
    id: 2,
    img: "/src/assets/images/porject-img.png",
    title: "品牌名稱品牌名稱品牌名稱品牌名稱",
  },
];
</script>

<style scoped lang="scss">
.favorites-grid {
  display: flex;
  gap: 25px;
  @media (max-width: 576px) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>
