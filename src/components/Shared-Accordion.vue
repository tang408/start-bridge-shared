<template>
  <div class="accordion" :id="accordionId">
    <div class="accordion-item" v-for="(item, index) in faqs" :key="index">
      <h2 class="accordion-header" :id="`heading${accordionId}-${index}`">
        <button
          class="accordion-button"
          :class="{ collapsed: index !== 0 }"
          type="button"
          data-bs-toggle="collapse"
          :data-bs-target="`#collapse${accordionId}-${index}`"
          :aria-expanded="index === 0 ? 'true' : 'false'"
          :aria-controls="`collapse${accordionId}-${index}`"
        >
          {{ item.question }}
        </button>
      </h2>
      <div
        :id="`collapse${accordionId}-${index}`"
        class="accordion-collapse collapse"
        :class="{ show: index === 0 }"
        :aria-labelledby="`heading${accordionId}-${index}`"
        :data-bs-parent="`#${accordionId}`"
      >
        <div class="accordion-body">
          {{ item.answer }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {defineProps, onMounted, ref} from "vue";
import {FAQApi as FAQApiApi} from "@/api/modules/faq.js";

const props = defineProps({
  accordionId: {
    type: String,
    default: "accordionExample",
  },
});


const loading = ref(false);
const faqs = ref([]);
async function getfaqs() {
  loading.value = true;
  try {
    const response = await FAQApiApi.getFAQs();
    if (response.code === 0) {
      faqs.value = response.data;
    } else {
      throw new Error('API 響應格式錯誤');
    }
  } catch (error) {
    console.error('獲取數據失敗:', error);
  } finally {
    loading.value = false;
  }
}

// 組件掛載時獲取數據
onMounted(async () => {
  await getfaqs();
});

</script>

<style scoped lang="scss">
.accordion-item:first-of-type {
  border-radius: 20px;
}
.accordion-item:last-of-type {
  border-radius: 20px;
}

.accordion-item:first-of-type > .accordion-header .accordion-button,
.accordion-item:last-of-type > .accordion-header .accordion-button.collapsed {
  border-radius: 20px;
}

.accordion {
  gap: 15px;
  display: grid;
}

.accordion-button {
  position: relative;
  padding-right: 2rem;
  font-size: 18px;
  font-weight: 600;
  color: #373a36;
  border-radius: 20px;
  box-shadow: 2px 2px 9px rgba(55, 58, 54, 0.5);
  @media (max-width: 576px) {
    font-size: 17px;
  }
  &::after {
    content: "+";
    font-size: 1.5rem;
    font-weight: bold;
    position: absolute;
    right: 1rem;
    top: 45%;
    transform: translateY(-50%);
    background-image: none !important;
  }

  &:not(.collapsed)::after {
    content: "−";
    transform: translateY(-50%);
  }

  &:not(.collapsed) {
    color: #fff;
    background-color: #ff6634;
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }
}

.accordion-item {
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
}

.accordion-body {
  box-shadow: 2px 2px 9px rgba(55, 58, 54, 0.5);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  font-weight: 400;
  color: #373a36;
  padding: 0.25rem 1.25rem 1rem 1.25rem;
}
</style>
