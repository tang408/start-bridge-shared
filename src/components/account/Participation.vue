<template>
  <div class="fs-24">參與專案管理</div>
  <section v-if="mode === 'account'">
    <SharedTabs
      v-model="activeTab"
      :tabs="[
        { label: '共創進度', value: 'progress' },
        { label: '共創明細', value: 'details' },
        { label: '共創紀錄', value: 'records' },
      ]"
    />

    <!-- 共創進度 -->
    <div v-if="activeTab === 'progress'" class="stack">
      <article
        v-for="p in projects"
        :key="p.id"
        class="article-card"
        :class="{ expanded: expandedId === p.id }"
      >
        <button
          type="button"
          class="summary"
          @click="toggle(p.id)"
          :aria-expanded="expandedId === p.id ? 'true' : 'false'"
          :aria-controls="`details-${p.id}`"
        >
          <header class="card-head">
            <span class="status-pill" :class="statusClass(p.status)">{{
              statusLabel(p.status)
            }}</span>
            <span class="time" v-if="isRunning(p.status)"
              >剩餘 {{ p.lastUpdate }}</span
            >
          </header>

          <div class="title">{{ p.title }}</div>

          <div class="progress-wrap" v-if="isRunning(p.status)">
            <div
              class="progress-bar"
              role="progressbar"
              :aria-valuemin="0"
              :aria-valuemax="100"
              :aria-valuenow="p.progress"
            >
              <div
                class="progress-inner"
                :style="{ width: p.progress + '%' }"
              ></div>
              <div class="progress-text">募資進度 {{ p.progress }}%</div>
            </div>

            <div class="progress-footer mt-2">
              <span class="dollar">已達成金額{{ fmtMoney(p.dollar) }}</span>
              <span class="remain">還差{{ fmtMoney(p.remain) }}</span>
            </div>
          </div>
        </button>

        <transition name="collapse">
          <div
            v-show="expandedId === p.id"
            class="details"
            :id="`details-${p.id}`"
          >
            <hr />
            <div class="fund-box" v-if="p.showFundBox">
              <div class="form-row">
                <label class="label">共創金額</label>
                <span>{{ fmtMoney(p.goal) }}</span>
              </div>

              <div class="form-row">
                <input
                  type="text"
                  class="form-input"
                  v-model="p.increaseAmountStr"
                  @input="onAmountInput(p)"
                  @blur="onAmountBlur(p)"
                  inputmode="numeric"
                />
                <button
                  type="button"
                  class="btn-dollar"
                  @click="handleIncrease(p)"
                >
                  增加金額
                </button>
              </div>
            </div>

            <div class="file-list" v-if="p.files?.length">
              <div class="file-row" v-for="f in p.files" :key="f.id">
                <span class="file-title">{{ f.title }}</span>
                <div class="file-content">
                  <span class="file-name">{{ f.fileName }}</span>
                  <button
                    type="button"
                    class="file-icon"
                    @click="downloadFile(f)"
                  >
                    <img src="@/assets/icon/dowload.png" alt="下載" />
                  </button>
                </div>
              </div>
            </div>

            <SharedFabActions
              :favorite="p.fav"
              iconType="heart"
              :showTrash="false"
              @favorite-toggle="(v) => (p.fav = v)"
              @remove="removeProject(p.id)"
            />
          </div>
        </transition>
      </article>
    </div>

    <!-- 共創明細 -->
    <div v-else-if="activeTab === 'details'" class="details">
      <article
        v-for="p in details"
        :key="p.id"
        class="article-card"
        :class="{ expanded: expandedDetailsId === p.id }"
      >
        <button
          type="button"
          class="summary"
          @click="toggleDetails(p.id)"
          :aria-expanded="expandedDetailsId === p.id ? 'true' : 'false'"
          :aria-controls="`details-${p.id}`"
        >
          <header class="card-head">
            <span class="status-pill" :class="statusClass(p.status)">{{
              statusLabel(p.status)
            }}</span>
            <span class="time" v-if="isRunning(p.status)"
              >剩餘 {{ p.lastUpdate }}</span
            >
            <span class="time" v-if="p.status === 'match-failed'">退款中</span>
          </header>

          <div class="title">{{ p.title }}</div>
          <div>
            <transition name="collapse">
              <div
                v-show="expandedDetailsId === p.id"
                class="detail-panel"
                :id="`details-${p.id}`"
              >
                <div class="tx-list">
                  <div
                    v-for="(t, i) in p.transactions"
                    :key="i"
                    class="tx-row"
                    :class="[
                      txRowClass(t.statusKey),
                      { 'is-disabled': t.statusKey === 'failed' },
                    ]"
                  >
                    <div class="tx-date">{{ t.date }}</div>
                    <div class="tx-label">共創金額</div>
                    <div class="tx-status">
                      {{ txStatusLabel(t.statusKey) }}
                    </div>
                    <div class="tx-amount">{{ fmtMoney(t.amount) }}</div>
                  </div>
                </div>
                <hr />
              </div>
            </transition>
            <div class="details-dollar d-flex justify-content-end">
              <span>共創總額</span>
              <span class="details-dollar-content">{{
                fmtMoney(p.dollar)
              }}</span>
            </div>
          </div>
        </button>
      </article>
    </div>

    <!-- 共創紀錄 -->
    <div v-else-if="activeTab === 'records'" class="records">
      <div class="toolbar">
        <SharedDropdown
          v-model="recFilter.timeOrder"
          placeholder="依時間排序"
          :options="[
            { label: '新→舊', value: 'desc' },
            { label: '舊→新', value: 'asc' },
          ]"
        />

        <SharedDropdown
          v-model="recFilter.action"
          placeholder="依動作排序"
          :options="[
            { label: '全部', value: '' },
            { label: '初次投入', value: '初次投入' },
            { label: '追加投入', value: '追加投入' },
            { label: '退款', value: '退款' },
            { label: '取消', value: '取消' },
          ]"
        />

        <SharedDropdown
          v-model="recFilter.status"
          placeholder="依狀態排序"
          :options="[
            { label: '全部', value: '' },
            { label: '成功', value: '成功' },
            { label: '失敗', value: '失敗' },
            { label: '處理中', value: '處理中' },
          ]"
        />

        <SharedDropdown
          v-model="recFilter.amountOrder"
          placeholder="依金額排序"
          :options="[
            { label: '不排序', value: '' },
            { label: '高→低', value: 'desc' },
            { label: '低→高', value: 'asc' },
          ]"
        />

        <SharedDropdown
          v-model="recFilter.export"
          placeholder="匯出格式"
          :options="[
            { label: 'CSV', value: '1' },
            { label: 'JPG', value: '2' },
          ]"
        />
      </div>

      <div class="table-wrap">
        <table class="records-table">
          <thead>
            <tr>
              <th>時間</th>
              <th>專案名稱</th>
              <th>動作</th>
              <th>狀態</th>
              <th class="ta-right">金額</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in displayedRecords" :key="row.id">
              <td class="table-wrap-date" data-th="時間">{{ row.date }}</td>
              <td class="ellipsis" :title="row.title" data-th="專案名稱">
                {{ row.title }}
              </td>
              <td data-th="動作">{{ row.action }}</td>
              <td data-th="狀態">{{ row.status }}</td>
              <td class="ta-right" data-th="金額">
                {{ fmtMoney(row.amount) }}
              </td>
            </tr>
            <tr v-if="!displayedRecords.length">
              <td colspan="5" class="empty">目前沒有符合條件的紀錄</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
  <section v-else class="details">
    <article
      v-for="p in projectsData"
      :key="p.id"
      class="article-card"
      :class="{ expanded: expandedId === p.id }"
    >
      <button
        type="button"
        class="summary"
        @click="toggle(p.id)"
        :aria-expanded="expandedId === p.id ? 'true' : 'false'"
        :aria-controls="`details-${p.id}`"
      >
        <header class="card-head">
          <span class="status-pill" :class="statusClass(p.status)">{{
            statusLabel(p.status)
          }}</span>
          <span class="time" v-if="isRunning(p.status)"
            >剩餘 {{ p.lastUpdate }}</span
          >
        </header>

        <div class="title">{{ p.title }}</div>

        <div>
          <div class="progress-wrap" v-if="isRunning(p.status)">
            <div
              class="progress-bar"
              role="progressbar"
              :aria-valuemin="0"
              :aria-valuemax="100"
              :aria-valuenow="p.progress"
            >
              <div
                class="progress-inner"
                :style="{ width: p.progress + '%' }"
              ></div>
              <div class="progress-text">募資進度 {{ p.progress }}%</div>
            </div>

            <div class="progress-footer mt-2">
              <span class="dollar">已達成金額{{ fmtMoney(p.dollar) }}</span>
              <span class="remain">還差{{ fmtMoney(p.remain) }}</span>
            </div>
          </div>

          <hr />
          <div class="form-group">
            <div class="agree-row">
              <input id="agree" type="checkbox" v-model="form.agree" />
              <label for="agree">我已閱讀並同意</label>
              <RouterLink class="agree-link" @click.stop
                >參與風險聲明</RouterLink
              >
              及
              <RouterLink class="agree-link" @click.stop
                >平台免責聲明</RouterLink
              >
            </div>

            <p class="error-msg" v-if="errors.agree">{{ errors.agree }}</p>
          </div>

          <div class="form-row mt-3">
            <input
              type="number"
              class="form-input"
              v-model.number="p.increaseAmount"
              min="0"
            />
            <button type="button" class="btn-dollar" @click="participate(p)">
              參與共創
            </button>
          </div>
        </div>
      </button>
    </article>
  </section>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, reactive, computed, onMounted, watch } from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedFabActions from "@/components/shared/Shared-Fab-Actions.vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import {
  statusLabel,
  statusClass,
  isRunning,
  txStatusLabel,
  txRowClass,
} from "@/utils/status";

const router = useRouter();
const route = useRoute();

const activeTab = ref("progress");
const expandedId = ref(null);
const expandedDetailsId = ref(null);
const mode = ref("account");
const form = reactive({ agree: false });
const errors = reactive({ agree: "" });

const props = defineProps({
  entry: { type: String, default: "account" },
  preselectTab: { type: String, default: "progress" },
  brandId: { type: [Number, String, null], default: null },
  brandName: { type: String, default: "" },
});

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id;
}
function toggleDetails(id) {
  expandedDetailsId.value = expandedDetailsId.value === id ? null : id;
}

const projects = reactive([
  {
    id: 1,
    status: "running",
    lastUpdate: "12天 2小時 50分",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    progress: 80,
    reached: 113456789,
    dollar: 123456789,
    remain: 86543211,
    goal: 1200000,
    increaseAmount: 200000,
    showFundBox: true,
    fav: false,
    files: [
      { id: "f1", title: "募資簡報", fileName: "pitchdeck.pdf", url: "#" },
      { id: "f2", title: "市場規模", fileName: "market.pdf", url: "#" },
      { id: "f3", title: "營運狀況", fileName: "operation.pdf", url: "#" },
      { id: "f4", title: "財務狀況", fileName: "finance.pdf", url: "#" },
    ],
  },
  {
    id: 2,
    status: "running",
    lastUpdate: "2天 2小時 50分",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    progress: 80,
    reached: 113456789,
    dollar: 123456789,
    remain: 86543211,
    goal: 1200000,
    increaseAmount: 0,
    showFundBox: false,
    fav: true,
    files: [
      { id: "f1", title: "募資簡報", fileName: "pitchdeck.pdf", url: "#" },
      { id: "f2", title: "市場規模", fileName: "market.pdf", url: "#" },
      { id: "f3", title: "營運狀況", fileName: "operation.pdf", url: "#" },
      { id: "f4", title: "財務狀況", fileName: "finance.pdf", url: "#" },
    ],
  },
  {
    id: 3,
    status: "success",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    files: [
      { id: "f1", title: "募資簡報", fileName: "pitchdeck.pdf", url: "#" },
      { id: "f2", title: "市場規模", fileName: "market.pdf", url: "#" },
      { id: "f3", title: "營運狀況", fileName: "operation.pdf", url: "#" },
      { id: "f4", title: "財務狀況", fileName: "finance.pdf", url: "#" },
    ],
  },
  {
    id: 4,
    status: "failed",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    files: [
      { id: "f1", title: "募資簡報", fileName: "pitchdeck.pdf", url: "#" },
      { id: "f2", title: "市場規模", fileName: "market.pdf", url: "#" },
      { id: "f3", title: "營運狀況", fileName: "operation.pdf", url: "#" },
      { id: "f4", title: "財務狀況", fileName: "finance.pdf", url: "#" },
    ],
  },
]);

const details = reactive([
  {
    id: "d-101",
    status: "running",
    lastUpdate: "12天 2小時 50分",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    dollar: 1200000,
    transactions: [
      {
        date: "2024-12-03",
        statusKey: "success",
        amount: 1200000,
      },
      {
        date: "2024-12-03",
        statusKey: "pending",
        amount: 200000,
      },
      {
        date: "2024-12-03",
        statusKey: "failed",
        amount: 1200000,
      },
    ],
  },
  {
    id: "d-102",
    status: "running",
    lastUpdate: "2天 2小時 50分",
    title: "另一個專案名稱另一個專案名稱",
    dollar: 680000,
    transactions: [
      {
        date: "2024-12-01",
        statusKey: "success",
        amount: 300000,
      },
      {
        date: "2024-12-02",
        statusKey: "pending",
        amount: 200000,
      },
      {
        date: "2024-12-03",
        statusKey: "success",
        amount: 180000,
      },
    ],
  },
  {
    id: "d-103",
    status: "match-success",
    lastUpdate: "2天 2小時 50分",
    title: "另一個專案名稱另一個專案名稱",
    dollar: 680000,
    transactions: [
      {
        date: "2024-12-01",
        statusKey: "success",
        amount: 300000,
      },
      {
        date: "2024-12-02",
        statusKey: "pending",
        amount: 200000,
      },
      {
        date: "2024-12-03",
        statusKey: "success",
        amount: 180000,
      },
    ],
  },
  {
    id: "d-104",
    status: "match-failed",
    lastUpdate: "2天 2小時 50分",
    title: "另一個專案名稱另一個專案名稱",
    dollar: 680000,
    transactions: [
      {
        date: "2024-12-01",
        statusKey: "success",
        amount: 300000,
      },
      {
        date: "2024-12-02",
        statusKey: "pending",
        amount: 200000,
      },
      {
        date: "2024-12-03",
        statusKey: "success",
        amount: 180000,
      },
    ],
  },
  {
    id: "d-105",
    status: "success",
    lastUpdate: "2天 2小時 50分",
    title: "另一個專案名稱另一個專案名稱",
    dollar: 680000,
    transactions: [
      {
        date: "2024-12-01",
        statusKey: "success",
        amount: 300000,
      },
      {
        date: "2024-12-02",
        statusKey: "pending",
        amount: 200000,
      },
      {
        date: "2024-12-03",
        statusKey: "success",
        amount: 180000,
      },
    ],
  },
  {
    id: "d-106",
    status: "failed",
    lastUpdate: "2天 2小時 50分",
    title: "另一個專案名稱另一個專案名稱",
    dollar: 680000,
    transactions: [
      {
        date: "2024-12-01",
        statusKey: "success",
        amount: 300000,
      },
      {
        date: "2024-12-02",
        statusKey: "pending",
        amount: 200000,
      },
      {
        date: "2024-12-03",
        statusKey: "success",
        amount: 180000,
      },
    ],
  },
]);

const records = reactive([
  {
    id: "rec-1",
    date: "2024-12-03",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    action: "初次投入",
    status: "成功",
    amount: 200200000,
  },
  {
    id: "rec-2",
    date: "2024-11-28",
    title: "另一個專案名稱",
    action: "追加投入",
    status: "處理中",
    amount: 500000,
  },
  {
    id: "rec-3",
    date: "2024-11-15",
    title: "第三個專案",
    action: "退款",
    status: "失敗",
    amount: 200000,
  },
]);

const projectsData = reactive([
  {
    id: "x-1",
    status: "running",
    lastUpdate: "剩餘2天 2小時 50分",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    progress: 80,
    dollar: 113456789,
    remain: 86543211,
    goal: 1200000,
    increaseAmount: 200000,
  },
]);

function removeProject(id) {
  const i = projects.findIndex((p) => p.id === id);
  if (i !== -1) projects.splice(i, 1);
}

function fmtMoney(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Number(n).toLocaleString("zh-Hant-TW");
}

function handleIncrease(p) {
  if (!p.increaseAmount || p.increaseAmount <= 0) return;
  alert(`已為「${p.title}」增加 ${fmtMoney(p.increaseAmount)} 元`);
  p.increaseAmount = 0;
}

function downloadFile(f) {
  alert(`下載：${f.name}`);
}

// 篩選狀態
const recFilter = reactive({
  timeOrder: "",
  action: "",
  status: "",
  amountOrder: "",
  export: "",
});

// 排序 + 篩選後資料
const displayedRecords = computed(() => {
  let list = [...records];

  if (recFilter.action && recFilter.action !== "all") {
    list = list.filter((r) => r.action === recFilter.action);
  }
  if (recFilter.status && recFilter.status !== "all") {
    list = list.filter((r) => r.status === recFilter.status);
  }

  // 時間排序
  if (recFilter.timeOrder) {
    list.sort((a, b) => {
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      return recFilter.timeOrder === "asc" ? ta - tb : tb - ta;
    });
  }

  // 金額排序
  if (recFilter.amountOrder) {
    list.sort((a, b) =>
      recFilter.amountOrder === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount
    );
  }

  return list;
});

function syncModeFromRoute() {
  const byProp = props.entry === "brand";
  const byQuery = route.query.source === "brand";
  mode.value = byProp || byQuery ? "brand" : "account";

  if (typeof route.query.tab === "string") {
    activeTab.value = route.query.tab;
  } else {
    activeTab.value = props.preselectTab;
  }
}

onMounted(() => {
  syncModeFromRoute();
  if (!route.query.tab) activeTab.value = props.preselectTab;
});

watch(
  () => [props.entry, route.query.source, route.query.tab],
  () => {
    const byProp = props.entry === "brand";
    const byQuery = route.query.source === "brand";
    mode.value = byProp || byQuery ? "brand" : "account";
    if (typeof route.query.tab === "string") {
      activeTab.value = route.query.tab;
    }
  }
);

function participate(p) {}
</script>

<style lang="scss" scoped>
.stack,
.details {
  display: flex;
  flex-flow: column;
  gap: 20px;
  width: 100%;
}

.article-card {
  width: 100%;
  position: relative;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 20px;
  padding: 30px;
  transition: box-shadow 0.2s ease, transform 0.1s ease, background 0.2s ease;
  gap: 20px;
  @media (max-width: 576px) {
    padding: 20px;
  }
}

.stack .article-card.expanded {
  padding: 30px 30px 120px;
  @media (max-width: 576px) {
    gap: 0;
    padding: 30px 20px 120px;
  }
}

.details .article-card.expanded {
  padding: 30px;
  @media (max-width: 576px) {
    padding: 20px;
  }
}

.summary {
  gap: 20px;
  display: inline-grid;
  text-align: start;
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
  padding: 6px 4px 12px;
  border-radius: 22px;
  &:focus-visible {
    outline: 2px solid #ffcc41;
  }
}

.card-head {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  @media (max-width: 576px) {
    display: inline-flex;
    flex-flow: wrap;
    gap: 5px;
  }

  .time {
    color: $text-dark;
    font-size: $fs-14;
    font-weight: $fw-400;
    line-height: $lh-17;
  }
}

.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 999px;
  font-weight: 400;
  font-size: $fs-14;
  line-height: 17px;
  &.running {
    background: $text-green;
    color: $white;
  }
  &.success,
  &.match-success {
    background: $text-dark;
    color: $white;
  }
  &.failed,
  &.match-failed {
    background: $brand-gray;
    color: $text-dark;
  }
}

.title {
  color: $text-deep;
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
}

.progress-wrap {
  position: relative;
  background: #fff;
  margin-bottom: 2px;
}
.progress-bar {
  position: relative;
  height: 24px;
  background: #f2f2f2;
  border-radius: 999px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #ffb54a, #ff6634);
}
.progress-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: $fw-500;
  font-size: $fs-14;
  line-height: $lh-17;
  color: $white;
}

.progress-label {
  position: absolute;
  top: -22px;
  right: 12px;
  font-size: 12px;
  color: $btn-orange;
  font-weight: 700;
}

.progress-footer {
  display: flex;
  justify-content: space-between;
  @media (max-width: 576px) {
    display: grid;
    gap: 5px;
  }
}

.remain {
  font-weight: $fw-500;
  font-size: $fs-15;
  line-height: $lh-22;
  color: $text-dark;
}

.dollar {
  font-weight: $fw-500;
  font-size: $fs-15;
  line-height: $lh-19;
  color: $btn-orange;
}

.details-dollar {
  font-weight: 500;
  font-size: $fs-15;
  line-height: 19px;
  color: #ff6634;
  gap: 30px;
}

.details-dollar-content {
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
  text-align: right;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}
.collapse-enter-active,
.collapse-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease;
}
.collapse-enter-to,
.collapse-leave-from {
  max-height: 1000px;
  opacity: 1;
}

.fund-box {
  margin-top: 8px;
  display: grid;
  gap: 10px;
}
.fund-box .form-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  @media (max-width: 576px) {
    display: contents;
  }
  &:first-child {
    grid-template-columns: 1fr;
  }
}
.label {
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
  color: $text-dark;
}
.form-input {
  width: 100%;
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid #e9ece8;
  font-size: $fs-14;
}
.btn-dollar {
  border: 0;
  padding: 10px 20px;
  border-radius: $br-8;
  background: $btn-orange;
  color: $white;
  cursor: pointer;
  width: 120px;
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
}

.file-list {
  margin-top: 6px;
  display: grid;
  gap: 8px;
}
.file-row {
  display: grid;
  padding: 10px 0;
  gap: 8px;
}

.file-content {
  display: inline-flex;
  justify-content: start;
  align-items: center;
  gap: 8px;
}

.file-title {
  font-weight: $fw-500;
  line-height: $lh-19;
}

.file-icon {
  width: 20px;
  height: 20px;
  border: none;
  background-color: transparent;
  padding: 0;
  display: inline-flex;
}
.file-name {
  color: $text-dark;
  font-weight: $fw-400;
  font-size: $fs-16;
  line-height: $lh-19;
}

.tx-list {
  gap: 10px;
  display: grid;
  @media (max-width: 576px) {
    gap: 20px;
  }
  .tx-row {
    display: flex;
    color: #555555;
    @media (max-width: 576px) {
      display: grid;
      gap: 5px;
    }
    .tx-date {
      width: 17%;
      font-weight: 400;
      font-size: 16px;
      line-height: 140%;
      letter-spacing: 2px;
      @media (max-width: 576px) {
        width: 100%;
      }
    }

    .tx-label {
      width: 65%;
      text-align: end;
      padding-right: 0.5rem;
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;
      letter-spacing: 0.04em;
      @media (max-width: 576px) {
        width: 100%;
        text-align: start;
      }
    }

    .tx-status {
      width: 8%;
      color: $text-dark;
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;
      letter-spacing: 0.04em;
      @media (max-width: 576px) {
        width: 100%;
      }
    }

    .tx-amount {
      width: 10%;
      text-align: end;
      font-weight: 400;
      font-size: 16px;
      line-height: 19px;
      @media (max-width: 576px) {
        width: 100%;
        text-align: start;
      }
    }
  }
  .is {
    &-pending {
      color: $brand-orange;
    }
    &-failed {
      color: $text-gray;
    }
  }
}

.records {
  width: 100%;
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin: 12px 0 16px;

    .btn-export {
      margin-left: auto;
      border: 1px solid #e9ece8;
      background: #fff;
      padding: 8px 14px;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
      line-height: 1;
      transition: background 0.15s ease, box-shadow 0.15s ease;
      &:hover {
        background: #fff7ef;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
      }
    }
  }

  .records-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }

  .records-table thead th {
    text-align: left;
    font-weight: 400;
    font-size: 15px;
    line-height: 140%;
    color: #555555;
    padding: 10px 6px;
  }

  .records-table tbody td {
    padding: 10px 6px;
    border-top: 1px solid #eaeaea;
    vertical-align: middle;
    font-weight: 400;
    font-size: 14px;
    line-height: 140%;
    color: #555555;
    @media (max-width: 576px) {
      border-top: none;
      border-bottom: 1px solid #eaeaea;
    }
  }

  .table-wrap-date {
    letter-spacing: 2px;
  }
  .records-table .ta-right {
    text-align: start;
  }

  .records-table .ellipsis {
    max-width: 380px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .records-table .empty {
    text-align: center;
    color: #9aa39d;
    padding: 28px 0;
  }
}

.records .dropdown-btn {
  min-width: 160px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #e9ece8;
  background: #fff;
  font-weight: 600;
  line-height: 1;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}
.records .dropdown.open .dropdown-btn,
.records .dropdown-btn:hover {
  background: #fff7ef;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

@media (max-width: 576px) {
  .records .toolbar {
    gap: 10px;
    .btn-export {
      width: 100%;
      margin-left: 0;
    }
  }
  .records .table-wrap {
    padding: 0;
  }

  .records-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 12px;
  }

  thead {
    display: none;
  }
  .records .records-table tbody td {
    font-size: 14px;
  }
  .records .records-table .ellipsis {
    max-width: 100%;
  }
  tbody {
    gap: 10px;
    display: grid;
  }

  tbody tr {
    display: grid;
    grid-template-columns: 1fr;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    padding: 14px 16px;
    border: 1px solid #eee;
  }
  tbody td {
    display: grid;
    grid-template-columns: 88px 1fr;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    border-top: 0;
    font-size: 15px;

    &::before {
      content: attr(data-th);
      color: $text-dark;
      font-size: 13px;
      line-height: 1;
    }
  }
  tbody tr td:last-child {
    border-bottom: none !important;
  }

  .ellipsis {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .records-table .empty {
    background: transparent;
    border: 0;
    box-shadow: none;
    padding: 24px 0;
  }
}

hr {
  border: 1px solid #dfdfdf;
}

.form-row {
  display: flex;
  gap: 10px;
}
.agree-row {
  justify-content: left !important;
}
</style>
