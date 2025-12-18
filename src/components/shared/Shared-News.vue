<template>
  <section class="news-board container">
    <!-- 一級篩選：產業類型 -->
    <div v-if="showFilter" class="filters">
      <slot
          name="filters"
          :categories="displayCategories"
          :selected="selectedCategory"
          :select="selectCategory"
      >
        <button
            v-for="c in displayCategories"
            :key="c.id || c"
            class="chip"
            :class="{ active: isMainCategoryActive(c) }"
            @click="selectCategory(c)"
        >
          {{ typeof c === 'object' ? c.name : c }}
        </button>
      </slot>
    </div>

    <!-- 二級篩選：子類型 -->
    <div v-if="showFilter && subCategories.length > 0" class="sub-filters">
      <button
          class="sub-chip"
          :class="{ active: !selectedSubCategory }"
          @click="selectSubCategory(null)"
      >
        全部
      </button>
      <button
          v-for="sub in subCategories"
          :key="sub.id"
          class="sub-chip"
          :class="{ active: selectedSubCategory?.id === sub.id }"
          @click="selectSubCategory(sub)"
      >
        {{ sub.name }}
      </button>
    </div>

    <div class="grid">
      <article
          v-for="item in pagedItems"
          :key="item.id"
          class="card"
          @click="$emit('card-click', item)"
      >
        <img class="cover" :src="item.cover" />
        <div class="shade"></div>
        <h5 class="title">{{ item.title }}</h5>

        <SharedFabActions
            v-if="showFabActions"
            :favorite="item.favorite"
            :showTrash="false"
            iconType="heart"
            size="sm"
            :right="10"
            :top="10"
            :circleSize="35"
            :iconSize="20"
            @favorite-toggle="
            $emit('favorite-change', { id: item.id, value: $event })
          "
        />
      </article>
    </div>

    <nav class="pager" aria-label="pagination">
      <button
          class="nav-btn"
          type="button"
          :disabled="page === 1"
          @click="prevPage"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path
              d="M12 4 L6 10 L12 16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
          v-for="p in totalPages"
          :key="p"
          class="dot"
          :class="{ active: p === page }"
          @click="go(p)"
      >
        {{ p }}
      </button>

      <button
          class="nav-btn"
          type="button"
          :disabled="page === totalPages"
          @click="nextPage"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path
              d="M8 4 L14 10 L8 16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
          />
        </svg>
      </button>
    </nav>
  </section>
</template>

<script setup>
import SharedFabActions from "@/components/shared/Shared-Fab-Actions.vue";
import { ref, computed, watch } from "vue";

const props = defineProps({
  items: { type: Array, default: () => [] },
  pageSize: { type: Number, default: 16 },

  showFilter: { type: Boolean, default: true },

  // ⭐ 修改：categories 改為接收物件陣列 [{ id: 1, name: '餐飲' }, ...]
  categories: {
    type: Array,
    default: () => []
  },

  // ⭐ 新增：子類型資料 [{ id: 1, industryTypeId: 1, name: '燒肉' }, ...]
  subCategories: {
    type: Array,
    default: () => []
  },

  withAllTab: { type: Boolean, default: false },
  categoryField: { type: String, default: "industryType" }, // 改為 industryType
  subCategoryField: { type: String, default: "industrySubType" }, // 新增子類型欄位
  filterFn: { type: Function, default: null },
  initialCategory: { type: [String, Object], default: "" },
  // 🆕 新增 prop 控制是否顯示 FAB 按鈕
  showFabActions: { type: Boolean, default: true },
});

const emit = defineEmits([
  "card-click",
  "update:category",
  "update:subCategory",
  "favorite-change"
]);

const page = ref(1);

// 選中的主類型
const selectedCategory = ref(
    props.showFilter
        ? props.initialCategory ||
        (props.withAllTab ? "全部" : props.categories[0] ?? null)
        : null
);

// ⭐ 新增：選中的子類型
const selectedSubCategory = ref(null);

// 顯示的主類型（加上「全部」選項）
const displayCategories = computed(() => {
  if (!props.showFilter) return [];
  return props.withAllTab
      ? ["全部", ...props.categories]
      : props.categories;
});

// ⭐ 計算當前選中主類型下的子類型
const subCategories = computed(() => {
  if (!props.showFilter || !selectedCategory.value) return [];

  // 如果選擇「全部」，不顯示子類型
  if (selectedCategory.value === "全部") return [];

  const categoryId = typeof selectedCategory.value === 'object'
      ? selectedCategory.value.id
      : selectedCategory.value;

  // 過濾出屬於當前主類型的子類型
  return props.subCategories.filter(sub => sub.industryTypeId === categoryId);
});

// ⭐ 修改過濾邏輯，同時考慮主類型和子類型
const filtered = computed(() => {
  if (!props.showFilter) return props.items;

  let result = props.items;

  // 使用自定義過濾函數
  if (typeof props.filterFn === "function") {
    return props.filterFn(
        props.items,
        selectedCategory.value,
        selectedSubCategory.value
    );
  }

  // 主類型過濾
  if (selectedCategory.value && selectedCategory.value !== "全部") {
    const categoryId = typeof selectedCategory.value === 'object'
        ? selectedCategory.value.id
        : selectedCategory.value;

    const field = props.categoryField || "industryType";
    result = result.filter(item => item?.[field] === categoryId);
  }

  // 子類型過濾
  if (selectedSubCategory.value) {
    const subField = props.subCategoryField || "industrySubType";
    result = result.filter(item => item?.[subField] === selectedSubCategory.value.id);
  }

  return result;
});

const totalPages = computed(() =>
    Math.max(1, Math.ceil(filtered.value.length / props.pageSize))
);

const pagedItems = computed(() => {
  const start = (page.value - 1) * props.pageSize;
  return filtered.value.slice(start, start + props.pageSize);
});

// 判斷主類型是否為選中狀態
function isMainCategoryActive(c) {
  if (c === "全部") return selectedCategory.value === "全部";

  const cId = typeof c === 'object' ? c.id : c;
  const selectedId = typeof selectedCategory.value === 'object'
      ? selectedCategory.value.id
      : selectedCategory.value;

  return cId === selectedId;
}

// 選擇主類型
function selectCategory(c) {
  if (!props.showFilter) return;
  selectedCategory.value = c;
  selectedSubCategory.value = null; // 切換主類型時清空子類型選擇
  emit("update:category", c);
  page.value = 1;
}

// ⭐ 新增：選擇子類型
function selectSubCategory(sub) {
  selectedSubCategory.value = sub;
  emit("update:subCategory", sub);
  page.value = 1;
}

function go(p) {
  page.value = p;
  scrollToTopIfNeeded();
}

function prevPage() {
  if (page.value > 1) go(page.value - 1);
}

function nextPage() {
  if (page.value < totalPages.value) go(page.value + 1);
}

function scrollToTopIfNeeded() {
  document.querySelector(".news-board")?.scrollIntoView({ behavior: "smooth" });
}

watch(
    () => props.items,
    () => (page.value = 1)
);
</script>

<style lang="scss" scoped>
.news-board {
  padding: 0 0 100px 0;
  @media (max-width: 576px) {
    padding: 0 30px 100px;
  }
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  @media (max-width: 576px) {
    margin-bottom: 15px;
  }
}

/* ⭐ 新增：子類型篩選樣式 */
.sub-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 35px;
  padding: 15px;
  border-radius: 12px;
  @media (max-width: 576px) {
    margin-bottom: 20px;
    padding: 12px;
  }
}

.chip {
  border: none;
  padding: 6px 14px;
  border: 2px solid #ffcc66;
  border-radius: 50px;
  background-color: #fff;
  color: #555555;
  width: 120px;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease;
  @media (max-width: 576px) {
    width: auto;
  }
}
.chip:hover {
  transform: translateY(-1px);
}
.chip.active {
  background: #ffcc66;
  color: #000;
  font-weight: 600;
}

/* ⭐ 新增：子類型按鈕樣式 */
.sub-chip {
  border: none;
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: #fff;
  color: #666;
  height: 32px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.12s ease;
  white-space: nowrap;
}
.sub-chip:hover {
  border-color: #ffcc66;
  background-color: #fffbf0;
}
.sub-chip.active {
  background: #ffcc66;
  color: #000;
  font-weight: 600;
  border-color: #ffcc66;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  aspect-ratio: 4 / 3;
  cursor: pointer;
}
.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.55) 0%,
          rgba(0, 0, 0, 0.15) 60%,
          rgba(0, 0, 0, 0) 100%
  );
}
.title {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  color: #fff;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 90px;
  user-select: none;
}
.nav-btn {
  border: none;
  background: #ff5a4d;
  color: #fff;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
}
.nav-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
.dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 700;
  font-size: 16px;
  line-height: 16px;
  cursor: pointer;
  &.active {
    color: #ff5a4d;
  }
}

@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
