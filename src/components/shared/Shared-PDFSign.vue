<template>
  <div v-if="showDialog" class="pdf-signature-modal">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>合約 - 查看與簽名</h3>
        <button @click="closeModal" class="close-btn">✕</button>
      </div>

      <div class="modal-body">
        <!-- PDF 顯示區域 -->
        <div class="pdf-viewer">
          <canvas ref="pdfCanvas"></canvas>
        </div>

        <!-- 簽名區域 -->
        <div class="signature-section">
          <div class="signature-label">請在下方簽名：</div>
          <div class="signature-pad-container">
            <canvas ref="signaturePad" class="signature-canvas"></canvas>
          </div>
          <div class="signature-actions">
            <button @click="clearSignature" class="btn-secondary">清除簽名</button>
            <button @click="submitSignature" class="btn-primary" :disabled="!hasSignature">
              確認並提交
            </button>
          </div>
        </div>
      </div>

      <div class="loading-overlay" v-if="isLoading">
        <div class="spinner"></div>
        <p>處理中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import SignaturePad from 'signature_pad';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// 方法 1: 使用本地 worker (推薦)
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import {fileApi} from "@/api/modules/file.js";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// 方法 2: 如果方法1不行，使用 jsdelivr CDN
// pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

const props = defineProps({
  mode:{
    type: String,
    default: 'planContract'
  },
  contractData: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'submit']);

const showDialog = ref(false);
const pdfCanvas = ref(null);
const signaturePad = ref(null);
const signaturePadInstance = ref(null);
const hasSignature = ref(false);
const isLoading = ref(false);
const pdfDoc = ref(null);

watch(() => props.visible, (newVal) => {
  showDialog.value = newVal;
  if (newVal) {
    nextTick(() => {
      initializeModal();
    });
  }
});

const initializeModal = async () => {
  await loadPDF();
  initSignaturePad();
};

// 載入 PDF
const loadPDF = async () => {
  console.log(props.contractData)
  try {
    isLoading.value = true;
    let loadingTask
    if (props.mode === 'planContract') {
      console.log('planContract')
      loadingTask = pdfjsLib.getDocument(props.contractData.salesContractUrl);
    } else if (props.mode === "planCoreContract") {
      console.log('planCoreContract')
      loadingTask = pdfjsLib.getDocument(props.contractData.coreContractByAdminUrl);
    } else {
      throw new Error('未知的合約類型');
    }

    const pdf = await loadingTask.promise;
    pdfDoc.value = pdf;

    // 渲染第一頁
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = pdfCanvas.value;
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

  } catch (error) {
    console.error('載入PDF失敗:', error);
    alert('無法載入PDF文件');
  } finally {
    isLoading.value = false;
  }
};

// 初始化簽名板
const initSignaturePad = () => {
  const canvas = signaturePad.value;
  if (!canvas) return;

  // 設置 canvas 大小
  canvas.width = canvas.offsetWidth;
  canvas.height = 150;

  signaturePadInstance.value = new SignaturePad(canvas, {
    backgroundColor: 'rgb(255, 255, 255)',
    penColor: 'rgb(0, 0, 0)'
  });

  signaturePadInstance.value.addEventListener('endStroke', () => {
    hasSignature.value = !signaturePadInstance.value.isEmpty();
  });
};

// 清除簽名
const clearSignature = () => {
  if (signaturePadInstance.value) {
    signaturePadInstance.value.clear();
    hasSignature.value = false;
  }
};

// 提交簽名
const submitSignature = async () => {
  if (!hasSignature.value) {
    alert('請先簽名');
    return;
  }

  try {
    isLoading.value = true;

    // 獲取簽名圖片
    const signatureDataUrl = signaturePadInstance.value.toDataURL('image/png');


    // 下載原始PDF
    let existingPdfBytes
    if (props.mode === 'planContract') {
      existingPdfBytes = await fetch(props.contractData.salesContractUrl).then(res => res.arrayBuffer());
    } else if (props.mode === "planCoreContract") {
      existingPdfBytes = await fetch(props.contractData.coreContractByAdminUrl).then(res => res.arrayBuffer());
    }

    // 使用 pdf-lib 添加簽名
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];

    // 將簽名圖片嵌入PDF
    const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
    const signatureDims = signatureImage.scale(0.3);

    // 在最後一頁添加簽名
    lastPage.drawImage(signatureImage, {
      x: lastPage.getWidth() - signatureDims.width - 50,
      y: 50,
      width: signatureDims.width,
      height: signatureDims.height,
    });

    // 生成新的PDF
    const pdfBytes = await pdfDoc.save();

    // 創建 Blob 和 File
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const file = new File([blob], `signed_${props.contractData.displayName}`, {
      type: 'application/pdf'
    });

    // 上傳到後端
    await uploadSignedPDF(file);

  } catch (error) {
    console.error('簽名處理失敗:', error);
    alert('簽名處理失敗，請重試');
  } finally {
    isLoading.value = false;
  }
};

// 上傳簽名後的PDF
const uploadSignedPDF = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('contractId', props.contractData.id);
  let response
  try {
    if (props.mode === 'planContract') {
       response = await fileApi.uploadUserSignContractFile(file, props.contractData.id);
    } else if (props.mode === "planCoreContract") {
       response = await fileApi.uploadUserSignCoreContractFile(file, props.contractData.id)
    }


    if (response.code !== 0) {
      throw new Error(response.message || '上傳失敗');
    }

    alert('簽名成功！');
    const result = {
      signContractId: response.data.id,
    }
    emit('submit', result);
    closeModal();

  } catch (error) {
    console.error('上傳失敗:', error);
    throw error;
  }
};

// 關閉彈窗
const closeModal = () => {
  showDialog.value = false;
  emit('close');

  // 清理
  if (signaturePadInstance.value) {
    signaturePadInstance.value.clear();
  }
};
</script>

<style scoped>
.pdf-signature-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.pdf-viewer {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #f9fafb;
  display: flex;
  justify-content: center;
}

.pdf-viewer canvas {
  max-width: 100%;
  height: auto;
  display: block;
}

.signature-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
}

.signature-label {
  font-weight: 500;
  margin-bottom: 12px;
  color: #374151;
}

.signature-pad-container {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: white;
  margin-bottom: 16px;
}

.signature-canvas {
  display: block;
  width: 100%;
  touch-action: none;
}

.signature-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  margin-top: 16px;
  color: #6b7280;
  font-weight: 500;
}
</style>
