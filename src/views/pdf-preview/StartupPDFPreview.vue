<template>
  <div class="pdf-preview-container">
    <!-- 頂部工具列 -->
    <div class="pdf-toolbar" :class="{ 'toolbar-sticky': isScrolled }">
      <div class="toolbar-content">
        <button class="btn-back" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 18l-8-8 8-8 1.4 1.4L5.8 9H18v2H5.8l5.6 5.6L10 18z"/>
          </svg>
          返回
        </button>
        <div class="toolbar-actions">
          <button
            class="btn-download"
            @click="downloadPDF"
            :disabled="isGenerating"
          >
            <svg v-if="!isGenerating" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 9h-3V1H8v8H5l5 5 5-5zm-5 7v3H5v-3H3v5h14v-5h-2v3z"/>
            </svg>
            <span v-if="isGenerating" class="spinner"></span>
            {{ isGenerating ? '生成中...' : '下載 PDF' }}
          </button>
        </div>
      </div>
    </div>

    <!-- PDF 內容區域 -->
    <div
      class="pdf-content-wrapper"
      :class="{ 'preview-mode': isPreviewMode }"
    >
      <div v-if="isDataLoaded" ref="pdfContent" class="pdf-content">
        <!-- Step 1: 基本資料 -->
        <div class="pdf-page pdf-section" data-section="step1">
          <h2 class="section-title">一、基本資料</h2>
          <PDFStep1
            v-model="formData.step1"
            :errors="{}"
            :readonly="true"
            :step1Budget="formData.step1.budget"
          />
        </div>

        <!-- Step 3: 創業經驗 -->
        <div class="pdf-page pdf-section" data-section="step3">
          <h2 class="section-title">二、創業經驗</h2>
          <PDFStep3
            v-model="formData.step3"
            :errors="{}"
            :readonly="true"
          />
        </div>

        <!-- Step 4: 創業計畫 -->
        <div class="pdf-page pdf-section" data-section="step4">
          <h2 class="section-title">三、創業計畫</h2>
          <PDFStep4
            v-model="formData.step4"
            :errors="{}"
            :readonly="true"
            :step1Budget="formData.step1.budget"
          />
        </div>

        <!-- Step 5: 財務規劃 (Part 1) -->
        <div class="pdf-page pdf-section" data-section="step5-1">
          <h2 class="section-title">三、財務規劃與資金用途</h2>
          <PDFStep5Part1
            v-model="formData.step5"
            :errors="{}"
            :readonly="true"
          />
        </div>

        <!-- Step 5: 財務規劃 (Part 2) -->
        <div class="pdf-page pdf-section" data-section="step5-2">
          <h2 class="section-title">三、財務規劃與資金用途</h2>
          <PDFStep5Part2
            v-model="formData.step5"
            :errors="{}"
            :readonly="true"
          />
        </div>

        <!-- Step 6: 分潤條款 -->
        <div class="pdf-page pdf-section" data-section="step6">
          <h2 class="section-title">四、創業責任與分潤條款</h2>
          <PDFStep6
            v-model="formData.step6"
            :errors="{}"
            :readonly="true"
          />
        </div>
        <!-- Step 7: 風險提示與聲明 -->
        <div class="pdf-page pdf-section" data-section="step7">
          <h2 class="section-title">提交與後續</h2>
          <PDFStep7
            v-model="formData.step8"
            :errors="{}"
            :readonly="true"
          />
        </div>

        <!-- Step 8: 風險提示與聲明 -->
        <div class="pdf-page pdf-section" data-section="step8">
          <h2 class="section-title">創業風險提示與責任聲明</h2>
          <PDFStep8
            v-model="formData.step8"
            :errors="{}"
            :readonly="true"
          />
        </div>
      </div>
    </div>

    <!-- 頁碼顯示 (預覽模式) -->
    <div v-if="isPreviewMode" class="page-indicator">
      第 {{ currentPage }} / {{ totalPages }} 頁
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { planApi } from '@/api/modules/plan.js'
import { usePdfGenerator } from '@/composables/usePDFGenerateor.js'
import { NewAlert } from '@/composables/useAlert.js'

// 引入 PDF 專用組件
import PDFStep1 from '@/components/account/pdf-startup/PDFStep1.vue'
import PDFStep3 from '@/components/account/pdf-startup/PDFStep3.vue'
import PDFStep4 from '@/components/account/pdf-startup/PDFStep4.vue'
import PDFStep5Part1 from '@/components/account/pdf-startup/PDFStep5Part1.vue'
import PDFStep5Part2 from '@/components/account/pdf-startup/PDFStep5Part2.vue'
import PDFStep6 from '@/components/account/pdf-startup/PDFStep6.vue'
import PDFStep7 from "@/components/account/pdf-startup/PDFStep7.vue";
import PDFStep8 from "@/components/account/pdf-startup/PDFStep8.vue";

const route = useRoute()
const router = useRouter()
const { currentUser, currentUserName } = useAuth()
const { generateStepByStepPDF } = usePdfGenerator()

// 狀態管理
const pdfContent = ref(null)
const isGenerating = ref(false)
const isPreviewMode = ref(false)
const isScrolled = ref(false)
const currentPage = ref(1)
const totalPages = ref(0)

// 資料
const planId = ref(route.params.planId || route.query.planId)
const brandName = ref('')
const userName = computed(() => currentUserName.value || '未提供')

// 表單資料結構
const formData = reactive({
  step1: {
    brand: "",
    budget: "",
    selfFund: "",
    totalFunding: "",
    minAmount: "",
    amountRange: 10,
    partnerLimit: "",
  },
  step2: {file: null},
  step3: {
    hasStartupExp: "",
    expDesc: "",
    hasDispute: "",
    disputeDesc: "",
    selfAdv: "",
    resources: "",
    otherResources: "",
    willingDocs: "",
  },
  step4: {
    q1: "",
    q2: {},
    q3: "",
    q4: {},
    q5: {total: "", channels: []},
    q6: {},
    q7: [],
    q8Location: "",
    q8LocationNote: {},
    q9Location: "",
    q9LocationNote: {},
  },
  step5: {
    prepBudget: [
      {item: "品牌加盟的相關費用", amount: ""},
      {item: "店面的裝潢設計工程", amount: ""},
      {item: "營運設備與生財器具", amount: ""},
      {item: "開店前首批儲備物料", amount: ""},
      {item: "創業者預計支薪預算", amount: ""},
      {item: "籌備期其他人事成本", amount: ""},
      {item: "開店前品牌行銷費用", amount: ""},
      {item: "營運週轉金及現金流", amount: ""},
      {item: "其他（請說明）", amount: ""},
      {item: "總計", amount: ""},
    ],
    costStruct: [
      {
        item: "物料成本",
        percent: "",
        amount: "",
        note: "",
        desc: "(含物料及包材)",
      },
      {
        item: "人事成本",
        percent: "",
        amount: "",
        note: "",
        desc: "(含薪資及勞健保)",
      },
      {
        item: "租金成本",
        percent: "",
        amount: "",
        note: "",
        desc: "(不含押金)",
      },
      {
        item: "經營管理成本",
        percent: "",
        amount: "",
        note: "",
      },
      {item: "淨利", percent: "", amount: "", note: ""},
      {
        item: "總計",
        percent: "",
        amount: "",
        note: "",
        desc: "(淨利，不含稅)",
      },
    ],
    targetRevenue: "",
    rewardAmount: "",
    rewardPercent: "",

    fundNote: "",
    reportOptions: [
      {value: "pos", text: "提供店內 POS 帳號並開啟營業報表權限"},
      {value: "monthly", text: "每月/季「現金流量表」，需於次月 15 日前提供"},
      {
        value: "season",
        text: "每季/年度「財務報表」，需於當季後次月 15 日前提供",
      },
      {value: "yearly", text: "每年度「資產負債表」，需於次年一月底前提供"},
      {text: "其他", value: "other", withInput: true},
    ],
    otherReport: {},
  },
  step6: {
    sharePeriod: "",
    shareCalc: "",
    shareCalcOther: {},
    sharePay: "",
    sharePayOther: {},
    agree: "",
  },
  step8: {agree: 'agree'},
});


// 目錄結構
const tocSections = ref([
  { title: '基本資料', page: 3 },
  { title: '創業經驗', page: 4 },
  { title: '創業計畫', page: 5 },
  { title: '財務規劃（一）籌備預算', page: 6 },
  { title: '財務規劃（二）成本結構與營收目標', page: 7 },
  { title: '分潤條款', page: 8 },
])

// 格式化日期
function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 返回上一頁
function goBack() {
  router.back()
}

// 切換預覽模式
function togglePreviewMode() {
  isPreviewMode.value = !isPreviewMode.value
}

// 下載 PDF
async function downloadPDF() {
  if (!pdfContent.value) {
    await NewAlert.show('錯誤', 'PDF 內容尚未準備好')
    return
  }

  isGenerating.value = true

  try {
    const filename = `${brandName.value}_創業計劃書_${formatDate(new Date())}.pdf`

    const result = await generateStepByStepPDF(pdfContent.value, filename, {
      scale: 2,
      quality: 0.95,
      format: 'a4',
      orientation: 'portrait',
      margin: 10,
      sectionSelector: '.pdf-page',
      pageBreak: 'auto'
    })

    if (result.success) {
      await NewAlert.show('成功', 'PDF 已成功生成並下載')
    } else {
      await NewAlert.show('錯誤', 'PDF 生成失敗')
    }
  } catch (error) {
    console.error('PDF 生成錯誤:', error)
    await NewAlert.show('錯誤', 'PDF 生成過程中發生錯誤')
  } finally {
    isGenerating.value = false
  }
}

// 載入計劃資料
async function loadPlanData() {
  try {
    const response = await planApi.getPlan({
      userId: currentUser.value,
      planId: Number(planId.value)
    })

    if (response.code === 0) {
      const planData = response.data;
      console.log(planData.startupBudget)

      // Step1 - 基本資料
      Object.assign(formData.step1, {
        brand: String(planData.brand || ''),
        budget: String(planData.startupBudget || ''),
        selfFund: String(planData.selfPreparedFunds || ''),
        totalFunding: String(planData.totalAmount || ''),
        minAmount: String(planData.minimumAmount || ''),
        amountRange: String(planData.amountRange || ''),
        partnerLimit: String(planData.limitPartner || ''),
      });
      console.log('formData.step1:', formData.step1)
      // Step3 - 創業經驗
      Object.assign(formData.step3, {
        hasStartupExp: planData.hasExperience ? true : false,
        expDesc: planData.experienceDetails || '',
        hasDispute: planData.financialConstraints ? true : false,
        disputeDesc: planData.constraintsExplanation || '',
        selfAdv: planData.advantageExplanation || '',
        resources: planData.availableResources || '',
        otherResources: planData.otherResources || '',
        willingDocs: planData.supportDocumentation ? true : false,
      });

      // Step4 - 創業計畫
      Object.assign(formData.step4, {
        q1: planData.innovationDescription || '',
        q2: parseBriefingSession(planData.briefingSession),
        q3: planData.nextStagePlan || '',
        q4: parseRecruitmentMethods(planData.recruitmentMethods),
        q5: {
          total: {
            checked: true,
            value: String(planData.expectedNumberPeople || '')
          },
          channels: parseRecruitmentPipeline(planData.recruitmentPipeline)
        },
        q6: parseInvestTime(planData.investTime),
        q7: parseCustomerSource(planData.customerSource),
        q8Location: parseStoreLocation(planData.storeLocationType).value,
        q8LocationNote: parseStoreLocation(planData.storeLocationType).note,
        q9Location: parseCoFounderValue(planData.coFounderAddedValue).value,
        q9LocationNote: parseCoFounderValue(planData.coFounderAddedValue).note,
      });

      // Step5 - 財務規劃
      Object.assign(formData.step5, {
        prepBudget: [
          {item: "品牌加盟的相關費用", amount: String(planData.franchiseFee || '')},
          {item: "店面的裝潢設計工程", amount: String(planData.decorationCosts || '')},
          {item: "營運設備與生財器具", amount: String(planData.equipmentCosts || '')},
          {item: "開店前首批儲備物料", amount: String(planData.firstMaterialCost || '')},
          {item: "創業者預計支薪預算", amount: String(planData.paySalaryBudget || '')},
          {item: "籌備期其他人事成本", amount: String(planData.otherPersonnelCosts || '')},
          {item: "開店前品牌行銷費用", amount: String(planData.marketingExpenses || '')},
          {item: "營運週轉金及現金流", amount: String(planData.cashFlow || '')},
          {item: "其他（請說明）", amount: String(planData.otherCosts || '')},
          {
            item: "總計", amount:  String(
                Number(planData.franchiseFee || 0) +
                Number(planData.decorationCosts || 0) +
                Number(planData.equipmentCosts || 0) +
                Number(planData.firstMaterialCost || 0) +
                Number(planData.paySalaryBudget || 0) +
                Number(planData.otherPersonnelCosts || 0) +
                Number(planData.marketingExpenses || 0) +
                Number(planData.cashFlow || 0) +
                Number(planData.otherCosts || 0)
            ),
          },
        ],
        costStruct: [
          {
            item: "物料成本",
            percent: String(planData.firstMaterialCostsPercent || ''),
            amount: String(planData.firstMaterialCostsAmount || ''),
            note: planData.firstMaterialCostsRemark || '',
            desc: "(含物料及包材)",
          },
          {
            item: "人事成本",
            percent: String(planData.personnelCostsPercent || ''),
            amount: String(planData.personnelCostsAmount || ''),
            note: planData.personnelCostsRemark || '',
            desc: "(含薪資及勞健保)",
          },
          {
            item: "租金成本",
            percent: String(planData.rentalCostsPercent || ''),
            amount: String(planData.rentalCostsAmount || ''),
            note: planData.rentalCostsRemark || '',
            desc: "(不含押金)",
          },
          {
            item: "經營管理成本",
            percent: String(planData.peratingCostsPercent || ''),
            amount: String(planData.peratingCostsAmount || ''),
            note: planData.peratingCostsRemark || '',
          },
          {
            item: "淨利",
            percent: String(planData.otherCostsPercent || ''),
            amount: String(planData.otherCostsAmount || ''),
            note: planData.otherCostsRemark || '',
          },
          {
            item: "總計",
            percent: planData.firstMaterialCostsPercent &&
            planData.personnelCostsPercent &&
            planData.rentalCostsPercent &&
            planData.peratingCostsPercent &&
            planData.otherCostsPercent
                ? String(
                    Number(planData.firstMaterialCostsPercent || 0) +
                    Number(planData.personnelCostsPercent || 0) +
                    Number(planData.rentalCostsPercent || 0) +
                    Number(planData.peratingCostsPercent || 0) +
                    Number(planData.otherCostsPercent || 0)
                )
                : '',
            amount: planData.firstMaterialCostsAmount &&
            planData.personnelCostsAmount &&
            planData.rentalCostsAmount &&
            planData.peratingCostsAmount &&
            planData.otherCostsAmount
                ? String(
                    Number(planData.firstMaterialCostsAmount || 0) +
                    Number(planData.personnelCostsAmount || 0) +
                    Number(planData.rentalCostsAmount || 0) +
                    Number(planData.peratingCostsAmount || 0) +
                    Number(planData.otherCostsAmount || 0)
                )
                : '',
            note: '',
            desc: "(淨利，不含稅)",
          },
        ],
        targetRevenue: String(planData.turnoverTarget || ''),
        rewardEnabled: Boolean(planData.rewardThreshold),
        rewardAmount: String(planData.rewardThreshold || ''),
        rewardPercent: String(planData.rewardPercent || ''),
        fundNote: 1,
        reportSelected: parseReportSelected(planData.otherStatement),
        otherReport: parseOtherReport(planData.otherStatement),
      });

      // Step6 - 分潤條款
      Object.assign(formData.step6, {
        sharePeriod: parseProfitCycle(planData.profitDistributionCycle),
        shareCalc: parseProfitCalc(planData.profitCalculationMethod).value,
        shareCalcOther: parseProfitCalc(planData.profitCalculationMethod).other,
        sharePay: parseProfitPay(planData.profitPaymentMethod).value,
        sharePayOther: parseProfitPay(planData.profitPaymentMethod).other,
        agree: '',
      });

      // Step8 - 風險提示與責任聲明
      Object.assign(formData.step8, {
        agree: "agree"
      });

      await nextTick();
      console.log('載入計畫資料成功');
      console.log('formData:', formData);
    } else {
      await NewAlert.show('錯誤！', '載入計畫資料失敗，請洽客服人員。');
    }
  } catch (error) {
    console.error('載入計劃資料失敗:', error)
    await NewAlert.show('錯誤', '載入計劃資料失敗')
  }
}


// ==================== 解析函數 ====================

// Step4: Q2 - 解析簡報會議 "否 (112233)"
function parseBriefingSession(text) {
  if (!text) return {};

  if (text.startsWith('是')) {
    const content = text.replace(/^是\s*\(|\)$/g, '').trim();
    return {yes: {checked: true, value: content}};
  } else if (text.startsWith('否')) {
    const content = text.replace(/^否\s*\(|\)$/g, '').trim();
    return {plan: {checked: true, value: content}};
  }

  return {};
}

// Step4: Q4 - 解析招募方式 "本人親自參與經營"
function parseRecruitmentMethods(text) {
  if (!text) return {};

  const result = {};
  const methods = text.split(',').map(m => m.trim());

  methods.forEach(method => {
    if (method.includes('本人親自參與經營')) {
      result.founder = {checked: true, value: ''};
    } else if (method.includes('邀約親友加入')) {
      const match = method.match(/邀約親友加入:\s*(.+)/);
      result.family = {checked: true, value: match ? match[1] : ''};
    } else if (method.includes('另行招募')) {
      const match = method.match(/另行招募:\s*(.+)/);
      result.recruit = {checked: true, value: match ? match[1] : ''};
    } else if (method.includes('其他')) {
      const match = method.match(/其他:\s*(.+)/);
      result.other = {checked: true, value: match ? match[1] : ''};
    }
  });

  return result;
}

// Step4: Q5.channels - 解析招募管道 "人力銀行"
function parseRecruitmentPipeline(text) {
  if (!text) return {};

  const result = {};
  const channels = text.split(',').map(c => c.trim());

  channels.forEach(channel => {
    if (channel.includes('人力銀行')) {
      result.jobBank = {checked: true, value: ''};
    } else if (channel.includes('社群平台')) {
      result.social = {checked: true, value: ''};
    } else if (channel.includes('親友介紹')) {
      result.referral = {checked: true, value: ''};
    } else if (channel.includes('門店張貼')) {
      result.poster = {checked: true, value: ''};
    } else if (channel.includes('其他')) {
      const match = channel.match(/其他:\s*(.+)/);
      result.other = {checked: true, value: match ? match[1] : ''};
    }
  });

  return result;
}

// Step4: Q6 - 解析投入時間 "全職投入並同步參與經營 16-24"
function parseInvestTime(text) {
  if (!text) return {};

  if (text.includes('全職投入並同步參與經營')) {
    const match = text.match(/(\d+)-(\d+)/);
    return {
      fulltime: {
        checked: true,
        from: match ? match[1] : '',
        to: match ? match[2] : ''
      }
    };
  } else if (text.includes('全職投入但隨機參與經營')) {
    const match = text.match(/(\d+)-(\d+)/);
    return {
      parttime: {
        checked: true,
        from: match ? match[1] : '',
        to: match ? match[2] : ''
      }
    };
  } else if (text.includes('其他')) {
    const match = text.match(/其他:\s*(.+)/);
    return {
      other: {
        checked: true,
        value: match ? match[1] : text
      }
    };
  }

  return {};
}

// Step4: Q7 - 解析客戶來源 "親友推薦"
function parseCustomerSource(text) {
  if (!text) return {};

  const result = {};
  const sources = text.split(',').map(s => s.trim());

  sources.forEach(source => {
    if (source.includes('親友推薦')) {
      result.social = {checked: true, value: ''};
    } else if (source.includes('過路散客')) {
      result.passenger = {checked: true, value: ''};
    } else if (source.includes('商圈經營')) {
      result.business = {checked: true, value: ''};
    } else if (source.includes('網路口碑')) {
      result.web = {checked: true, value: ''};
    } else if (source.includes('其他')) {
      const match = source.match(/其他:\s*(.+)/);
      result.other = {checked: true, value: match ? match[1] : ''};
    }
  });

  return result;
}

// Step4: Q8 - 解析門市地點 "住家型商圈"
function parseStoreLocation(text) {
  if (!text) return {value: '', note: {}};

  const locationMap = {
    '核心商圈': 'core',
    '住家型商圈': 'residential',
    '辦公型商圈': 'office',
    '學校周邊': 'school',
    '百貨商場': 'mall'
  };

  for (const [key, value] of Object.entries(locationMap)) {
    if (text.includes(key)) {
      return {value, note: {}};
    }
  }

  // 其他情況
  const match = text.match(/其他:\s*(.+)/);
  return {
    value: 'other',
    note: {other: match ? match[1] : text}
  };
}

// Step4: Q9 - 解析共創者附加價值 "推廣親友及資源"
function parseCoFounderValue(text) {
  if (!text) return {value: '', note: {}};

  const valueMap = {
    '協助經營': 'operation',
    '推廣親友及資源': 'network',
    '協助行銷': 'sales',
    '能協助籌資': 'finance',
    '獨立經營': 'independent'
  };

  for (const [key, value] of Object.entries(valueMap)) {
    if (text.includes(key)) {
      return {value, note: {}};
    }
  }

  // 其他情況
  const match = text.match(/其他:\s*(.+)/);
  return {
    value: 'other',
    note: {other: match ? match[1] : text}
  };
}

// Step5: 解析報表選項 "提供店內 POS 帳號並開啟營業報表權限"
function parseReportSelected(text) {
  if (!text) return '';

  const optionMap = {
    'POS': 'pos',
    '每月': 'monthly',
    '每季': 'season',
    '每年': 'yearly'
  };

  for (const [key, value] of Object.entries(optionMap)) {
    if (text.includes(key)) {
      return value;
    }
  }

  return 'other';
}

function parseOtherReport(text) {
  if (!text || !text.includes('其他')) return {};

  const match = text.match(/其他:\s*(.+)/);
  return match ? {other: match[1]} : {};
}

// Step6: 解析分潤週期 "每月結算並分潤一次(每一個月)"
function parseProfitCycle(text) {
  if (!text) return '';

  if (text.includes('每月')) return 'monthly';
  if (text.includes('每季')) return 'quarterly';
  if (text.includes('每半年')) return 'halfyear';
  if (text.includes('每年')) return 'yearly';

  return '';
}

// Step6: 解析分潤計算方式
function parseProfitCalc(text) {
  if (!text) return {value: '', other: {}};

  if (text.includes('同意依照')) {
    return {value: 'agree', other: {}};
  } else if (text.includes('其他')) {
    const match = text.match(/其他:\s*(.+)/);
    return {
      value: 'other',
      other: {other: match ? match[1] : text}
    };
  }

  return {value: '', other: {}};
}

// Step6: 解析分潤支付方式
function parseProfitPay(text) {
  if (!text) return {value: '', other: {}};

  if (text.includes('銀行匯款')) {
    return {value: 'bank', other: {}};
  } else if (text.includes('其他')) {
    const match = text.match(/其他:\s*(.+)/);
    return {
      value: 'other',
      other: {other: match ? match[1] : text}
    };
  }

  return {value: '', other: {}};
}


// 監聽滾動事件
function handleScroll() {
  isScrolled.value = window.scrollY > 50

  // 計算當前頁碼
  if (isPreviewMode.value) {
    const pages = document.querySelectorAll('.pdf-page')
    const scrollPosition = window.scrollY + window.innerHeight / 2

    pages.forEach((page, index) => {
      const rect = page.getBoundingClientRect()
      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
        currentPage.value = index + 1
      }
    })
  }
}

const isDataLoaded = ref(false);

onMounted(async () => {
  await loadPlanData();
  await nextTick();

  isDataLoaded.value = true; // 標記數據已載入

  totalPages.value = document.querySelectorAll('.pdf-page').length;
  window.addEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
// 配色變數
$primary-color: #ffcc41;
$secondary-color: #ff6634;
$text-deep: #1a1a1a;
$text-dark: #333;
$text-gray: #666;
$border-color: #e0e0e0;
$bg-light: #fafafa;

// PDF 容器
.pdf-preview-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-top: 80px;
}

// 工具列
.pdf-toolbar {
  height: 100px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid $border-color;
  z-index: 1000;
  transition: all 0.3s ease;

  &.toolbar-sticky {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}

.toolbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    padding: 12px 16px;
  }
}

.toolbar-title {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  color: $text-deep;
  margin: 0;

  @media (max-width: 768px) {
    width: 100%;
    order: -1;
    font-size: 16px;
    margin-bottom: 12px;
  }
}

.toolbar-actions {
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
}

// 按鈕樣式
.btn-back,
.btn-preview,
.btn-download {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  svg {
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
  }
}

.btn-back {
  background: transparent;
  border: 1px solid $border-color;
  color: $text-gray;

  &:hover {
    background: $bg-light;
    border-color: $text-gray;
  }
}

.btn-preview {
  background: white;
  border: 1px solid $primary-color;
  color: $text-dark;

  &:hover {
    background: lighten($primary-color, 35%);
  }
}

.btn-download {
  background: $secondary-color;
  color: white;

  &:hover:not(:disabled) {
    background: darken($secondary-color, 10%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($secondary-color, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}


// PDF 內容區
.pdf-content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;

  &.preview-mode {
    .pdf-page {
      margin-bottom: 40px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

      &::after {
        content: '';
        position: absolute;
        bottom: -20px;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        height: 20px;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), transparent);
        border-radius: 50%;
        filter: blur(10px);
      }
    }
  }
}

// PDF 頁面基礎樣式
.pdf-page {
  background: white;
  padding: 60px 50px;
  margin-bottom: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;

  // A4 尺寸比例 (210mm x 297mm)
  min-height: 1050px;

  // 防止內容被截斷
  page-break-inside: avoid;
  break-inside: avoid;

  @media (max-width: 768px) {
    padding: 40px 30px;
    min-height: auto;
  }
}

// 封面頁
.pdf-cover-page {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.cover-content {
  .cover-title {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 30px;
    letter-spacing: 8px;

    @media (max-width: 768px) {
      font-size: 32px;
      letter-spacing: 4px;
    }
  }

  .cover-divider {
    width: 200px;
    height: 3px;
    background: white;
    margin: 0 auto 30px;
  }

  .cover-brand {
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 60px;

    @media (max-width: 768px) {
      font-size: 24px;
      margin-bottom: 40px;
    }
  }

  .cover-meta {
    font-size: 16px;
    opacity: 0.9;

    p {
      margin: 12px 0;
      letter-spacing: 2px;
    }
  }
}

// 目錄頁
.pdf-toc-page {
  .toc-title {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 3px solid $primary-color;
    color: $text-deep;
  }

  .toc-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .toc-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 18px;
    padding: 16px 0;
    border-bottom: 1px solid lighten($border-color, 5%);

    .toc-number {
      font-weight: 700;
      color: $secondary-color;
      min-width: 40px;
    }

    .toc-text {
      font-weight: 500;
      color: $text-dark;
    }

    .toc-dots {
      flex: 1;
      border-bottom: 2px dotted $border-color;
      margin: 0 16px;
    }

    .toc-page {
      font-weight: 600;
      color: $text-gray;
      min-width: 40px;
      text-align: right;
    }
  }
}

// 內容區塊
.pdf-section {
  .section-title {
    font-size: 24px;
    color: $text-deep;
    margin-bottom: 30px;
    padding-bottom: 16px;
    border-bottom: 3px solid $primary-color;
    page-break-after: avoid;
    break-after: avoid;
  }
}

// 頁碼指示器
.page-indicator {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  z-index: 999;
}

// 打印樣式
@media print {
  .pdf-toolbar,
  .page-indicator {
    display: none !important;
  }

  .pdf-preview-container {
    background: white;
    padding-top: 0;
  }

  .pdf-content-wrapper {
    max-width: none;
    padding: 0;
  }

  .pdf-page {
    box-shadow: none;
    page-break-after: always;
    margin: 0;
  }

  .pdf-page:last-child {
    page-break-after: auto;
  }
}
</style>

<!-- 新增：不使用 scoped 的全局樣式，專門用於 PDF 內容 -->
<style lang="scss">
/* PDF 表單樣式 - 全局樣式以確保 SharedInput 可以正確應用 */
.pdf-content {

  /* 表單容器 */
  .form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;

    &.mt-4 {
      margin-top: 1.5rem;
    }
  }

  /* 表單群組樣式 - 對應 SharedInput */
  .form-group {
    margin-bottom: 1.5rem;
    text-align: left;
    page-break-inside: avoid;

    label {
      font-weight: 500;
      font-size: 15px;
      line-height: 22px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      color: #333;
    }

    input,
    textarea,
    select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      background-color: #fff;
      color: #333;
      font-family: "Noto Sans TC", sans-serif;

      &[readonly],
      &:disabled {
        background-color: #f8f9fa;
        color: #495057;
        cursor: default;
        border-color: #e9ecef;
      }

      &.is-invalid {
        border-color: #db3838;
      }
    }

    /* 密碼輸入框的包裹容器 */
    .input-wrapper-with-eye {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;

      input {
        padding-right: 40px;
      }
    }

    /* 密碼顯示/隱藏按鈕 */
    .toggle-password {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
      z-index: 1;
    }
  }

  /* 錯誤訊息 */
  .error-msg {
    font-size: 13px;
    color: #db3838;
    margin-top: 4px;
    display: block;
  }

  /* Checkbox 和 Radio 樣式 */
  .checks {
    display: flex;
    flex-direction: column; /* 改為垂直排列 */
    gap: 12px; /* 增加間距 */
    flex-wrap: nowrap; /* 不換行 */

    .option {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 0; /* 移除額外的底部間距，因為已經用 gap 控制 */
      width: 100%; /* 確保每個選項占滿寬度 */

      input[type="radio"],
      input[type="checkbox"] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }

      &-label {
        padding-left: 28px;
        position: relative;
        cursor: pointer;
        line-height: 1.6;
        display: block;
        white-space: normal;
        font-weight: 400;
        width: 100%; /* 讓文字可以完整顯示 */

        &::before {
          content: "";
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid #bbb;
          border-radius: 4px;
          background: #fff;
          position: absolute;
          left: 0;
          top: 2px;
          transition: all 0.2s;
          box-sizing: border-box;
        }
      }

      input:checked + .option-label::before {
        background: #ff6634;
        border-color: #ff6634;
        box-shadow: 0 0 0 2px rgba(255, 102, 52, 0.2);
      }

      input:checked + .option-label::after {
        content: "✓";
        position: absolute;
        left: 4px;
        top: 0;
        font-size: 14px;
        color: #fff;
        font-weight: bold;
      }

      input:disabled + .option-label {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .textline {
        padding: 8px 12px; /* 增加內距 */
        margin-left: 0.5rem;
        flex: 1;
        max-width: 100%; /* 讓輸入框占滿剩餘空間 */
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
    }
  }

  /* 同意條款樣式 */
  .agree-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    font-size: 15px;
    line-height: 22px;

    input[type="checkbox"] {
      width: 16px !important;
      height: 16px;
      margin: 0 2px 0 0;
      cursor: pointer;
      appearance: none;
      border: 2px solid #dfdfdf;
      border-radius: 4px;
      background-color: #fff;

      &:checked {
        background-color: #ff6634;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 8.5L7 11.5L12 5' stroke='white' stroke-width='2'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100%;
      }
    }

    label {
      margin: 0;
      cursor: pointer;
    }

    .agree-link {
      color: #ff6634;
      text-decoration: none;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  /* 按鈕樣式 */
  .btn-confirm {
    width: 100%;
    margin-top: 10px;
    color: #fff;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    border: none;
    cursor: pointer;
    transition: 0.3s;
    background: #ff6634;
    border-radius: 8px;
    height: 40px;

    &:hover {
      background: #d84a12;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
