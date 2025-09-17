<template>
  <section class="company">
    <ul class="nav nav-pills gap-2" role="tablist">
      <li class="nav-item" role="presentation" v-for="t in tabs" :key="t.key">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: t.key === activeTab }"
          :id="`tab-${t.key}`"
          data-bs-toggle="tab"
          :data-bs-target="`#panel-${t.key}`"
          type="button"
          role="tab"
          :aria-controls="`panel-${t.key}`"
          :aria-selected="t.key === activeTab ? 'true' : 'false'"
        >
          <img
            v-if="t.key === activeTab"
            src="@/assets/images/arrow-right.png"
            alt="active icon"
            class="tab-icon"
          />
          {{ t.label }}
        </button>
      </li>

      <li class="nav-item">
        <a class="nav-link btn-yellow" role="button" @click="goToParticipation">
          參與專案
        </a>
      </li>
    </ul>

    <div class="tab-content mt-3">
      <div
        v-for="t in tabs"
        :key="`panel-${t.key}`"
        class="tab-pane fade"
        :class="{ 'show active': t.key === activeTab }"
        :id="`panel-${t.key}`"
        role="tabpanel"
        :aria-labelledby="`tab-${t.key}`"
      >
        <template v-if="t.key === 'brand'">
          <ul class="row list-unstyled small text-body">
            <li class="col-12 col-md-6">
              <div class="title">公司成立狀態</div>
              <div class="title-content">已成立 (2022-06-15)</div>
            </li>
            <li class="col-12 col-md-6">
              <div class="title">公司網址</div>
              <div class="title-content">https://www.super-milk-tea.com/</div>
            </li>
            <li class="col-12 col-md-6">
              <div class="title">領域別</div>
              <div class="title-content">飲料店業</div>
            </li>
            <li class="col-12 col-md-6">
              <div class="title">FB粉絲團</div>
              <div class="title-content">
                https://www.facebook.com/super.milk.tea2022
              </div>
            </li>
            <li class="col-12">
              <div class="title">公司規模</div>
              <div class="title-content">暫不提供</div>
            </li>
            <li class="col-12">
              <div class="title">資本額</div>
              <div class="title-content">100萬元 經濟部商業司查詢</div>
            </li>
          </ul>

          <p class="mb-2 mt-5">三旬國際餐飲有限公司</p>
          <p class="mt-4 mb-4">
            於2022年創立「顏太煮奶茶」，從古穿越至今，打造獨家特色厚奶茶系列飲品，菜單料多實在增加更多豐富選項。
            【一杯顏太煮 生活不會苦】。
          </p>
          <p>
            為持續提升市場競爭力，不斷地研發新品與尋找高品質原物料，從中累積的務實經驗，以成熟技術打造特色連鎖奶茶店，拓展業務從加盟業務到開店技術指導，用不斷累積的know-how，造就全方位品牌力。
          </p>

          <p class="mt-5">經營理念</p>
          <p class="">品牌核心 — 「以人為本，從心出發」</p>
          <p class="">「堅持力」：堅持最好的服務、品質。</p>
          <p class="">「專業力」：將每個最細微的地方做到最好</p>
        </template>

        <div v-else-if="t.key === 'joinInfo'">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <div class="tabs-2-content d-flex-block justify-content-between mt-4">
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon1.png" class="" />
              <span>免加盟金</span>
            </div>
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon2.png" class="" />
              <span>含生財器具</span>
            </div>
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon3.png" class="" />
              <span>含裝潢</span>
            </div>
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon4.png" class="" />
              <span>含教育訓練</span>
            </div>
            <div class="col-2">
              <img src="/src/assets/images/project-tabs-icon5.png" class="" />
              <span>含廣告行銷</span>
            </div>
          </div>
        </div>

        <div v-else-if="t.key === 'terms'" class="d-flex-block">
          <div class="col-md-6 p-3">
            <img src="@/assets/images/project-tabs-img1.png" class="w-100" />
          </div>
          <div class="col-md-6 p-3">
            <img src="@/assets/images/project-tabs-img2.png" class="w-100" />
          </div>
        </div>

        <div v-else-if="t.key === 'project'">
          <h1>報表內容</h1>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Tab from "bootstrap/js/dist/tab";

const router = useRouter();
const tabs = [
  { key: "brand", label: "品牌資訊" },
  { key: "joinInfo", label: "加盟資訊" },
  { key: "terms", label: "加盟條件" },
  { key: "project", label: "相關報表" },
];

const activeTab = ref(tabs[0].key);

onMounted(() => {
  const hash = window.location.hash.replace("#", "");
  if (tabs.some((t) => t.key === hash)) {
    activeTab.value = hash;
  }

  const triggerEl = document.querySelector(`#tab-${activeTab.value}`);
  if (triggerEl) new Tab(triggerEl).show();

  document.querySelectorAll('[data-bs-toggle="tab"]').forEach((el) =>
    el.addEventListener("shown.bs.tab", (e) => {
      const id = e.target.id.replace("tab-", "");
      activeTab.value = id;
      history.replaceState(null, "", `#${id}`);
    })
  );
});

function goToParticipation() {
  router.push({
    name: "participation",
    query: {
      source: "brand",
      tab: "progress",
      brandId: 101,
      brandName: "顏太煮奶茶",
    },
  });
}
</script>

<style scoped lang="scss">
.nav-pills .nav-link {
  border: 2px solid #ff6634;
  color: #ff6634;
  font-weight: 700;
  border-radius: 50px;
  padding: 0.6rem 1rem;
  background: #fff;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  width: 150px;
  justify-content: center;
}

.tab-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.nav-pills .nav-link.active {
  background: #ff6634;
  color: #fff;
}

.company {
  margin-bottom: 3rem;
  .tab-pane {
    padding: 3rem;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(2px);
    border-radius: 20px;
    @media (max-width: 576px) {
      padding: 25px;
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

.tabs-2-content {
  .col-2 {
    background: rgba(237, 237, 237, 0.8);
    color: #373a36;
    border-radius: 30px;
    height: 184px;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    img {
      margin-bottom: 0.5rem;
    }
  }
}

.btn-yellow {
  background: #ffcc00 !important;
  border: 2px solid #ffcc00 !important;
  color: #000 !important;
  font-weight: 700;
  border-radius: 50px;
  padding: 0.6rem 1rem;
  display: inline-flex;
  align-items: center;
}
</style>
