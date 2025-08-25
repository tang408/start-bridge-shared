<template>
  <section class="news-board container">
    <div v-if="showFilter" class="filters">
      <slot
        name="filters"
        :categories="displayCategories"
        :selected="selectedCategory"
        :select="selectCategory"
      >
        <button
          v-for="c in displayCategories"
          :key="c"
          class="chip"
          :class="{ active: c === selectedCategory }"
          @click="selectCategory(c)"
        >
          {{ c }}
        </button>
      </slot>
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
import { ref, computed, watch } from "vue";
const props = defineProps({
  items: { type: Array, default: () => [] },
  pageSize: { type: Number, default: 16 },

  showFilter: { type: Boolean, default: true },
  categories: {
    type: Array,
    default: () => ["餐飲", "生活服務", "無人商店", "海外品牌"],
  },
  withAllTab: { type: Boolean, default: false },
  categoryField: { type: String, default: "category" },
  filterFn: { type: Function, default: null },
  initialCategory: { type: String, default: "" },
});

const emit = defineEmits(["card-click", "update:category"]);

const page = ref(1);

const selectedCategory = ref(
  props.showFilter
    ? props.initialCategory ||
        (props.withAllTab ? "全部" : props.categories[0] ?? "全部")
    : ""
);

const displayCategories = computed(() =>
  !props.showFilter
    ? []
    : props.withAllTab
    ? ["全部", ...props.categories]
    : props.categories
);

const filtered = computed(() => {
  if (!props.showFilter) return props.items;
  if (props.withAllTab && selectedCategory.value === "全部") return props.items;

  if (typeof props.filterFn === "function") {
    return props.filterFn(props.items, selectedCategory.value);
  }
  const field = props.categoryField || "category";
  return props.items.filter((i) => i?.[field] === selectedCategory.value);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / props.pageSize))
);
const pagedItems = computed(() => {
  const start = (page.value - 1) * props.pageSize;
  return filtered.value.slice(start, start + props.pageSize);
});

function selectCategory(c) {
  if (!props.showFilter) return;
  selectedCategory.value = c;
  emit("update:category", c);
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
  margin-bottom: 55px;
  @media (max-width: 576px) {
    margin-bottom: 30px;
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
