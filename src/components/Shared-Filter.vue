<template>
  <div class="filter-data">
    <div class="container">
      <div class="row g-2 filters-row">
        <div
          v-for="(f, i) in filtersConfig"
          :key="f.key"
          :class="getColClass(i, filtersConfig.length)"
        >
          <div class="dropdown w-100">
            <button
              class="select-like dropdown-toggle w-100"
              type="button"
              data-bs-toggle="dropdown"
            >
              {{ selectedMap[f.key] ?? f.placeholder ?? "請選擇" }}
            </button>
            <ul class="dropdown-menu w-100">
              <li v-if="f.showAny !== false">
                <button
                  class="dropdown-item"
                  type="button"
                  @click="onSelect(f, f.anyValue ?? '')"
                >
                  {{ f.anyLabel ?? "全部" }}
                </button>
              </li>
              <li v-if="f.showAny !== false">
                <hr class="dropdown-divider" />
              </li>

              <li v-for="opt in f.options" :key="normalizeOption(opt).value">
                <button
                  class="dropdown-item"
                  type="button"
                  @click="
                    onSelect(
                      f,
                      normalizeOption(opt).value,
                      normalizeOption(opt).label
                    )
                  "
                >
                  {{ normalizeOption(opt).label }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="container my-4">
      <div class="slider-block">
        <SharedCard
          :mode="mode"
          v-for="item in pagedItems"
          :key="item.id"
          :card="item"
          :show-progress="mode === 'progress'"
          :show-info="mode === 'progress'"
          :store-address="mode === 'store' ? item.address : undefined"
          :store-phone="mode === 'store' ? item.phone : undefined"
          @card-click="emit('card-click', $event)"
        />
      </div>

      <nav class="slider-pager" aria-label="pagination">
        <button
          class="slider-pager-dot slider-pager-prev"
          :disabled="page === 1"
          @click="goPrev"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          class="slider-pager-dot"
          :class="{ active: p === page }"
          @click="goPage(p)"
        >
          {{ p }}
        </button>
        <button
          class="slider-pager-dot slider-pager-next"
          :disabled="page === totalPages"
          @click="goNext"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import SharedCard from "@/components/Shared-Card.vue";

const props = defineProps({
  items: { type: Array, required: true },
  orderOptions: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  features: { type: Array, default: () => [] },
  filters: { type: Array, default: null },
  mode: { type: String, default: "progress" },
});

const emit = defineEmits([
  "update:order",
  "update:category",
  "update:feature",
  "card-click",
]);

function normalizeOption(opt) {
  return typeof opt === "string" ? { value: opt, label: opt } : opt;
}

const legacyFilters = computed(() => {
  const order = props.orderOptions?.length
    ? {
        key: "order",
        placeholder: "排序方式",
        options: props.orderOptions.map((o) => ({
          value: o.value,
          label: o.label,
        })),
        showAny: false,
      }
    : null;

  const category = props.categories?.length
    ? {
        key: "category",
        placeholder: "選擇分類",
        options: props.categories,
        anyLabel: "全部",
        anyValue: "",
        showAny: true,
      }
    : null;

  const feature = props.features?.length
    ? {
        key: "feature",
        placeholder: "選擇特色",
        options: props.features,
        anyLabel: "不限",
        anyValue: "",
        showAny: true,
      }
    : null;

  return [order, category, feature].filter(Boolean);
});

const filtersConfig = computed(() => {
  if (props.filters && props.filters.length) {
    return props.filters.map((f) => ({
      showAny: true,
      anyLabel: "全部",
      anyValue: "",
      ...f,
      options: (f.options || []).map(normalizeOption),
    }));
  }
  return legacyFilters.value;
});

const selectedMap = ref({});
function onSelect(filter, value, label) {
  const display =
    label ?? (value === "" ? filter.anyLabel ?? "全部" : String(value));
  selectedMap.value = { ...selectedMap.value, [filter.key]: display };
  emit(`update:${filter.key}`, value);
}

function getColClass(index, len) {
  if (len === 2) return "width-25";
  if (len === 3)
    return (
      ["col-12 col-md-3", "col-12 col-md-6", "col-12 col-md-3 ms-auto"][
        index
      ] || "col-12 col-md-4"
    );
  return "col-12 col-md-4";
}
const rows = 2;
const getCols = (w) => (w >= 1024 ? 4 : w >= 768 ? 3 : 2);

const page = ref(1);
const pageSize = ref(getCols(window.innerWidth) * rows);

const totalPages = computed(() =>
  Math.max(1, Math.ceil((props.items?.length || 0) / pageSize.value))
);

const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return (props.items || []).slice(start, start + pageSize.value);
});

function goPage(p) {
  page.value = Math.min(Math.max(1, p), totalPages.value);
}
function goPrev() {
  if (page.value > 1) page.value--;
}
function goNext() {
  if (page.value < totalPages.value) page.value++;
}

function updatePageSize() {
  const newSize = getCols(window.innerWidth) * rows;
  if (newSize !== pageSize.value) {
    const firstIndex = (page.value - 1) * pageSize.value;
    pageSize.value = newSize;
    page.value = Math.floor(firstIndex / newSize) + 1;
  }
}
onMounted(() => {
  window.addEventListener("resize", updatePageSize, { passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", updatePageSize);
});
</script>

<style lang="scss" scoped>
.filter-data {
  padding: 12px 0 30px;

  .container.my-4 {
    position: relative;
    .shape-project {
      position: absolute;
      bottom: 0;
      z-index: -1;
      @media (max-width: 576px) {
        position: absolute;
        bottom: 2%;
        z-index: -1;
        left: 0;
        width: 70%;
      }
    }
  }

  .filters-row {
    padding: 12px 0 6px;
    justify-content: end;
  }

  .select-like {
    --border: #e5e7eb;
    --text: #111827;
    --hover: #f9fafb;
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding: 0 40px 0 16px;
    border: 1px solid #e0e0e0;
    border-radius: 999px;
    background: #fff;
    color: var(--text);
    font-size: 14px;
    text-align: left;

    &.dropdown-toggle::after {
      content: "";
      position: absolute;
      right: 14px;
      top: 50%;
      width: 16px;
      height: 16px;
      transform: translateY(-50%) rotate(0deg);
      transition: transform 0.2s ease;
      border: none !important;
      background-repeat: no-repeat;
      background-position: center;
      background-size: 16px 16px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23111827' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    }
    &.dropdown-toggle.show::after {
      transform: translateY(-50%) rotate(180deg);
    }

    &:hover {
      background: var(--hover);
    }
    &:focus {
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    }
  }

  .dropdown-menu {
    min-width: 100%;
    border-radius: 12px;
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  }
  .dropdown-item {
    font-size: 14px;
  }
  .dropdown-item.active,
  .dropdown-item:active {
    background-color: #ffefe0;
    color: #ff6a00;
  }
}

.slider-block {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.slider-pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin: 2rem 0;
  &-dot {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.02em;
    color: #373a36;
    background-color: transparent;
    &.active {
      color: #ff5f31;
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
  &-prev,
  &-next {
    width: 20px;
    height: 20px;
    color: #fff;
    background: #ff5f31;
    border-radius: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px;
  }
}
</style>
