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
        <a class="nav-link btn-yellow" role="button">媒合中專案</a>
      </li>
      <li class="nav-item">
        <a class="nav-link btn-yellow" role="button">申請創業</a>
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
          <div>
            <p class="title mb-2 mt-5">品牌資訊</p>
            <p class="subtitle mb-2 mt-3">詳細介紹</p>

            <span>
              三旬國際餐飲有限公司於2022年創立「顏太煮奶茶」，從古穿越至今，打造獨家特色厚奶茶系列飲品，菜單料多實在增加更多豐富選項。
              【一杯顏太煮
              生活不會苦】為持續提升市場競爭力，不斷地研發新品與尋找高品質原物料，從中累積的務實經驗，以成熟技術打造特色連鎖奶茶店，拓展業務從加盟業務到開店技術指導，用不斷累積的know-how，造就全方位品牌力。
            </span>

            <p class="subtitle">經營理念</p>
            <span>品牌核心 — 「以人為本，從心出發」</span><br />
            <span>「堅持力」：堅持最好的服務、品質。</span><br />
            <span>「專業力」：將每個最細微的地方做到最好</span>
          </div>

          <div>
            <p class="title mb-2 mt-5">特色優勢</p>
            <span>
              三旬國際餐飲有限公司
              於2022年創立「顏太煮奶茶」，從古穿越至今，打造獨家特色厚奶茶系列飲品，菜單料多實在增加更多豐富選項。
              【一杯顏太煮 生活不會苦】。
            </span>
            <br />
            <span>
              三旬國際餐飲有限公司
              於2022年創立「顏太煮奶茶」，從古穿越至今，打造獨家特色厚奶茶系列飲品，菜單料多實在增加更多豐富選項。
              【一杯顏太煮 生活不會苦】。
            </span>
            <p class="subtitle">經營理念</p>
            <span>品牌核心 — 「以人為本，從心出發」</span>
            <span>「堅持力」：堅持最好的服務、品質。</span>
            <span>「專業力」：將每個最細微的地方做到最好</span>
          </div>
          <div>
            <p class="title mb-2 mt-5">營運項目(品項/單項)</p>
            <div class="row g-3">
              <div class="col-md-4 col-12">
                <img src="@/assets/images/cooperativeI-img.jpg" class="w-100" />
              </div>
              <div class="col-md-4 col-12">
                <img src="@/assets/images/cooperativeI-img.jpg" class="w-100" />
              </div>
              <div class="col-md-4 col-12">
                <img src="@/assets/images/cooperativeI-img.jpg" class="w-100" />
              </div>
            </div>
          </div>
          <div>
            <p class="title mb-2 mt-5">當前規模(門店數/區域佔比)</p>
            <span>總門店數：48 間</span><br />
            <span>分布區域：</span>
            <ul>
              <li>北部 24 間（50%）</li>
              <li>中部 12 間（25%）</li>
              <li>南部 10 間（21%）</li>
              <li>東部及離島 2 間（4%）</li>
            </ul>
          </div>
        </template>

        <div v-else-if="t.key === 'joinInfo'">
          <div class="join-info">
            <div v-for="(row, i) in joinInfoData" :key="i" class="ji-row">
              <div class="ji-label">{{ row.label }}</div>
              <div class="ji-value">
                <template v-if="row.value">{{ row.value }}</template>

                <ul v-else-if="row.list?.length" class="ji-list">
                  <li v-for="(li, j) in row.list" :key="j" v-html="li"></li>
                </ul>

                <div v-else-if="row.blocks?.length" class="ji-blocks">
                  <div v-for="(b, k) in row.blocks" :key="k" class="ji-block">
                    <div class="ji-block-title" v-if="b.title">
                      {{ b.title }}
                    </div>
                    <ul class="ji-list">
                      <li v-for="(li, m) in b.items" :key="m" v-html="li"></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="t.key === 'support'">
          <div class="join-info">
            <div v-for="(row, i) in supportData" :key="i" class="ji-row">
              <div class="ji-label">{{ row.label }}</div>
              <div class="ji-value">
                <template v-if="row.value">{{ row.value }}</template>

                <ul v-else-if="row.list?.length" class="ji-list">
                  <li v-for="(li, j) in row.list" :key="j" v-html="li"></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import Tab from "bootstrap/js/dist/tab";

const joinInfoData = [
  { label: "加盟金", value: "300萬元" },
  { label: "保證金", value: "100萬元" },
  { label: "加盟主門檻要求", value: "200萬元" },

  {
    label: "開幕準備項目表列",
    list: ["項目A：", "項目B：", "項目C："],
  },
  {
    label: "加盟主門檻要求",
    list: ["條件a：", "條件b：", "條件c：", "條件d："],
  },
  { label: "目前開放加盟區域", value: "台北、台中、高雄" },
  { label: "店面條件", value: "30坪以上" },

  {
    label: "裝潢期程",
    list: [
      "現場丈量／設計：1～5天",
      "裝潢估算報價：6～10天",
      "設計調整：11～13天",
      "初期工程：14～25天",
      "機電工程：26～35天",
      "裝潢工程：36～42天",
      "檢收試營運：43～45天",
    ],
  },

  {
    label: "其他成本",
    list: ["吉祥物夥伴：", "貨運：", "進口運送："],
  },
];

const supportData = [
  {
    label: "商業模式關鍵數據",
    list: ["單店營收：", "回本週期：", "營業預估："],
  },
  {
    label: "加盟主培訓資訊",
    list: ["受訓時間：", "地址：", "團隊人數要求："],
  },
  { label: "加盟主門檻要求", value: "200萬元" },
  {
    label: "總部支援綱要",
    list: ["行銷：", "客服：", "物流：", "研發："],
  },
];

const tabs = [
  { key: "brand", label: "品牌資訊" },
  { key: "joinInfo", label: "加盟資訊" },
  { key: "support", label: "營運與支援" },
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
</script>

<style scoped lang="scss">
.nav-pills .nav-link {
  border: 2px solid #ff6634;
  color: #ff6634;
  font-weight: 700;
  border-radius: 999px;
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

.btn-yellow {
  background: #ffcc00 !important;
  border: 2px solid #ffcc00 !important;
  color: #000 !important;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.6rem 1rem;
  display: inline-flex;
  align-items: center;
}

.title {
  font-weight: 600;
  font-size: 18px;
  line-height: 26px;
  color: #262626;
}

.subtitle {
  font-weight: 700;
  font-size: 18px;
  line-height: 28px;
  color: #555555;
  margin-top: 3rem;
}

span {
  color: #555555;
}

.join-info {
  .ji-row {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 16px;
    padding: 14px 0;
    &:last-child {
      border-bottom: 0;
    }
  }

  .ji-label {
    font-weight: 600;
    font-size: 16px;
    line-height: 28px;
    color: #373a36;
    word-break: keep-all;
  }

  .ji-value {
    font-weight: 400;
    font-size: 16px;
    line-height: 28px;
    color: #555555;
  }

  .ji-list {
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      position: relative;
      padding-left: 1em;

      &::before {
        content: "•";
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }

  .ji-block + .ji-block {
    margin-top: 8px;
  }

  .ji-block-title {
    font-weight: 700;
    margin-bottom: 6px;
  }

  @media (max-width: 576px) {
    .ji-row {
      grid-template-columns: 1fr;
      gap: 6px;
      .ji-label {
        color: #555;
      }
    }
  }
}

.tab-content {
  font-weight: 400;
  font-size: 16px;
  line-height: 28px;
  color: #555555;
}
</style>
