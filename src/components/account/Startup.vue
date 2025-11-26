<template xmlns="http://www.w3.org/1999/html">
  <section v-if="mode === 'account'">
    <div class="fs-24">創業計劃管理</div>
    <SharedTabs
        class="mt-05"
        v-model="activeTab"
        :tabs="[
        { label: '創業進度', value: 'progress' },
        { label: '創業明細', value: 'detail' },
      ]"
    />

    <div v-if="activeTab === 'progress'" class="w-100">
      <article
          v-for="p in progress"
          :key="p.id"
          class="card mt-2"
          :class="{ expanded: expandedId === p.id }"
      >
        <!-- Toggle 按鈕：只包含顯示內容 -->
        <button
            type="button"
            class="summary"
            @click="toggle(p.id)"
            :aria-expanded="expandedId === p.id ? 'true' : 'false'"
            :aria-controls="`details-${p.id}`"
        >
          <header class="card-head">
        <span class="status-pill" :class="statusClass(p.status)">
          {{ statusLabel(p.status) }}
        </span>
          </header>

          <div class="title">{{ p.title }}</div>

          <div class="steps-wrap">
            <div class="steps-bar">
          <span
              v-for="n in 8"
              :key="n"
              class="steps-step"
              :class="{ active: n <= p.progressStep }"
          ></span>
            </div>

            <div class="steps-footer mt-3 flex-column">
              <span class="status">媒合狀態：{{ p.stateText }}</span>
              <span class="status mt-2" v-if="p.remark !== '' && p.status < 0">原因：{{ p.remark }}</span>
            </div>
          </div>
        </button>

        <!-- 展開內容：在 toggle 按鈕外部 -->
        <transition name="details-wrapper-transition">
          <div
              v-show="expandedId === p.id"
              class="details-wrapper"
              :id="`details-${p.id}`"
              role="region"
          >
            <div class="expanded-fields-content">
              <div class="two-buttons-group mt-3 d-flex gap-4">
                <button
                    type="button"
                    class="text-link"
                    @click.stop="handlePDFPreviewClick(p.id)"
                >
                  創業計劃書
                </button>
                <button
                    type="button"
                    class="text-link"
                    @click.stop="handleBtn2Click(p.id)"
                >
                  品牌資訊
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- 其他操作按鈕：在 toggle 按鈕外部 -->
        <button
            v-if="p.status !== -999 && (p.status < 0 || p.status === 2)"
            type="button"
            class="btn-upload"
            @click.stop="handleButtonClick(p)"
        >
          審核不通過，請重新上傳資料
        </button>

        <button
            v-if="(p.status === 4 || p.status === 5)"
            type="button"
            class="btn-upload"
            :disabled="p.paymentStatus === 1"
            @click.stop="handleUploadData(p)"
        >
          上傳資料
        </button>

        <!-- 簽約立案按鈕 -->
        <button
            v-if="(p.status === 4 || p.status === 5)"
            type="button"
            class="btn-upload"
            :disabled="p.contractStatus === 1"
            @click.stop="handleSignContract(p)"
        >
          簽署平台合約
        </button>

        <button
            v-if="p.status === 7"
            type="button"
            class="btn-upload"
            @click.stop="handleButtonClick(p)"
        >
          我已簽屬完成
        </button>

        <button
            v-if="p.status === 12"
            type="button"
            class="btn-upload"
            @click.stop="handleButtonClick(p)"
        >
          上傳合約並支付服務費
        </button>

        <button
            v-if="p.status === 15"
            type="button"
            class="btn-upload"
            :disabled="p.companyStatus === 1"
            @click.stop="handleCompanyButtonClick(p)"
        >
          上傳公司資料
        </button>

        <!-- 並排顯示 -->
        <div v-if="p.status === 10 && isWithinOneWeekBeforeEnd(p.endTime)" class="">
          <span>專案即將結束，您可以選擇以下操作：</span>
          <button
              type="button"
              class="btn-expand"
              @click.stop="handleExtendProject(p)"
          >
            延長專案
          </button>
          <button
              type="button"
              class="btn-end"
              @click.stop="handleEndProject(p)"
          >
            結束專案
          </button>
        </div>
      </article>
    </div>

    <div v-if="activeTab === 'detail'" class="records">
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
          </tr>
          <tr v-if="!displayedRecords.length">
            <td colspan="5" class="empty">目前沒有符合條件的紀錄</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- 預覽模式 -->
  <section v-else-if="mode === 'preview'">
    <div class="fs-24">
      {{ docTitle }} (預覽模式)
    </div>
    <component
        :is="currentStepComponent"
        v-model="formData[docStep]"
        :errors="formErrors[docStep]"
        :readonly="true"
        :step1Budget="formData.step1.budget"
        @next="goNext"
    />
  </section>

  <!-- PDF 預覽模式 -->
  <section v-else-if="mode === 'pdf-preview'" class="pdf-preview-section">
    <div class="pdf-header">
      <h2 class="fs-24">創業計劃書預覽</h2>
      <div class="pdf-actions">
        <button
            type="button"
            class="btn-expand mb-2"
            @click="handleDownloadPDF"
            :disabled="isGeneratingPDF"
        >
          {{ isGeneratingPDF ? '生成中...' : '下載 PDF' }}
        </button>
      </div>
    </div>

    <!-- PDF 內容容器 - 這個會被轉換成 PDF -->
    <div ref="pdfContent" class="pdf-content">
      <div class="pdf-page">
        <!-- Step 1 -->
        <div class="pdf-section">
          <h2 class="section-title">一、基本資料</h2>
          <Step1
              v-model="formData.step1"
              :errors="{}"
              :readonly="true"
              :step1Budget="formData.step1.budget"
          />
        </div>

        <!-- Step 3 -->
        <div class="pdf-section">
          <h2 class="section-title">三、創業經驗</h2>
          <Step3
              v-model="formData.step3"
              :errors="{}"
              :readonly="true"
              :showBackButton="false"
          />
        </div>

        <!-- Step 4 -->
        <div class="pdf-section">
          <h2 class="section-title">四、創業計畫</h2>
          <Step4
              v-model="formData.step4"
              :errors="{}"
              :readonly="true"
              :step1Budget="formData.step1.budget"
          />
        </div>

        <!-- step5 Part 1: 籌備預算 -->
        <div class="pdf-section">
          <h2 class="section-title">五、財務規劃（一）籌備預算</h2>

          <div class="budget-section">
            <h3 class="subsection-title">籌備預算明細</h3>

            <table class="budget-table">
              <thead>
              <tr>
                <th style="width: 60%;">項目</th>
                <th style="width: 40%; text-align: right;">金額（元）</th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="(item, index) in formData.step5.prepBudget"
                  :key="index"
                  :class="{ 'total-row': item.item === '總計' }"
              >
                <td>{{ item.item }}</td>
                <td style="text-align: right;">
                  {{ item.amount ? parseInt(item.amount).toLocaleString('zh-TW') : '0' }}
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Part 2: 成本結構與營收目標 -->
        <div class="pdf-section">
          <h2 class="section-title">五、財務規劃（二）成本結構與營收目標</h2>

          <!-- 成本結構表 -->
          <div class="cost-section">
            <h3 class="subsection-title">成本結構</h3>

            <table class="cost-table">
              <thead>
              <tr>
                <th style="width: 35%;">項目</th>
                <th style="width: 15%; text-align: center;">佔比（%）</th>
                <th style="width: 25%; text-align: right;">金額（元）</th>
                <th style="width: 25%;">備註</th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="(item, index) in formData.step5.costStruct"
                  :key="index"
                  :class="{ 'total-row': item.item === '總計' }"
              >
                <td>
                  <div>{{ item.item }}</div>
                  <div v-if="item.desc" class="item-desc">{{ item.desc }}</div>
                </td>
                <td style="text-align: center;">{{ item.percent || '-' }}</td>
                <td style="text-align: right;">
                  {{ item.amount ? parseInt(item.amount).toLocaleString('zh-TW') : '0' }}
                </td>
                <td>{{ item.note || '-' }}</td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- 營收目標 -->
          <div class="revenue-section">
            <h3 class="subsection-title">營收目標</h3>

            <div class="info-group">
              <div class="info-item">
                <span class="info-label">月營業額目標：</span>
                <span class="info-value">
          {{ formData.step5.targetRevenue ? parseInt(formData.step5.targetRevenue).toLocaleString('zh-TW') : '0' }} 元
        </span>
              </div>

              <!-- 獎勵機制 -->
              <div v-if="formData.step5.rewardEnabled" class="info-item">
                <span class="info-label">獎勵機制：</span>
                <span class="info-value">
          當月營業額達 {{ parseInt(formData.step5.rewardAmount || 0).toLocaleString('zh-TW') }} 元以上，
          額外分潤 {{ formData.step5.rewardPercent }}%
        </span>
              </div>

              <!-- 資金使用備註 -->
              <div class="info-item">
                <span class="info-label">資金使用備註：</span>
                <span class="info-value">
          {{ formData.step5.fundNote === 1 ? '依實際需求調整' : formData.step5.fundNote }}
        </span>
              </div>

              <!-- 報表提供方式 -->
              <div class="info-item">
                <span class="info-label">報表提供方式：</span>
                <span class="info-value">{{ getStep5ReportText() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 6 -->
        <div class="pdf-section">
          <h2 class="section-title">六、分潤條款</h2>
          <Step6
              v-model="formData.step6"
              :errors="{}"
              :readonly="true"
          />
        </div>

        <!--        &lt;!&ndash; Step 7 &ndash;&gt;-->
        <!--        <div class="pdf-section">-->
        <!--          <h2 class="section-title">七、提交與後續</h2>-->
        <!--          <Step7-->
        <!--              v-model="formData.step7"-->
        <!--              :errors="{}"-->
        <!--              :readonly="true"-->
        <!--          />-->
        <!--        </div>-->

        <!--        &lt;!&ndash; Step 8 &ndash;&gt;-->
        <!--        <div class="pdf-section">-->
        <!--          <h2 class="section-title">八、風險提示與責任聲明</h2>-->
        <!--          <Step8-->
        <!--              v-model="formData.step8"-->
        <!--              :errors="{}"-->
        <!--              :readonly="true"-->
        <!--          />-->
        <!--        </div>-->
      </div>
    </div>
  </section>


  <section v-else>
    <div class="fs-24">
      {{ docTitle }}
    </div>
    <component
        :is="currentStepComponent"
        v-model="formData[docStep]"
        :errors="formErrors[docStep]"
        @next="goNext"
        :step1Budget="formData.step1.budget"
        @submit="createPlan"
    />
  </section>

  <SharedModal
      v-model="showReleaseChargeDialog"
      title="支付上架費"
      mode="submit"
      confirmText="確認上傳"
      cancelText="取消"
      :showCancel="true"
      @submit="handleReleaseChargeSubmit"
  >
    <div class="payment-form">
      <div class="form-group">
        <label>支付金額</label>
        <div class="readonly-field">{{ formatAmount(3500) }} 元</div>
      </div>
      <!-- 顯示匯款資訊 -->
      <div class="form-group">
        <label>匯款資訊</label>
        <div class="readonly-field">
          銀行名稱：{{ bankInfo.bankName }}<br/>
          銀行代碼：{{ bankInfo.bankCode }}<br/>
          帳號：{{ bankInfo.bankAccount }}<br/>
          戶名：{{ bankInfo.bankAccountName }}
        </div>
      </div>
      <SharedInput
          id="accountLast5"
          label="帳號後五碼*"
          type="text"
          class="p-510"
          placeholder="請輸入帳號後五碼"
          v-model="paymentForm.accountLast5"
          :error="paymentErrors.accountLast5"
          required
      />

      <SharedUpload
          label="上傳付款憑證*"
          accept=".pdf,.jpg,.jpeg,.png"
          :max-size="5"
          name="userPaymentProofFile"
          v-model="paymentForm.paymentProofName"
          :error="paymentErrors.paymentProof"
          @upload-success="(result) => handleUploadSuccess('userPaymentProofFile', result)"
          required
          :account="uploadAccount"
          :type="'上架費匯款明細'"
          :id="currentUser.value"
      />
    </div>

  </SharedModal>

  <SharedModal
      v-model="showExtendDialog"
      title="延長專案"
      mode="submit"
      confirmText="確認延長"
      cancelText="取消"
      :showCancel="true"
      @submit="handleExtendSubmit"
  >
    <div class="extend-form">
      <div class="warning-section">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          此專案將延長合2個月，結束時間將延至 {{ extendedDate }}
        </div>
      </div>
      <div class="form-group">
        <label>提醒您：延長媒合期間已投入資源的創業夥伴有權撤回資源。</label>
      </div>

      <div class="confirm-question">
        請問是否確定延長？
      </div>
    </div>
  </SharedModal>

  <SharedModal
      v-model="showEndPlanDialog"
      title="結束專案"
      mode="submit"
      confirmText="確認結束"
      cancelText="取消"
      :showCancel="true"
      @submit="handleEndPlanSubmit"
  >
    <div class="extend-form">
      <div class="warning-section">
        <div class="warning-icon">⚠️</div>
        <div class="confirm-question">
          請問是否確定結束專案？
        </div>
      </div>
    </div>
  </SharedModal>

  <!-- 支付上傳 Dialog -->
  <SharedModal
      v-model="showPaymentDialog"
      title="上傳支付資料"
      mode="submit"
      confirmText="確認上傳"
      cancelText="取消"
      :showCancel="true"
      @submit="handleContractPaymentSubmit"
  >
    <div class="payment-form">
      <div class="form-group">
        <label>支付金額</label>
        <div class="readonly-field">{{ formatAmount(paymentForm.amount) }} 元</div>
      </div>
      <div class="form-group">
        <label>匯款資訊</label>
        <div class="readonly-field">
          銀行名稱：{{ bankInfo.bankName }}<br/>
          銀行代碼：{{ bankInfo.bankCode }}<br/>
          帳號：{{ bankInfo.bankAccount }}<br/>
          戶名：{{ bankInfo.bankAccountName }}
        </div>
      </div>

      <SharedInput
          id="accountLast5"
          label="帳號後五碼*"
          type="text"
          placeholder="請輸入帳號後五碼"
          v-model="paymentForm.accountLast5"
          :error="paymentErrors.accountLast5"
          required
      />

      <SharedUpload
          label="上傳合約*"
          accept=".pdf,.doc,.docx"
          :max-size="10"
          name="planFinalContract"
          v-model="paymentForm.contractFileName"
          :error="paymentErrors.contractFile"
          @upload-success="(result) => handleUploadSuccess('planFinalContract', result)"
          required
          :type="'創業者上傳合約'"
          :account="uploadAccount" :id="currentUser.value"/>


      <SharedUpload
          label="上傳付款憑證*"
          accept=".pdf,.jpg,.jpeg,.png"
          :max-size="5"
          name="userPaymentProofFile"
          v-model="paymentForm.paymentProofName"
          :error="paymentErrors.paymentProof"
          @upload-success="(result) => handleUploadSuccess('userPaymentProofFile', result)"
          required
          :account="uploadAccount"
          :type="'服務費匯款明細'"
          :id="currentUser.value"/>
    </div>
  </SharedModal>

  <SharedModal
      v-model="showCompanyDialog"
      title="上傳公司資料"
      mode="submit"
      confirmText="確認上傳"
      cancelText="取消"
      :showCancel="true"
      @submit="handleCompanySubmit"
  >
    <SharedInput
        id="companyName"
        label="公司名稱*"
        type="textarea"
        placeholder="請填寫公司名稱"
        v-model="companyForm.companyName"
        :error="paymentErrors.companyName"
    />
    <SharedInput
        id="companyNameEn"
        label="公司名稱(英文)"
        type="textarea"
        placeholder="請填寫公司名稱(英文)"
        v-model="companyForm.companyNameEn"
        :error="paymentErrors.companyNameEn"
    />
    <SharedInput
        id="businessId"
        label="統一編號*"
        type="textarea"
        placeholder="請填寫統一編號"
        v-model="companyForm.businessId"
        :error="paymentErrors.businessId"
    />

    <SharedUpload
        label="上傳公司LOGO"
        accept=".pdf,.jpg,.jpeg,.png"
        :max-size="5"
        name="companyLogo"
        v-model="companyForm.companyLogo"
        :error="paymentErrors.companyLogo"
        @upload-success="(result) => handleUploadSuccess('companyLogo', result)"
        required
        :account="uploadAccount"
        :type="'公司LOGO'"
        :id="currentUser.value"/>

    <SharedInput
        id="slogan"
        label="公司標語"
        type="textarea"
        placeholder="請填寫公司標語"
        v-model="companyForm.slogan"
        :error="paymentErrors.slogan"
    />
    <SharedInput
        id="bankAccountName"
        label="銀行帳戶名稱"
        type="textarea"
        placeholder="請填寫銀行帳戶名稱"
        v-model="companyForm.bankAccountName"
        :error="paymentErrors.bankAccountName"
    />
    <SharedInput
        id="bankAccountNumber"
        label="銀行帳戶號碼"
        type="textarea"
        placeholder="請填寫銀行帳戶號碼"
        v-model="companyForm.bankAccountNumber"
        :error="paymentErrors.bankAccountNumber"
    />
    <SharedInput
        id="profile"
        label="公司簡介"
        type="textarea"
        placeholder="請填寫公司簡介"
        v-model="companyForm.profile"
        :error="paymentErrors.profile"
    />
    <SharedInput
        id="info"
        label="公司詳細介紹"
        type="textarea"
        placeholder="請填寫公司詳細介紹"
        v-model="companyForm.info"
        :error="paymentErrors.info"
    />
    <SharedInput
        id="officialUrl"
        label="公司官方網站"
        type="textarea"
        placeholder="請填寫公司官方網站"
        v-model="companyForm.officialUrl"
        :error="paymentErrors.officialUrl"
    />
    <SharedInput
        id="facebookUrl"
        label="公司 Facebook 網址"
        type="textarea"
        placeholder="請填寫公司 Facebook 網址"
        v-model="companyForm.facebookUrl"
        :error="paymentErrors.facebookUrl"
    />
    <SharedInput
        id="instagramUrl"
        label="公司 Instagram 網址"
        type="textarea"
        placeholder="請填寫公司 Instagram 網址"
        v-model="companyForm.instagramUrl"
        :error="paymentErrors.instagramUrl"
    />
  </SharedModal>


  <!-- 合約確認 Dialog -->
  <SharedModal
      v-model="showContractConfirmDialog"
      title="合約確認"
      mode="submit"
      confirmText="確認提交"
      cancelText="取消"
      :showCancel="true"
      @submit="handleContractConfirm"
      @cancel="handleContractCancel"
      class="contract-confirm-dialog"
  >
    <div class="contract-confirm-content">

      <div class="agreement-checkbox">
        <label class="checkbox-label">
          <input
              type="checkbox"
              v-model="contractAgreed"
              @change="contractErrors.agreement = ''"
          />
          <span class="checkbox-text">我已詳閱、同意平台合約並完成簽章。</span>
        </label>
        <div v-if="contractErrors.agreement" class="error-message">
          {{ contractErrors.agreement }}
        </div>
      </div>
    </div>
  </SharedModal>

  <div v-if="showPartnerDialog" class="dialog-overlay" @click.self="showPartnerDialog = false">
    <div class="dialog-content">
      <!-- 關閉按鈕 -->
      <button class="dialog-close" @click="showPartnerDialog = false">×</button>

      <!-- 標題 -->
      <h2>{{ partnerData?.name }}</h2>

      <!-- 內容區域 - 建議用分區塊顯示 -->
      <div class="dialog-body">

        <!-- 基本資訊 -->
        <section class="info-section">
          <h3>基本資訊</h3>
          <div class="info-item">
            <label>品牌名稱：</label>
            <span>{{ partnerData?.name }}</span>
          </div>
          <div class="info-item">
            <label>產業類型：</label>
            <span>{{ industryTypesData[partnerData?.industryType-1].name|| '無資料' }}</span>
          </div>
          <!-- ...其他基本資訊 -->
        </section>

        <!-- 財務資訊 -->
        <section class="info-section">
          <h3>財務資訊</h3>
          <div class="info-item">
            <label>資本額：</label>
            <span>{{ partnerData?.capital }} </span>
          </div>
          <div class="info-item">
            <label>加盟金：</label>
            <span>{{ partnerData?.franchiseFee }} </span>
          </div>
          <div class="info-item">
            <label>保證金：</label>
            <span>{{ partnerData?.deposit }} </span>
          </div>
          <div class="info-item">
            <label>優惠金額：</label>
            <span>{{ partnerData?.specialOffer }} </span>
          </div>
        </section>

        <!-- HTML 內容區塊（需要 v-html） -->
        <section class="info-section">
          <h3>品牌介紹</h3>
          <div v-html="partnerData?.brandIntro"></div>
        </section>

        <section class="info-section">
          <h3>品牌描述</h3>
          <div v-html="partnerData?.description"></div>
        </section>

        <section class="info-section">
          <h3>經營理念</h3>
          <div v-html="partnerData?.businessPhilosophy"></div>
        </section>

        <section class="info-section">
          <h3>品牌優勢</h3>
          <div v-html="partnerData?.advantages"></div>
        </section>

        <section class="info-section">
          <h3>開店條件</h3>
          <div v-html="partnerData?.storeCondition"></div>
        </section>

        <section class="info-section">
          <h3>加盟門檻</h3>
          <div v-html="partnerData?.threshold"></div>
        </section>

        <section class="info-section">
          <h3>目前規模</h3>
          <div v-html="partnerData?.currentScale"></div>
        </section>

        <section class="info-section">
          <h3>聯絡方式</h3>
          <div v-html="partnerData?.contact"></div>
        </section>

        <!-- 圖片陣列 -->
        <section class="info-section">
          <h3>產品圖片</h3>
          <div class="image-gallery">
            <img
                v-for="(img, index) in JSON.parse(partnerData?.productImages || '[]')"
                :key="index"
                :src="img"
                alt="產品圖片"
            />
          </div>
        </section>

        <section class="info-section">
          <h3>品牌形象</h3>
          <div class="image-gallery">
            <img
                v-for="(img, index) in JSON.parse(partnerData?.brandImage || '[]')"
                :key="index"
                :src="img"
                alt="品牌形象"
            />
          </div>
        </section>

        <!-- YouTube 影片 -->
        <section class="info-section">
          <h3>相關影片</h3>
          <div class="video-list">
            <div
                v-for="(url, index) in JSON.parse(partnerData?.youtubeUrls || '[]')"
                :key="index"
                class="video-item"
            >
              <a :href="url" target="_blank">影片 {{ index + 1 }}</a>
            </div>
          </div>
        </section>

        <!-- 聯絡資訊 -->
        <section class="info-section">
          <h3>網站與社群</h3>
          <div class="info-item">
            <label>官方網站：</label>
            <a :href="partnerData?.website" target="_blank">{{ partnerData?.website }}</a>
          </div>
          <div class="info-item">
            <label>Facebook：</label>
            <a :href="partnerData?.facebook" target="_blank">{{ partnerData?.facebook }}</a>
          </div>
        </section>

        <!-- 合約資訊 -->
        <section class="info-section">
          <h3>合約資訊</h3>
          <div class="info-item">
            <label>合約日期：</label>
            <span>{{ partnerData?.contractDate }}</span>
          </div>
          <div class="info-item">
            <label>合約到期日：</label>
            <span>{{ partnerData?.contractExpirationDate }}</span>
          </div>
        </section>

        <!-- 自訂欄位（最複雜的部分） -->
        <section class="info-section">
          <h3>{{ partnerData?.customContents.startup_projects?.categoryName }}</h3>
          <div
              v-html="partnerData?.customContents.startup_projects?.content"
              class="info-item"
          >
          </div>
        </section>

        <section class="info-section">
          <h3>{{ partnerData?.customContents.manufacturing_schedule?.categoryName }}</h3>
          <div
              v-html="partnerData?.customContents.manufacturing_schedule?.content"
              class="info-item"
          >
          </div>
        </section>

        <section class="info-section">
          <h3>{{ partnerData?.customContents.others?.categoryName }}</h3>
          <div
              v-html="partnerData?.customContents.others?.content"
              class="info-item"
          >
          </div>
        </section>

        <section class="info-section">
          <h3>{{ partnerData?.customContents.business_model?.categoryName }}</h3>
          <div
              v-html="partnerData?.customContents.business_model?.content"
              class="info-item"
          >
          </div>
        </section>

        <section class="info-section">
          <h3>{{ partnerData?.customContents.franchise_training?.categoryName }}</h3>
          <div
              v-html="partnerData?.customContents.franchise_training?.content"
              class="info-item"
          >
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useRouter, useRoute} from "vue-router";
import {ref, reactive, computed, onMounted, watch, nextTick} from "vue";
import SharedTabs from "@/components/shared/Shared-Tabs.vue";
import SharedDropdown from "@/components/shared/Shared-Dropdown.vue";
import {statusLabel, statusClass} from "@/utils/status";
import Step1 from "./startup-components/Step1.vue";
import Step2 from "./startup-components/Step2.vue";
import Step3 from "./startup-components/Step3.vue";
import Step4 from "./startup-components/Step4.vue";
import Step5 from "./startup-components/Step5.vue";
import Step6 from "./startup-components/Step6.vue";
import Step7 from "./startup-components/Step7.vue";
import Step8 from "./startup-components/Step8.vue";
import {useAuth} from "@/composables/useAuth.js";
import {planApi} from "@/api/modules/plan.js";
import {stepApi} from "@/api/modules/step.js";
import SharedModal from "@/components/shared/Shared-Modal.vue";
import SharedUpload from "@/components/shared/Shared-Upload.vue";
import {userCheckApi} from "@/api/modules/userCheck.js";
import SharedInput from "@/components/shared/Shared-Input.vue";
import {transactionApi} from "@/api/modules/transaction.js";
import {systemSettingApi} from "@/api/modules/systemSetting.js";

const router = useRouter();

const {isLoggedIn, currentUser, currentUserName} = useAuth();

// PDF 相關引入
import {usePdfGenerator} from "@/composables/usePDFGenerateor.js";
import {officialPartnerApi} from "@/api/modules/officialPartner.js";
import {NewAlert} from "@/composables/useAlert.js";
import {industryTypeApi} from "@/api/modules/industryType.js";

// 2. 更新解構賦值，使用新的函數
const {generateStepByStepPDF} = usePdfGenerator();
const pdfContent = ref(null);
const isGeneratingPDF = ref(false);

// 加入 PDF 相關函數

// 獲取報表文字
function getStep5ReportText() {
  const step5 = formData.step5;
  if (!step5.reportSelected) return '-';

  if (step5.reportSelected === 'other') {
    return `其他: ${step5.otherReport?.other || ''}`;
  }

  const reportOptions = [
    {value: "pos", text: "提供店內 POS 帳號並開啟營業報表權限"},
    {value: "monthly", text: "每月/季「現金流量表」，需於次月 15 日前提供"},
    {value: "season", text: "每季/年度「財務報表」，需於當季後次月 15 日前提供"},
    {value: "yearly", text: "每年度「資產負債表」，需於次年一月底前提供"}
  ];

  const option = reportOptions.find(opt => opt.value === step5.reportSelected);
  return option ? option.text : step5.reportSelected;
}


// 下載 PDF
async function handleDownloadPDF() {
  if (!pdfContent.value) {
    await NewAlert.show('注意！', 'PDF 內容尚未準備好，請洽客服人員。');
    return;
  }

  isGeneratingPDF.value = true;

  try {
    const brandName = formData.step1.brand || '創業計劃';
    const date = new Date().toLocaleDateString('zh-TW').replace(/\//g, '-');
    const filename = `${brandName}_創業計劃書_${date}.pdf`;

    // ✅ 使用 generateSectionBasedPDF，根據內容自動分頁
    const result = await generateStepByStepPDF(pdfContent.value, filename, {
      scale: 2,
      quality: 0.95,
      format: 'a4',
      orientation: 'portrait',
      margin: 10,
      sectionSelector: '.pdf-section',
      pageBreak: 'auto'
    });

    if (result.success) {
      await NewAlert.show('成功！', 'PDF 已成功生成並下載。');
    } else {
      await NewAlert.show('錯誤！', 'PDF 生成失敗，請洽客服人員。');
    }
  } catch (error) {
    console.error('PDF 生成錯誤:', error);
    await NewAlert.show('錯誤！', 'PDF 生成過程中發生錯誤，請洽客服人員。');
  } finally {
    isGeneratingPDF.value = false;
  }
}

const uploadAccount = computed(() => {
  const userName = currentUserName.value
  const planId = paymentForm.planId
  return `${userName}_${planId}`
})

const showExtendDialog = ref(false);
const extendedDate = ref('');

const extendPlanId = ref(null);

function computeExtendedDate(originalEndTime) {
  // endTime = "2025-12-31"
  const originalDate = new Date(originalEndTime);
  const extendedDate = new Date(originalDate);
  extendedDate.setMonth(extendedDate.getMonth() + 2); // 延長兩個月

  const year = extendedDate.getFullYear();
  const month = String(extendedDate.getMonth() + 1).padStart(2, '0'); // 月份從0開始
  const day = String(extendedDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function handleExtendProject(plan) {
  extendedDate.value = computeExtendedDate(plan.endTime);
  showExtendDialog.value = true;
  extendPlanId.value = plan.id;
}

async function handleExtendSubmit() {
  if (!extendPlanId.value) return;

  const response = await planApi.extendPlanDate({
    planId: extendPlanId.value,
    userId: currentUser.value,
  });

  if (response.code === 0) {
    await NewAlert.show('成功！', '專案延長成功');
    showExtendDialog.value = false;
    // 重新載入頁面或更新資料
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    await NewAlert.show('錯誤！', response.message + ' ,專案延長失敗，請洽客服人員');
  }
}

const showEndPlanDialog = ref(false);
const endPlanId = ref(null);

function handleEndProject(plan) {
  showEndPlanDialog.value = true;
  endPlanId.value = plan.id;
}

async function handleEndPlanSubmit() {
  if (!endPlanId.value) return;

  const response = await planApi.endPlan({
    planId: endPlanId.value,
    userId: currentUser.value,
  });

  if (response.code === 0) {
    await NewAlert.show('成功！', '專案結束成功');
    showEndPlanDialog.value = false;
    // 重新載入頁面或更新資料
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    await NewAlert.show('錯誤！', response.message + ' ,專案結束失敗，請洽客服人員');
  }
}


const STEPS = {
  step1: Step1,
  step2: Step2,
  step3: Step3,
  step4: Step4,
  step5: Step5,
  step6: Step6,
  step7: Step7,
  step8: Step8,
};
const docStep = ref("step1");
const currentStepComponent = computed(() => STEPS[docStep.value]);
const expandedId = ref(null);
const currentPlanId = ref(null);

async function toggle(planId) {
  console.log('點擊計畫 ID:', planId);
  expandedId.value = expandedId.value === planId ? null : planId;

  // 如果是展開,則載入該計畫資料並進入預覽模式

}

async function handleBtn1Click(planId) {
  if (expandedId.value === planId) {
    currentPlanId.value = planId;
    await loadPlanData(planId);

    await nextTick()

    // 切換到預覽模式並更新路由
    mode.value = 'preview';
    router.push({
      path: '/account/startup',
      query: {
        source: 'account',
        planId: planId,
        step: 'step1'
      }
    });
  }
}

const showPartnerDialog = ref(false);
const partnerData = ref(null);

async function handleBtn2Click(planId) {
  const getPlanFormData = {
    userId: currentUser.value,
    planId: planId
  }

  const planRes = await planApi.getPlan(getPlanFormData)
  if (planRes.code === 0) {
    const planData = planRes.data;
    const officialPartnerId = planData.brand;
    const formData = {
      officialPartnerId: officialPartnerId,
    }
    const res = await officialPartnerApi.getOfficialPartner(formData)
    if (res.code === 0) {
      console.log('官方夥伴資料:', res.data)
      partnerData.value = res.data;  // 保存資料
      showPartnerDialog.value = true;  // 顯示 dialog
    }
  }
}

// PDF 預覽功能
async function handlePDFPreviewClick(planId) {
  // 跳轉到獨立的 PDF 預覽頁面
  const routeData = router.resolve({
    name: 'StartupPDFPreview',
    params: {planId: planId}
  });

  window.open(routeData.href, '_blank');
}

async function loadPlanData(planId) {
  try {
    const requestData = {
      userId: currentUser.value,
      planId: planId,
    };

    const response = await planApi.getPlan(requestData);

    if (response.code === 0) {
      const planData = response.data;
      console.log('載入的計畫資料:', planData);

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
          {item: "店面租賃兩壓一租", amount: String(planData.storeRentCosts || '')},
          {item: "營運設備、生財器具", amount: String(planData.equipmentCosts || '')},
          {item: "開店前首批儲備物料", amount: String(planData.firstMaterialCost || '')},
          {item: "創業者預計支薪預算", amount: String(planData.paySalaryBudget || '')},
          {item: "籌備期其他人事成本", amount: String(planData.otherPersonnelCosts || '')},
          {item: "開店前品牌行銷費用", amount: String(planData.marketingExpenses || '')},
          {item: "營運週轉金及現金流", amount: String(planData.cashFlow || '')},
          {
            item: "其他（請說明）",
            amount: String(planData.otherCosts || ''),
            customTitle: planData.otherCostsTitle || "",
            editable: true
          },
          {
            item: "總計", amount: String(
                Number(planData.franchiseFee || 0) +
                Number(planData.decorationCosts || 0) +
                Number(planData.storeRentCosts || 0) +
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
            desc: "(不含稅)",
          },
        ],
        targetRevenue: String(planData.turnoverTarget || ''),
        rewardEnabled: Boolean(planData.rewardThreshold),
        rewardAmount: String(planData.rewardThreshold || ''),
        rewardPercent: String(planData.rewardPercent || ''),
        fundNote: 1,
        reportSelected: parseReportSelectedMulti(planData.otherStatement),
        otherReport: {},
      });

      function parseReportSelectedMulti(text) {
        if (!text) return {};
        
        const result = {};
        const parts = text.split(", "); 
        
        const reportOptions = formData.step5.reportOptions;
        
        parts.forEach(part => {
          // Check if it matches any standard option
          const option = reportOptions.find(opt => opt.text === part);
          if (option) {
            result[option.key] = { checked: true };
          } else if (part.startsWith("其他: ")) {
            // Handle 'other'
            const value = part.replace("其他: ", "");
            result.other = { checked: true, value: value };
          }
        });
        
        return result;
      }

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
    console.error('載入計畫資料錯誤:', error);
    await NewAlert.show('錯誤！', '載入計畫資料過程中發生錯誤，請洽客服人員。');
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

// Step4: Q9 - 解析共創者附加價值 "推薦親友來消費"
function parseCoFounderValue(text) {
  if (!text) return {value: '', note: {}};

  const valueMap = {
    '適度參與經營討論': 'operation',
    '推薦親友來消費': 'network',
    '介紹人脈行銷推廣': 'sales',
    '幫忙協尋點位': 'finance',
    '以上皆非,日常經營由創業者的團隊獨立運作。': 'independent'
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

// 返回列表
function backToList() {
  mode.value = 'account';
  currentPlanId.value = null;
  expandedId.value = null;
  router.push({
    path: '/account/startup',
    query: {source: 'account'}
  });
}


const formData = reactive({
  step1: {
    brand: "",
    budget: "",
    selfFund: "",
    totalFunding: "",
    minAmount: "",
    amountRange: "",
    partnerLimit: "",
    expectedOpeningInfo: "",
    expectedOpeningDate: "",

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
      {item: "店面租賃兩壓一租", amount: ""},
      {item: "營運設備、生財器具", amount: ""},
      {item: "開店前首批儲備物料", amount: ""},
      {item: "創業者預計支薪預算", amount: ""},
      {item: "籌備期其他人事成本", amount: ""},
      {item: "開店前品牌行銷費用", amount: ""},
      {item: "營運週轉金及現金流", amount: ""},
  {item: "其他", amount: "", customTitle: "", editable: true},  // ✅ 新增 customTitle 和 editable 標記
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
        desc: "(不含稅)",
      },
    ],
    targetRevenue: "",
    rewardAmount: "",
    rewardPercent: "",

    fundNote: "",
    reportOptions: [
      {key: "pos", text: "提供店內 POS 帳號並開啟營業報表權限"},
      {key: "monthly", text: "每月/季「現金流量表」，需於次月 15 日前提供"},
      {
        key: "season",
        text: "每季/年度「財務報表」，需於當季後次月 15 日前提供",
      },
      {key: "yearly", text: "每年度「資產負債表」，需於次年一月底前提供"},
      {text: "其他", key: "other", withInput: true},
    ],
    reportSelected: {},
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
  step8: {agree: ""},
});

const formErrors = reactive({
  step1: {
    brand: "",
    budget: "",
    selfFund: "",
    totalFunding: "",
    minAmount: "",
    amountRange: "",
    partnerLimit: "",
  },
  step2: {file: ""},
  step3: {hasStartupExp: ""},
  step4: {
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5Total: "",
    q5Channels: "",
    q6: "",
    q7: "",
    q8Location: "",
    q9Location: "",
  },
  step5: {
    prepBudget: "",
    targetRevenue: "",
    costStruct: "",
    fundNote: "",
    reportSelected: "",
  },
  step6: {
    sharePeriod: "",
    shareCalc: "",
    sharePay: "",
    agree: "",
  },
  step8: {agree: ""},
});

function goNext(nextStep) {
  if (Object.keys(STEPS).includes(nextStep)) {
    docStep.value = nextStep;

    const query = {...route.query, step: nextStep};
    router.replace({query});
  }
}

const route = useRoute();
const activeTab = ref("progress");
const mode = ref("account");

const docTitle = computed(() => {
  if (docStep.value === "step1") return "創業基本資料";
  if (docStep.value === "step7") return "提交與後續";
  if (docStep.value === "step8") return "創業風險提示與責任聲明";
  return "創業計劃書";
});

function setDocStep(step) {
  if (!Object.keys(STEPS).includes(step)) return;
  docStep.value = step;
  router.replace({query: {...route.query, step}});
}

onMounted(() => {
  const qStep = (route.query.step || "").toString();
  if (Object.keys(STEPS).includes(qStep)) {
    docStep.value = qStep;
  } else {
    setDocStep("step1");
  }
});

watch(
    () => route.query.step,
    (val) => {
      const qStep = (val || "").toString();
      if (Object.keys(STEPS).includes(qStep) && qStep !== docStep.value) {
        docStep.value = qStep;
      }
    }
);

watch(
    () => route.query.source,
    (val) => {
      mode.value = val === "business" ? "business" : "account";
    },
    {immediate: true}
);

watch(
    () => route.query,
    async (query) => {
      // 判斷模式
      if (query.source === 'account' && query.planId) {
        currentPlanId.value = parseInt(query.planId);

        // ✅ 檢查 URL 中的 mode 參數
        if (query.mode === 'pdf-preview') {
          mode.value = 'pdf-preview';
        } else {
          mode.value = 'preview';
        }

        // 如果有 planId,載入資料
        if (currentPlanId.value && !formData.step1.brand) {
          await loadPlanData(currentPlanId.value);
          await nextTick()
        }
      } else if (query.source === 'account') {
        mode.value = 'account';
        currentPlanId.value = null;
      } else if (query.source === 'business') {
        mode.value = 'business';
      }

      // 處理 step
      const qStep = (query.step || '').toString();
      if (Object.keys(STEPS).includes(qStep) && qStep !== docStep.value) {
        docStep.value = qStep;
      }
    },
    {immediate: true}
);

const progress = ref([]);
const records = reactive([
  {
    id: "rec-1",
    date: "2024-12-03",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    action: "初次投入",
    status: "成功",
  },
  {
    id: "rec-2",
    date: "2024-11-28",
    title: "專案名稱專案名稱專案名稱專案名稱專案名稱",
    action: "追加投入",
    status: "處理中",
  },
]);

const recFilter = reactive({
  timeOrder: "",
  action: "",
  status: "",
  export: "",
});

const displayedRecords = computed(() => {
  let list = [...records];
  if (recFilter.action)
    list = list.filter((r) => r.action === recFilter.action);
  if (recFilter.status)
    list = list.filter((r) => r.status === recFilter.status);
  if (recFilter.timeOrder) {
    list.sort((a, b) =>
        recFilter.timeOrder === "asc"
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date)
    );
  }
  return list;
});

function convertFormData(formData, userId) {
  // 字串轉布林值
  function stringToBool(value) {
    return value === "yes" || value === "agree" || value === true;
  }


  // 從 prepBudget 陣列中提取特定項目的金額
  function getBudgetAmount(prepBudget, itemName) {
    const item = prepBudget.find(budget => budget.item === itemName);
    return item ? parseInt(item.amount) || 0 : 0;
  }

  // 從 costStruct 陣列中提取百分比
  function getCostPercent(costStruct, itemName) {
    const item = costStruct.find(cost => cost.item === itemName);
    return item ? parseFloat(item.percent) || 0 : 0;
  }

  function getCostAmount(costStruct, itemName) {
    const item = costStruct.find(cost => cost.item === itemName);
    return item ? parseFloat(item.amount) || 0 : 0;
  }

  function getCostRemark(costStruct, itemName) {
    const item = costStruct.find(cost => cost.item === itemName);
    return item ? (item.note) || "" : "";
  }

  function getReportText(step5) {
    if (!step5.reportSelected) return "";

    // 如果選擇的是 "other"，返回自訂輸入的內容
    if (!step5.reportSelected) return "";

    const result = [];
    // Iterate over reportOptions to maintain order and get text
    step5.reportOptions.forEach(option => {
      const key = option.key;
      const selection = step5.reportSelected[key];
      
      if (selection && selection.checked) {
        if (key === 'other') {
          // For 'other', get the custom value
          const customText = selection.value || "";
          result.push(`其他: ${customText}`);
        } else {
          result.push(option.text);
        }
      }
    });

    return result.join(", ");
  }

  // Q2: 處理 briefingSession - 返回 "是/否 (值)"
  function getBriefingSessionText(q2) {
    if (!q2) return "";

    if (q2.yes?.checked) {
      return `是 (${q2.yes.value || ""})`;
    } else if (q2.plan?.checked) {
      return `否 (${q2.plan.value || ""})`;
    }
    return "";
  }

  // Q4: 處理 recruitmentMethods - 返回 "key: value" 格式
  function getRecruitmentMethodsText(q4) {
    if (!q4) return "";

    // 對應的文字描述
    const recruitmentMapping = {
      'founder': '本人親自參與經營',
      'family': '邀約親友加入',
      'recruit': '另行招募',
      'other': '其他'
    };

    const result = [];
    for (const [key, value] of Object.entries(q4)) {
      if (value.checked) {
        const text = recruitmentMapping[key] || key;
        if (value.value) {
          result.push(`${text}: ${value.value}`);
        } else {
          result.push(text);
        }
      }
    }
    return result.join(", ");
  }

  // Q5.channels: 轉換為對應的 text
  function getChannelsText(channels) {
    if (!channels) return "";

    const channelMapping = {
      'jobBank': '人力銀行',
      'social': '社群平台',
      'referral': '親友介紹',
      'poster': '門店張貼',
      'other': '其他'
    };

    const result = [];
    for (const [key, value] of Object.entries(channels)) {
      if (value.checked) {
        const text = channelMapping[key] || key;
        if (key === 'other' && value.value) {
          result.push(`${text}: ${value.value}`);
        } else {
          result.push(text);
        }
      }
    }
    return result.join(", ");
  }

  // Q6: 處理時間 - 返回 "text from-to" 格式
  function getTimeText(q6) {
    if (!q6) return "";

    const timeMapping = {
      'fulltime': '全職投入並同步參與經營',
      'parttime': '全職投入但隨機參與經營',
      'other': '其他'
    };

    for (const [key, value] of Object.entries(q6)) {
      if (value.checked) {
        const text = timeMapping[key] || key;
        if (key === 'other' && value.value) {
          return `${text}: ${value.value}`;
        } else if (value.from && value.to) {
          return `${text} ${value.from}-${value.to}`;
        }
        return text;
      }
    }
    return "";
  }

  // Q7: 轉換客戶來源為 text
  function getCustomerSourceText(q7) {
    if (!q7) return "";

    const sourceMapping = {
      'social': '親友推薦',
      'passenger': '過路散客',
      'business': '商圈經營',
      'web': '網路口碑',
      'other': '其他'
    };

    const result = [];
    for (const [key, value] of Object.entries(q7)) {
      if (value.checked) {
        const text = sourceMapping[key] || key;
        if (key === 'other' && value.value) {
          result.push(`${text}: ${value.value}`);
        } else {
          result.push(text);
        }
      }
    }
    return result.join(", ");
  }

  // Q8: 轉換門市地點為 text
  function getLocationTypeText(location, locationNote) {
    const locationMapping = {
      'core': '核心商圈',
      'residential': '住家型商圈',
      'office': '辦公型商圈',
      'school': '學校周邊',
      'mall': '百貨商場',
      'other': '其他'
    };

    const text = locationMapping[location] || location || "";

    // 如果是 "其他" 且有額外說明
    if (location === 'other' && locationNote?.other) {
      return `${text}: ${locationNote.other}`;
    }

    return text;
  }

  // Q9: 轉換共創者附加價值為 text
  function getCoFounderValueText(value, valueNote) {
    const valueMapping = {
      'operation': '適度參與經營討論',
      'network': '推薦親友來消費',
      'sales': '介紹人脈行銷推廣',
      'finance': '幫忙協尋點位',
      'independent': '以上皆非,日常經營由創業者的團隊獨立運作。',
      'other': '其他'
    };

    const text = valueMapping[value] || value || "";

    // 如果是 "其他" 且有額外說明
    if (value === 'other' && valueNote?.other) {
      return `${text}: ${valueNote.other}`;
    }

    return text;
  }

  // 處理分潤週期 - 返回對應的 text
  function getProfitCycleText(value) {
    const cycleMapping = {
      'monthly': '每月結算並分潤一次(每一個月)',
      'quarterly': '每季結算並分潤一次(每三個月)',
      'halfyear': '每半年結算並分潤一次(每六個月)',
      'yearly': '每年結算並分潤一次(每十二個月)'
    };

    return cycleMapping[value] || value || "";
  }

  // 處理分潤計算方式 - 返回對應的 text，特別處理 "其他"
  function getProfitCalcText(value, otherData) {
    if (value === "other") {
      // 處理多種可能的資料結構
      const otherText = otherData?.withInputText || otherData?.other || "";
      return `其他: ${otherText}`;
    }

    if (value === "agree") {
      return "同意依照【共同創業者】出資占比計算淨利分潤(例如:出資 20 萬/總投資 100 萬 = 分潤 20%)";
    }

    return value || "";
  }

  // 處理分潤支付方式 - 返回對應的 text，特別處理 "其他"
  function getProfitPayText(value, otherData) {
    if (value === "other") {
      // 處理多種可能的資料結構
      const otherText = otherData?.withInputText || otherData?.other || "";
      return `其他: ${otherText}`;
    }

    if (value === "bank") {
      return "銀行匯款至指定帳戶(需提供匯款憑證備查)";
    }

    return value || "";
  }


  const step1 = formData.step1;
  const step3 = formData.step3;
  const step4 = formData.step4;
  const step5 = formData.step5;
  const step6 = formData.step6;

  return {
    userId: userId,
    views: 0, // 初始值

    // 基本資料 (Step1)
    startupBudget: parseInt(step1.budget) || 0,
    selfPreparedFunds: parseInt(step1.selfFund) || 0,
    totalAmount: parseInt(step1.totalFunding) || 0,
    minimumAmount: parseInt(step1.minAmount) || 0,
    amountRange: parseInt(step1.amountRange) || 0,
    limitPartner: parseInt(step1.partnerLimit) || 0,
    expectedOpeningInfo: step1.expectedOpeningInfo || "",
    expectedOpeningDate: step1.expectedOpeningDate || "",
    brand: parseInt(step1.brand) || 0,

    // 創業經驗 (Step3)
    hasExperience: stringToBool(step3.hasStartupExp),
    experienceDetails: step3.expDesc || "",
    financialConstraints: stringToBool(step3.hasDispute),
    constraintsExplanation: step3.disputeDesc || "",
    advantageExplanation: step3.selfAdv || "",
    availableResources: step3.resources || "",
    otherResources: step3.otherResources || "",
    supportDocumentation: stringToBool(step3.willingDocs),

    // 創業計畫 (Step4)
    innovationDescription: step4.q1,
    // radio + 字串
    briefingSession: getBriefingSessionText(step4.q2) || "",
    nextStagePlan: step4.q3 || "",
    // 複選 + 字串
    recruitmentMethods: getRecruitmentMethodsText(step4.q4) || "",
    // 招聘人數
    expectedNumberPeople: parseInt(step4.q5.total?.value) || 0,
    // 渠道
    recruitmentPipeline: getChannelsText(step4.q5.channels),
    // text + q6
    investTime: getTimeText(step4.q6) || "",
    // 客源
    customerSource: getCustomerSourceText(step4.q7) || "",
    // 門市屬性
    storeLocationType: getLocationTypeText(step4.q8Location, step4.q8LocationNote) || "",
    // 共創者附加價值
    coFounderAddedValue: getCoFounderValueText(step4.q9Location, step4.q9LocationNote) || "",

    // 財務規劃 (Step5) - 預算項目
    franchiseFee: getBudgetAmount(step5.prepBudget, "品牌加盟的相關費用"),
    decorationCosts: getBudgetAmount(step5.prepBudget, "店面的裝潢設計工程"),
    storeRentCosts: getBudgetAmount(step5.prepBudget, "店面租賃兩壓一租"),
    equipmentCosts: getBudgetAmount(step5.prepBudget, "營運設備、生財器具"),
    firstMaterialCost: getBudgetAmount(step5.prepBudget, "開店前首批儲備物料"),
    paySalaryBudget: getBudgetAmount(step5.prepBudget, "創業者預計支薪預算"),
    otherPersonnelCosts: getBudgetAmount(step5.prepBudget, "籌備期其他人事成本"),
    marketingExpenses: getBudgetAmount(step5.prepBudget, "開店前品牌行銷費用"),
    cashFlow: getBudgetAmount(step5.prepBudget, "營運週轉金及現金流"),
    // ✅ 從可編輯項目中提取「其他」費用和標題
otherCosts: (() => {
  const otherItem = step5.prepBudget.find(item => item.editable);
  return otherItem ? parseInt(otherItem.amount) || 0 : 0;
})(),
otherCostsTitle: (() => {
  const otherItem = step5.prepBudget.find(item => item.editable);
  return otherItem?.customTitle || "";
})(),

    // 財務規劃 (Step5) - 營業目標和成本結構
    turnoverTarget: parseInt(step5.targetRevenue) || 0,
    firstMaterialCostsPercent: getCostPercent(step5.costStruct, "物料成本"),
    firstMaterialCostsAmount: getCostAmount(step5.costStruct, "物料成本"),
    firstMaterialCostsRemark: getCostRemark(step5.costStruct, "物料成本"),
    personnelCostsPercent: getCostPercent(step5.costStruct, "人事成本"),
    personnelCostsAmount: getCostAmount(step5.costStruct, "人事成本"),
    personnelCostsRemark: getCostRemark(step5.costStruct, "人事成本"),
    rentalCostsPercent: getCostPercent(step5.costStruct, "租金成本"),
    rentalCostsAmount: getCostAmount(step5.costStruct, "租金成本"),
    rentalCostsRemark: getCostRemark(step5.costStruct, "租金成本"),
    peratingCostsPercent: getCostPercent(step5.costStruct, "經營管理成本"),
    peratingCostsAmount: getCostAmount(step5.costStruct, "經營管理成本"),
    peratingCostsRemark: getCostRemark(step5.costStruct, "經營管理成本"),
    otherCostsPercent: getCostPercent(step5.costStruct, "淨利"),
    otherCostsAmount: getCostAmount(step5.costStruct, "淨利"),
    otherCostsRemark: getCostRemark(step5.costStruct, "淨利"),

    rewardThreshold: parseInt(step5.rewardAmount) || 0,
    rewardPercent: parseFloat(step5.rewardPercent) || 0,
    otherStatement: getReportText(step5),

    // 合作條件 (Step6)
    profitDistributionCycle: getProfitCycleText(step6.sharePeriod),
    profitCalculationMethod: getProfitCalcText(step6.shareCalc, step6.shareCalcOther),
    profitPaymentMethod: getProfitPayText(step6.sharePay, step6.sharePayOther)
  };
}

async function createPlan() {
  const data = convertFormData(formData, currentUser.value);

  let response;

  // 判斷是編輯還是新建
  if (isEditMode.value && editPlanId.value) {
    // 更新現有計劃
    response = await planApi.updatePlan({
      ...data,
      planId: editPlanId.value
    });
  } else {
    // 新建計劃
    response = await planApi.createPlan(data);

  }

  if (response.code === 0) {
    if (!isEditMode.value) {

      // 前往個人頁面上傳文件
      const result = await NewAlert.confirm("創業計劃書提交成功", "請前往「個人專區」上傳相關文件。")
      if (result) {
        await router.push({path: "/account/profile"});
      }
    } else {
      // 編輯模式下的提示
      await NewAlert.show("創業計劃書更新成功！", "您的創業計劃書已成功更新。");
    }

    // 重置編輯狀態
    isEditMode.value = false;
    editPlanId.value = null;

    await router.push("/account/startup");
    await getAllPlanByUser();
  } else {
    await NewAlert.show("操作失敗，請洽客服人員。");
  }
}

const userPlanStepData = ref([])

async function getAllPlanStep() {
  const formData = {
    userId: currentUser.value,
  }
  const response = await stepApi.getAllPlanStep(formData)
  userPlanStepData.value = response.data
}

const systemSettingData = ref({})

const founderSignUrl = computed(() => {
  const setting = systemSettingData.value.find(item => item.type === 'founder_sign_url')
  return setting ? setting.value : ''
})

const bankInfo = computed(() => {
  // 把 array 轉成 object
  const settingsObject = systemSettingData.value.reduce((acc, item) => {
    acc[item.type] = item.value
    return acc
  }, {})

  return {
    bankCode: settingsObject.bank_code || '',
    bankAccount: settingsObject.bank_account || '',
    bankAccountName: settingsObject.bank_account_name || '',
    bankName: settingsObject.bank_name || ''
  }
})

async function getSystemSetting() {
  const formData = {
    userId: currentUser.value,
  }
  const res = await systemSettingApi.getSystemSetting(formData)
  if (res.code === 0) {
    systemSettingData.value = res.data
    console.log(systemSettingData.value)
  }
}

async function getAllPlanByUser() {
  const formData = {
    userId: currentUser.value,
  }
  const response = await planApi.getAllPlanByUser(formData)
  console.log(response)

  if (response.code === 0) {
    if (!response.data || response.data.length === 0) {
      progress.value = []
      return
    }

    progress.value = response.data.map(plan => ({
      id: plan.planId,
      status: plan.currentStep,
      title: plan.planName,
      progressStep: changeProgressStep(plan.currentStep),
      serviceCharge: plan.serviceCharge,
      stateText: userPlanStepData.value.find(step => step.id === plan.currentStep)?.userStep || "無進度",
      remark: plan.remark || '',
      endTime: plan.endTime || null,
      paymentStatus: plan.paymentStatus || 0,
      contractStatus: plan.contractStatus || 0,
      companyStatus: plan.companyStatus || 0,
    }))
  } else {
    await NewAlert.show("注意！", response.message + " ,取得創業計劃列表失敗，請洽客服人員。");
    return;
  }
}

// 判斷是否在結束日期前一週內
const isWithinOneWeekBeforeEnd = (endTime) => {
  if (!endTime) return false

  const today = new Date()
  const endDate = new Date(endTime)

  // 計算一週前的日期
  const oneWeekBefore = new Date(endDate)
  oneWeekBefore.setDate(endDate.getDate() - 7)

  // 判斷今天是否在「一週前」和「結束日期」之間
  return today >= oneWeekBefore && today <= endDate
}


// Dialog 顯示狀態
const showReleaseChargeDialog = ref(false);
const showSignContractDialog = ref(false);
const showPaymentDialog = ref(false);
const showCompanyDialog = ref(false);

// 表單資料
const paymentForm = reactive({
  planId: null,
  userId: null,
  accountLast5: '',
  amount: 0,
  contractFile: null,
  paymentProof: null,
  contractFileName: '',
  paymentProofName: '',

});

const companyForm = reactive({
  // 公司資料
  companyName: '',
  companyNameEn: '',
  businessId: '',
  companyLogo: '',
  companyLogoId: '',
  slogan: '',
  bankAccountName: '',
  bankAccountNumber: '',
  profile: '',
  info: '',
  officialUrl: '',
  facebookUrl: '',
  instagramUrl: '',
})

const contractForm = reactive({
  id: null,
  displayName: '',
  salesContractUrl: ''
});

// 錯誤訊息
const paymentErrors = reactive({
  contractFile: '',
  paymentProof: '',
  accountLast5: '',

});

// 格式化金額
function formatAmount(amount) {
  return amount?.toLocaleString('zh-TW') || '0';
}

// Dialog 狀態
const showContractConfirmDialog = ref(false)
const contractAgreed = ref(false)
const contractErrors = ref({})
const currentPlan = ref(null)

// 打開確認 Dialog
function openContractConfirmDialog(plan) {
  currentPlan.value = plan
  contractAgreed.value = false
  contractErrors.value = {}
  showContractConfirmDialog.value = true
}

// 新增一個 ref 來追蹤是否為編輯模式
const isEditMode = ref(false);
const editPlanId = ref(null);

// 處理按鈕點擊，打開 Dialog
async function handleButtonClick(plan) {
  // 設置表單資料
  paymentForm.planId = plan.id;
  paymentForm.userId = currentUser.value;
  paymentForm.amount = plan.serviceCharge;
  paymentForm.contractFile = 0;
  paymentForm.contractFileName = '';
  paymentForm.paymentProof = 0;
  paymentForm.paymentProofName = ''

  // 清空錯誤訊息
  paymentErrors.contractFile = '';
  paymentErrors.paymentProof = '';
  paymentErrors.accountLast5 = '';

  if (plan.status < 0 || plan.status === 2) {
    // 1. 設定編輯模式
    isEditMode.value = true;
    editPlanId.value = plan.id;

    // 2. 載入該計劃的資料
    await loadPlanData(plan.id);

    // 3. 設定為編輯模式
    mode.value = 'business';

    // 4. 跳轉到第一步
    docStep.value = 'step1';

    // 5. 更新路由
    router.push({
      path: '/account/startup',
      query: {
        source: 'business',
        planId: plan.id,
        step: 'step1',
        edit: 'true' // 標記為編輯模式
      }
    });

    return;
  }

  if (plan.status === 7) {
    openContractConfirmDialog(plan)
  }
  if (plan.status === 12) {
    showPaymentDialog.value = true;
    return;
  }
}

async function handleCompanyButtonClick(plan) {
  currentPlan.value = plan
  showCompanyDialog.value = true;
}

async function handleCompanySubmit() {
  console.log(companyForm)
  const formData = {
    userId: currentUser.value,
    planId: currentPlan.value.id,
    companyName: companyForm.companyName,
    companyNameEn: companyForm.companyNameEn,
    businessId: companyForm.businessId,
    companyLogo: companyForm.companyLogo.id,
    slogan: companyForm.slogan,
    bankAccountName: companyForm.bankAccountName,
    bankAccountNumber: companyForm.bankAccountNumber,
    profile: companyForm.profile,
    info: companyForm.info,
    officialUrl: companyForm.officialUrl,
    facebookUrl: companyForm.facebookUrl,
    instagramUrl: companyForm.instagramUrl,
  }

  const response = await userCheckApi.updateCompanyInfoByUser(formData)
  if (response.code === 0) {
    await NewAlert.show('成功', '公司資料提交成功');
    await getAllPlanByUser()
  } else {
    await NewAlert.show('失敗', response.message + ',提交失敗，請洽客服人員。');
  }
  showCompanyDialog.value = false;
}

async function handleUploadData(plan) {
  paymentForm.planId = plan.id;
  paymentForm.userId = currentUser.value;
  paymentForm.amount = plan.serviceCharge;

  paymentErrors.contractFile = '';
  paymentErrors.paymentProof = '';
  paymentErrors.accountLast5 = '';

  showReleaseChargeDialog.value = true;
}

async function handleSignContract(plan) {
  const signUrl = founderSignUrl.value;

  if (!signUrl) {
    await NewAlert.show("注意！", "系統尚未設定合約簽署連結，請聯繫管理員。");
    return;
  }

  window.open(signUrl, '_blank');

  const formData = {
    planId: plan.id,
    userId: currentUser.value,
  };

  const res = await userCheckApi.signContractByUser(formData);
  if (res.code === 0) {
    await getAllPlanByUser();
  } else {
    await NewAlert.show("注意！", res.message + " ,取得合約資料失敗，請洽客服人員。");
  }
}

async function handleContractConfirm() {
  // 驗證是否勾選
  if (!contractAgreed.value) {
    contractErrors.value = {
      agreement: '請勾選同意條款'
    }
    return
  }

  // 清除錯誤
  contractErrors.value = {}

  // 提交合約
  const formData = {
    planId: currentPlan.value.id,
    userId: currentUser.value,
  }

  try {
    const res = await userCheckApi.signContractSubmitByUser(formData)
    if (res.code === 0) {
      await NewAlert.show('合約提交成功！', '您的合約已成功提交。')
      showContractConfirmDialog.value = false
      await getAllPlanByUser()
    } else {
      await NewAlert.show('注意！', res.message + ' ,合約提交失敗，請洽客服人員。')
    }
  } catch (error) {
    console.error('提交合約失敗:', error)
    await NewAlert.show('注意！', '合約提交失敗，請洽客服人員。')
  }
}

async function handleContractCancel() {
  showContractConfirmDialog.value = false
}

// 驗證表單

function validateReleaseChargePaymentForm() {
  let isValid = true;

  if (!paymentForm.paymentProof) {
    paymentErrors.paymentProof = '請上傳付款憑證';
    isValid = false;
  } else {
    paymentErrors.paymentProof = '';
  }

  if (!paymentForm.accountLast5 || !/^\d{5}$/.test(paymentForm.accountLast5)) {
    paymentErrors.accountLast5 = '請輸入正確的帳戶後五碼';
    isValid = false;
  } else {
    paymentErrors.accountLast5 = '';
  }

  return isValid;
}

function validatePaymentForm() {
  let isValid = true;

  if (!paymentForm.contractFile) {
    paymentErrors.contractFile = '請上傳合約';
    isValid = false;
  } else {
    paymentErrors.contractFile = '';
  }

  if (!paymentForm.paymentProof) {
    paymentErrors.paymentProof = '請上傳付款憑證';
    isValid = false;
  } else {
    paymentErrors.paymentProof = '';
  }

  if (!paymentForm.accountLast5 || !/^\d{5}$/.test(paymentForm.accountLast5)) {
    paymentErrors.accountLast5 = '請輸入正確的帳戶後五碼';
    isValid = false;
  } else {
    paymentErrors.accountLast5 = '';
  }

  return isValid;
}

async function handleReleaseChargeSubmit() {
  if (!validateReleaseChargePaymentForm()) {
    return;
  }
  const formData = {
    planId: paymentForm.planId,
    userId: paymentForm.userId,
    accountLast5: paymentForm.accountLast5,
    amount: 3500,
    paymentProof: paymentForm.paymentProof
  }

  const response = await userCheckApi.createReleaseChargeInfoByUser(formData)

  if (response.code === 0) {
    await NewAlert.show('成功', '上傳成功');
    showReleaseChargeDialog.value = false;
    await getAllPlanByUser()
  } else {
    await NewAlert.show('失敗', response.message + ',上傳失敗，請洽客服人員。');
  }
}

// 提交表單
async function handleContractPaymentSubmit() {
  console.log(paymentForm)
  if (!validatePaymentForm()) {
    return;
  }

  try {
    const formData = {
      planId: paymentForm.planId,
      userId: paymentForm.userId,
      accountLast5: paymentForm.accountLast5,
      amount: paymentForm.amount,
      contractFile: paymentForm.contractFile,
      paymentProof: paymentForm.paymentProof
    }

    console.log(formData)
    // 調用你的 API
    const response = await userCheckApi.createContractPaymentInfoByUser(formData);
    // console.log(response)

    if (response.code === 0) {
      await NewAlert.show('成功', '上傳成功');
      showPaymentDialog.value = false;
      await getAllPlanByUser()
    } else {
      await NewAlert.show('失敗', response.message + ' ,上傳失敗，請洽客服人員。');
    }
  } catch (error) {
    console.error('上傳失敗:', error);
    await NewAlert.show('失敗', '上傳失敗，請洽客服人員。');
  }
}

function changeProgressStep(currentStep) {
  // 申請中
  if (currentStep < 3) {
    return 1
  }

  // 審核中
  if (currentStep >= 3 && currentStep < 4) {
    return 2
  }

  // 上架費用 + 上傳合約資料
  if (currentStep >= 4 && currentStep < 7) {
    return 3
  }

  // 審核中
  if (currentStep >= 7 && currentStep < 10) {
    return 4
  }

  // 準備上架
  if (currentStep >= 10 && currentStep < 14) {
    return 5
  }

  if (currentStep >= 14 && currentStep < 17) {
    return 6
  }

  if (currentStep >= 17 && currentStep < 22) {
    return 7
  }

  if (currentStep >= 22) {
    return 8
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    getAllPlanStep();
    getAllPlanByUser();
    getSystemSetting();
    getIndustryTypes();
  }

  // 檢查初始路由
  const {source, planId, step} = route.query;

  if (source === 'account' && planId) {
    mode.value = 'preview';
    currentPlanId.value = parseInt(planId);
    loadPlanData(currentPlanId.value);
  } else if (source === 'account') {
    mode.value = 'account';
  } else if (source === 'business') {
    mode.value = 'business';
  }

  if (step && Object.keys(STEPS).includes(step)) {
    docStep.value = step;
  } else {
    setDocStep('step1');
  }
});

function handleUploadSuccess(fileType, result) {
  const fileId = result.data?.id;
  const fileName = result.data?.displayName || result.data?.name;
  console.log(result)
  if (fileId) {
    if (fileType === 'planFinalContract') {
      paymentForm.contractFile = fileId;
      paymentForm.contractFileName = fileName;
    } else if (fileType === 'userPaymentProofFile') {
      paymentForm.paymentProof = fileId;
      paymentForm.paymentProofName = fileName;
    } else if (fileType === 'companyLogo') {
      paymentForm.companyLogoId = fileId;
      paymentForm.companyLogo = fileName;
    }
  }
}


watch(activeTab, (newTab) => {
  if (newTab === 'detail' && isLoggedIn.value) {
    getTransactionByUser()
  }
});

const transactionsData = ref([]);

async function getTransactionByUser() {
  const formData = {
    userId: currentUser.value,
  }
  const response = await transactionApi.getTransactionByUser(formData)

  if (response.code === 0) {
    // 清空原有資料
    records.splice(0, records.length)

    // 處理並填入新資料
    if (!response.data || response.data.length === 0) {
      console.log('沒有交易記錄')
      return
    }

    const processedData = response.data.map(record => ({
      id: `rec-${record.id}`,
      date: record.date,
      title: record.planName,
      action: actionMap[record.action] || '未知操作',
      status: statusMap[record.status] || '未知狀態'
    }))

    // 填入新資料
    records.push(...processedData)

    console.log('處理後的交易記錄:', records)
  } else {
    await NewAlert.show("注意！", response.message + " ,取得交易紀錄失敗，請洽客服人員。")
  }

}

// 對應表
const actionMap = {
  1: '初次投入',
  2: '追加投入',
  3: '退出'
}

const statusMap = {
  1: '處理中',
  2: '成功',
  3: '失敗'
}

const industryTypesData = ref([]);
async function getIndustryTypes() {
  const res = await industryTypeApi.getIndustryTypes();
  if (res && res.data) {
    industryTypesData.value = res.data;
  }
}

</script>

<style lang="scss" scoped>
.apply {
  width: 380px;
  @media (max-width: 576px) {
    width: 100%;
  }
}

.card {
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
}

.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 999px;
  font-weight: 400;
  font-size: $fs-14;
  line-height: 17px;

  &.applying {
    background: $btn-yellow;
    color: $white;
  }
}

.title {
  color: $text-deep;
  font-weight: $fw-500;
  font-size: $fs-16;
  line-height: $lh-19;
}

.steps-wrap {
  position: relative;
  background: #fff;
  margin-bottom: 2px;
  width: 80%;
  @media (max-width: 576px) {
    width: 100%;
  }
}

.steps-bar {
  display: flex;
  gap: 6px;
  margin-top: 8px;

  .steps-step {
    flex: 1;
    height: 20px;
    background-color: $gray;
    border-radius: 5px;
    @media (max-width: 576px) {
      height: 10px;
    }

    &.active {
      background-color: $btn-yellow;
    }
  }
}

.steps-footer {
  display: flex;
  justify-content: space-between;
  @media (max-width: 576px) {
    display: grid;
    gap: 5px;
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

.btn-upload {
  background: #ff6634;
  color: #fff;
  border: none;
  border-radius: 8px;
  margin-top: 5px;
  width: 100%;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #ff7f50;
  }

  // 新增 disabled 狀態樣式
  &:disabled {
    background: #cccccc;
    color: #666666;
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background: #cccccc; // 禁用時 hover 不改變顏色
    }
  }
}

.btn-expand {
  background: #34b1ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  margin-top: 5px;
  width: 100%;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #ff7f50;
  }
}

.btn-end {
  background: #939393;
  color: #fff;
  border: none;
  border-radius: 8px;
  margin-top: 5px;
  width: 100%;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #ff7f50;
  }
}

hr {
  border: 1px solid #dfdfdf;
}

.payment-form {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  max-width: 600px;
  margin: 0 auto;
  font-family: "Noto Sans TC", sans-serif;
}

.payment-form .form-group {
  margin-bottom: 20px;
}

.payment-form label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 16px;
  color: #333;
}

.readonly-field {
  background-color: #f7f9fc;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #1a202c;
  font-size: 15px;
  line-height: 1.7;
}

.readonly-field br {
  margin-bottom: 8px;
}

.p-510 {
  width: 100%;
}

/* 匯款資訊分隔線 & 強調 */
.payment-form .readonly-field {
  border-left: 4px solid #FF7F50FF;
}

/* Button or Upload CTA 我預留，可加在下方 */
.payment-form button,
.payment-form .submit-btn {
  width: 100%;
  padding: 14px;
  background: #4a90e2;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.payment-form button:hover {
  background: #357abd;
}

/* RWD 手機優化 */
@media (max-width: 480px) {
  .payment-form {
    padding: 16px;
  }
  .readonly-field {
    font-size: 14px;
  }
}

.confirm-question {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 2px dashed #dee2e6;
}

.contract-confirm-content {
  padding: 20px 0;

  .agreement-checkbox {
    margin-bottom: 24px;

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 12px;
      border-radius: 8px;
      transition: background 0.2s;

      &:hover {
        background: #f8f9fa;
      }

      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: #1e90ff;
      }

      .checkbox-text {
        font-size: 15px;
        color: #333;
        font-weight: 500;
      }
    }

    .error-message {
      color: #dc3545;
      font-size: 14px;
      margin-top: 8px;
      margin-left: 32px;
    }
  }
}


.pdf-content {
  background: #fff;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;

  /* ✅ 關鍵：設定行高和字體大小，避免分頁時文字被切斷 */
  line-height: 1.6;
  font-size: 14px;

  @media (max-width: 768px) {
    padding: 20px;
  }
}

.pdf-page {
  max-width: 800px;
  margin: 0 auto;

  /* ✅ 設定最小高度，確保內容有足夠空間 */
  min-height: 1000px;
}

.pdf-title {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 0;
  border-bottom: 3px solid #ffcc41;

  /* ✅ 標題頁後強制分頁 */
  page-break-after: always;
  break-after: page;

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #333;
    margin-bottom: 16px;
    line-height: 1.4;
  }

  .pdf-meta {
    font-size: 14px;
    color: #666;
    line-height: 1.8;

    p {
      margin: 8px 0;
    }
  }
}

.pdf-section {
  /* ✅ 增加底部邊距，避免內容緊貼頁面底部 */
  margin-bottom: 60px;
  padding-bottom: 20px;

  /* ✅ 防止 section 被切斷 */
  page-break-inside: avoid;
  break-inside: avoid;

  /* ✅ 可選：每個 section 強制從新頁開始 */
  /* 取消註解下面這行可以啟用 */
  /* page-break-before: always; */
  /* break-before: page; */

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e9ece8;
    line-height: 1.4;

    /* ✅ 標題後不要分頁 */
    page-break-after: avoid;
    break-after: avoid;

    /* ✅ 確保標題和下一個元素不分開 */
    orphans: 3;
    widows: 3;
  }

  /* ✅ section 內的段落樣式 */
  p {
    margin-bottom: 4px;
    line-height: 1.2;

    /* ✅ 防止段落被切斷 */
    page-break-inside: avoid;
    break-inside: avoid;

    /* ✅ 控制孤行和寡行 */
    orphans: 2;
    widows: 2;
  }

  /* ✅ 列表樣式 */
  ul, ol {
    margin-bottom: 8px;
    padding-left: 24px;

    li {
      margin-bottom: 8px;
      line-height: 1.6;
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }

  /* ✅ 表格樣式 */
  table {
    width: 100%;
    margin-bottom: 12px;
    border-collapse: collapse;

    /* ✅ 防止表格被切斷 */
    page-break-inside: avoid;
    break-inside: avoid;

    th, td {
      padding: 12px;
      border: 1px solid #ddd;
      text-align: left;
      line-height: 1.5;
    }

    th {
      background-color: #f5f5f5;
      font-weight: 600;
    }
  }

  /* ✅ 輸入框和表單元素（唯讀模式） */
  input[readonly],
  textarea[readonly],
  select[disabled] {
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    width: 100%;
    margin-bottom: 4px;
    line-height: 1.5;
  }

  /* ✅ 標籤樣式 */
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
    color: #333;
    line-height: 1.4;

    /* ✅ 標籤和輸入框不分開 */
    page-break-after: avoid;
    break-after: avoid;
  }

  /* ✅ 表單組樣式 */
  .form-group {
    margin-bottom: 16px;

    /* ✅ 防止表單組被切斷 */
    page-break-inside: avoid;
    break-inside: avoid;
  }
}

/* ✅ 隱藏 PDF 中不需要的元素 */
.pdf-content {
  ::v-deep(.form) {
    .btn-back,
    .btn-next,
    .btn-prev,
    .btn-submit,
    button[type="button"],
    button[type="submit"] {
      display: none !important;
    }
  }

  /* ✅ 隱藏互動元素 */
  ::v-deep(.interactive),
  ::v-deep(.clickable),
  ::v-deep(.hover-effect) {
    pointer-events: none;
  }
}

/* ✅ 特殊內容類型的樣式 */
.pdf-content {
  /* 引用文字 */
  ::v-deep(blockquote) {
    margin: 16px 0;
    padding: 12px 20px;
    border-left: 4px solid #ffcc41;
    background-color: #f9f9f9;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* 代碼塊 */
  ::v-deep(pre),
  ::v-deep(code) {
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* 圖片 */
  ::v-deep(img) {
    max-width: 100%;
    height: auto;
    margin: 16px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* 標題層級 */
  ::v-deep(h3) {
    font-size: 18px;
    font-weight: 600;
    margin-top: 24px;
    margin-bottom: 12px;
    color: #333;
    page-break-after: avoid;
    break-after: avoid;
  }

  ::v-deep(h4) {
    font-size: 16px;
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 10px;
    color: #444;
    page-break-after: avoid;
    break-after: avoid;
  }
}

/* ✅ 打印和 PDF 專用樣式 */
@media print {
  .pdf-content {
    box-shadow: none;
    padding: 0;
    border-radius: 0;
  }

  .pdf-section {
    page-break-inside: avoid;
  }

  .section-title {
    page-break-after: avoid;
  }

  /* 確保頁面邊距 */
  @page {
    margin: 10mm;
  }
}

/* ✅ 響應式設計 */
@media (max-width: 768px) {
  .pdf-content {
    padding: 20px;
  }

  .pdf-title h1 {
    font-size: 24px;
  }

  .section-title {
    font-size: 20px;
  }

  .pdf-section {
    margin-bottom: 40px;
  }
}

/* ✅ 改進表格在 PDF 中的顯示 */
.pdf-content table {
  /* 防止表格跨頁時內容丟失 */
  thead {
    display: table-header-group;
  }

  tbody {
    display: table-row-group;
  }

  tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}

/* ✅ 改進列表的顯示 */
.pdf-content {
  ::v-deep(ul),
  ::v-deep(ol) {
    li {
      position: relative;
      padding-left: 4px;

      /* 防止列表項被切斷 */
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }
}

/* ✅ Step 組件特殊樣式調整 */
.pdf-section {
  /* 確保 Step 組件內的內容有適當間距 */
  ::v-deep(.form) {
    > div {
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  /* 輸入欄位組 */
  ::v-deep(.input-group) {
    margin-bottom: 5px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* 選項組 */
  ::v-deep(.radio-group),
  ::v-deep(.checkbox-group) {
    margin-bottom: 5px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
}

/* ✅ 財務表格特殊處理 */
.pdf-section {
  ::v-deep(.budget-table),
  ::v-deep(.cost-table) {
    width: 100%;
    margin: 20px 0;

    table {
      width: 100%;

      /* 表格標題行固定 */
      thead tr {
        background-color: #f5f5f5;
      }

      /* 總計行加粗 */
      tfoot tr,
      tr.total {
        font-weight: 700;
        background-color: #f9f9f9;
      }
    }
  }
}

// 營收目標資訊區
.revenue-section {
  .info-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .info-item {
    display: flex;
    padding: 12px 16px;
    background-color: #f9f9f9;
    border-left: 4px solid #ffcc41;
    border-radius: 4px;

    .info-label {
      font-weight: 600;
      color: #333;
      min-width: 150px;
      flex-shrink: 0;
    }

    .info-value {
      color: #555;
      flex: 1;
    }
  }
}

// 確保在 PDF 中表格不被切斷
@media print {
  .budget-table,
  .cost-table {
    page-break-inside: avoid;

    tr {
      page-break-inside: avoid;
    }
  }
}

/* Dialog 遮罩層 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Dialog 內容容器 */
.dialog-content {
  background: #ffffff;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Dialog 標題區 */
.dialog-content h2 {
  margin: 0;
  padding: 24px 60px 24px 32px;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(to bottom, #ffffff, #fafafa);
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 關閉按鈕 */
.dialog-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  font-size: 28px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 11;
  line-height: 1;
  padding: 0;
}

.dialog-close:hover {
  background: #e74c3c;
  color: white;
  transform: rotate(90deg);
}

/* Dialog 主體內容 */
.dialog-body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

/* 自定義滾動條 */
.dialog-body::-webkit-scrollbar {
  width: 8px;
}

.dialog-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.dialog-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
  transition: background 0.2s;
}

.dialog-body::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 區塊樣式 */
.info-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  transition: all 0.2s ease;
}

.info-section:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-section:last-child {
  margin-bottom: 0;
}

/* 區塊標題 */
.info-section h3 {
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  display: inline-block;
}

/* 資訊項目 */
.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  line-height: 1.6;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item label {
  font-weight: 600;
  color: #555;
  min-width: 120px;
  margin-right: 12px;
  flex-shrink: 0;
}

.info-item span {
  color: #333;
  flex: 1;
}

/* 連結樣式 */
.info-item a {
  color: #3498db;
  text-decoration: none;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
}

.info-item a:hover {
  color: #2980b9;
  border-bottom-color: #2980b9;
}

/* HTML 內容區域 */
.info-section > div[v-html] {
  color: #444;
  line-height: 1.8;
}

.info-section p {
  margin: 8px 0;
}

.info-section strong {
  color: #2c3e50;
}

.info-section em {
  color: #7f8c8d;
}

/* 圖片畫廊 */
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.image-gallery img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.image-gallery img:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

/* 品牌照片（大圖） */
.info-item img {
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  margin-top: 8px;
}

/* 影片列表 */
.video-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.video-item {
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.video-item:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.video-item a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.video-item a:before {
  content: "▶";
  margin-right: 8px;
  font-size: 12px;
}

.video-item a:hover {
  color: #2980b9;
}

/* 必填標記 */
.info-item label:has(+ span):after {
  content: "";
}


/* 響應式設計 */
@media (max-width: 768px) {
  .dialog-content {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 12px;
  }

  .dialog-content h2 {
    font-size: 20px;
    padding: 20px 50px 20px 20px;
  }

  .dialog-body {
    padding: 20px;
  }

  .info-section {
    padding: 16px;
    margin-bottom: 20px;
  }

  .info-item {
    flex-direction: column;
  }

  .info-item label {
    min-width: auto;
    margin-bottom: 4px;
  }

  .image-gallery {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }

  .image-gallery img {
    height: 100px;
  }
}

@media (max-width: 480px) {
  .dialog-overlay {
    padding: 10px;
  }

  .dialog-content h2 {
    font-size: 18px;
    padding: 16px 45px 16px 16px;
  }

  .dialog-close {
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    font-size: 24px;
  }

  .dialog-body {
    padding: 16px;
  }

  .info-section {
    padding: 12px;
  }

  .info-section h3 {
    font-size: 16px;
  }
}

.text-link {
  background: none;
  border: none;
  color: #3498db;
  font-size: 16px;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
}

.text-link:hover {
  color: #2980b9;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.text-link:active {
  color: #1c5985;
}

// PDF 預覽連結樣式
.text-link {
  background: none;
  border: none;
  color: #3498db;
  font-size: 16px;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;

  &.pdf-link {
    color: #ff6634;

    &:hover {
      color: #ff8855;
    }
  }

  &:hover {
    color: #2980b9;
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }

  &:active {
    color: #1c5985;
  }
}

// 按鈕群組樣式優化
.two-buttons-group {
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;

    button {
      width: 100%;
      text-align: left;
    }
  }
}

</style>
