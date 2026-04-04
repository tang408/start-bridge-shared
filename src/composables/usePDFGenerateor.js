import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function cloneHandler(clonedDoc) {
    // ✅ 注入覆蓋樣式，把 oklch 相關的 CSS 變數換掉
    const overrideStyle = clonedDoc.createElement('style');
    overrideStyle.textContent = `
        *, *::before, *::after {
            --tw-ring-color: rgba(59, 130, 246, 0.5) !important;
            --tw-shadow-color: rgba(0, 0, 0, 0.1) !important;
            color-scheme: light !important;
        }
    `;
    clonedDoc.head.appendChild(overrideStyle);

    // ✅ 移除所有包含 oklch 的樣式規則
    Array.from(clonedDoc.styleSheets).forEach(sheet => {
        try {
            const rules = Array.from(sheet.cssRules || []);
            // 反向遍歷避免 index 錯位
            for (let i = rules.length - 1; i >= 0; i--) {
                const rule = rules[i];
                const ruleText = rule.cssText || '';
                if (ruleText.includes('oklch')) {
                    sheet.deleteRule(i);
                }
            }
        } catch (e) {
            // 跨域略過
        }
    });

    // ✅ 原本的 textarea / input 替換
    clonedDoc.querySelectorAll('textarea').forEach(el => {
        const div = clonedDoc.createElement('div');
        div.style.cssText = `
            white-space: pre-wrap;
            word-break: break-word;
            line-height: 1.6;
            padding: 8px 12px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            background: #f9f9f9;
            width: 100%;
            box-sizing: border-box;
        `;
        div.textContent = el.value;
        el.parentNode.replaceChild(div, el);
    });

    clonedDoc.querySelectorAll('input[type="text"], input[type="number"], input:not([type])').forEach(el => {
        const div = clonedDoc.createElement('div');
        div.style.cssText = `
            padding: 8px 12px;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            background: #f9f9f9;
            width: 100%;
            box-sizing: border-box;
        `;
        div.textContent = el.value || '—';
        el.parentNode.replaceChild(div, el);
    });

    // ✅ 展開被截斷的容器
    clonedDoc.querySelectorAll('*').forEach(el => {
        if (el.scrollHeight > el.clientHeight + 2) {
            el.style.height = 'auto';
            el.style.maxHeight = 'none';
            el.style.overflow = 'visible';
        }
    });

    clonedDoc.querySelectorAll('*').forEach(el => {
        const computed = window.getComputedStyle(el);

        // 跳過 body、html、svg 內部元素
        if (['HTML', 'BODY', 'SVG', 'PATH', 'G'].includes(el.tagName)) return;

        el.style.overflow = 'visible';
        el.style.maxHeight = 'none';

        // 只對有明確高度限制的元素做 height: auto
        if (computed.overflow === 'hidden' || computed.overflow === 'scroll' || computed.overflowY === 'hidden') {
            el.style.height = 'auto';
        }
    });
}

/**
 * 改進版 PDF 生成工具 - 修正分頁對齊問題
 */
export function usePdfGenerator() {

    /**
     * 改進的每個 Step 分頁生成（修正分頁對齊問題）
     * @param {HTMLElement} container - 包含所有 section 的容器
     * @param {string} filename - PDF 檔案名稱
     * @param {Object} options - 選項
     */
    async function generateStepByStepPDF(container, filename = '創業計劃書.pdf', options = {}) {
        const {
            scale = 2,
            quality = 0.95,
            format = 'a4',
            orientation = 'portrait',
            margin = 10,
            sectionSelector = '.pdf-section'
        } = options;

        try {
            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: format
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);

            // 獲取標題和所有 section
            const titleElement = container.querySelector('.pdf-title');
            const sections = container.querySelectorAll(sectionSelector);

            if (sections.length === 0) {
                throw new Error('找不到任何 section 元素');
            }

            let currentY = margin;
            let isFirstSection = true;

            // ============ 處理每個 section ============
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];

                // 轉換 section 為 canvas
                const canvas = await html2canvas(section, {
                    scale: scale,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    // ✅ 不要預先傳 height，讓 onclone 處理後自動計算
                    windowHeight: document.documentElement.scrollHeight,
                    scrollY: -window.scrollY,
                    onclone: (clonedDoc, clonedElement) => {
                        // ✅ clonedElement 是被截圖的那個元素的複製
                        cloneHandler(clonedDoc);

                        // ✅ 強制撐開被截圖的元素本身
                        clonedElement.style.height = 'auto';
                        clonedElement.style.overflow = 'visible';
                        clonedElement.style.maxHeight = 'none';
                    }
                });

                const imgWidth = contentWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // ✅ 智能分頁邏輯：只有在必要時才開始新頁
                const remainingSpace = pageHeight - currentY - margin;
                const needsNewPage = !isFirstSection && (
                    // 如果 section 內容很大（超過一頁），且當前頁剩餘空間不足 20%
                    (imgHeight > contentHeight && remainingSpace < contentHeight * 0.2) ||
                    // 或者當前頁剩餘空間不足以容納 section 的 30%
                    (imgHeight <= contentHeight && remainingSpace < imgHeight * 0.3 && remainingSpace < contentHeight * 0.5)
                );

                if (needsNewPage) {
                    pdf.addPage();
                    currentY = margin;
                }

                // ============ 關鍵改進：精確計算分頁 ============
                if (imgHeight > remainingSpace && remainingSpace < contentHeight * 0.8) {
                    // 內容超過當前頁剩餘空間，需要分割

                    // 計算需要多少頁
                    let heightLeft = imgHeight;
                    let sourceYOffset = 0;
                    let pageIndex = 0;

                    while (heightLeft > 0) {
                        if (pageIndex > 0) {
                            pdf.addPage();
                            currentY = margin;
                        }

                        // 計算當前頁可用高度
                        const availableHeight = pageHeight - currentY - margin;
                        const currentPageHeight = Math.min(availableHeight, heightLeft);

                        // ✅ 關鍵改進：精確計算源圖像的裁切位置
                        const sourceY = (sourceYOffset / imgWidth) * canvas.width;
                        const sourceHeight = (currentPageHeight / imgWidth) * canvas.width;

                        // 確保不會超出 canvas 範圍
                        const actualSourceHeight = Math.min(
                            sourceHeight,
                            canvas.height - sourceY
                        );

                        // 創建裁切後的 canvas
                        const croppedCanvas = document.createElement('canvas');
                        croppedCanvas.width = canvas.width;
                        croppedCanvas.height = actualSourceHeight;

                        const ctx = croppedCanvas.getContext('2d');

                        // ✅ 填充白色背景，避免透明區域
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, croppedCanvas.width, croppedCanvas.height);

                        // 繪製裁切的圖像
                        ctx.drawImage(
                            canvas,
                            0, sourceY,                           // 源起點
                            canvas.width, actualSourceHeight,     // 源尺寸
                            0, 0,                                 // 目標起點
                            canvas.width, actualSourceHeight      // 目標尺寸
                        );

                        const croppedImgData = croppedCanvas.toDataURL('image/jpeg', quality);
                        const croppedImgHeight = (actualSourceHeight * imgWidth) / canvas.width;

                        // ✅ 添加到 PDF
                        pdf.addImage(croppedImgData, 'JPEG', margin, currentY, imgWidth, croppedImgHeight);

                        // 更新位置
                        currentY = margin + croppedImgHeight;
                        sourceYOffset += currentPageHeight;
                        heightLeft -= currentPageHeight;
                        pageIndex++;
                    }
                } else {
                    // 內容在當前頁剩餘空間內，直接添加
                    pdf.addImage(
                        canvas.toDataURL('image/jpeg', quality),
                        'JPEG',
                        margin,
                        currentY,
                        imgWidth,
                        imgHeight
                    );
                    currentY += imgHeight + 5; // 加上小間距
                }

                isFirstSection = false;
            }

            // 下載 PDF
            pdf.save(filename);

            return {
                success: true,
                message: `PDF 生成成功 (共 ${pdf.internal.getNumberOfPages()} 頁)`,
                pageCount: pdf.internal.getNumberOfPages()
            };

        } catch (error) {
            console.error('PDF 生成失敗:', error);
            return {
                success: false,
                message: 'PDF 生成失敗: ' + error.message,
                error: error
            };
        }
    }

    /**
     * 智能分頁 PDF（改進版）
     * @param {HTMLElement} container - 包含所有 section 的容器
     * @param {string} filename - PDF 檔案名稱
     * @param {Object} options - 選項
     */
    async function generateSectionBasedPDF(container, filename = '創業計劃書.pdf', options = {}) {
        const {
            scale = 2,
            quality = 0.95,
            format = 'a4',
            orientation = 'portrait',
            margin = 10,
            sectionSelector = '.pdf-section',
        } = options;

        try {
            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: format
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);

            // 獲取標題和所有 section
            const titleElement = container.querySelector('.pdf-title');
            const sections = container.querySelectorAll(sectionSelector);

            if (sections.length === 0) {
                throw new Error('找不到任何 section 元素');
            }

            let currentY = margin;
            let isFirstPage = true;

            // ============ 添加標題 ============
            if (titleElement) {
                const titleCanvas = await html2canvas(titleElement, {
                    scale: scale,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                const titleImgData = titleCanvas.toDataURL('image/jpeg', quality);
                const titleImgWidth = contentWidth;
                const titleImgHeight = (titleCanvas.height * titleImgWidth) / titleCanvas.width;

                pdf.addImage(titleImgData, 'JPEG', margin, currentY, titleImgWidth, titleImgHeight);
                currentY += titleImgHeight + 10; // 加上間距

                // 如果標題佔太多空間，換頁
                if (currentY > contentHeight * 0.7) {
                    pdf.addPage();
                    currentY = margin;
                    isFirstPage = false;
                }
            }

            // ============ 智能處理每個 section ============
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];

                // 轉換 section 為 canvas
                const canvas = await html2canvas(section, {
                    scale: scale,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    // ✅ 不要預先傳 height，讓 onclone 處理後自動計算
                    windowHeight: document.documentElement.scrollHeight,
                    scrollY: -window.scrollY,
                    onclone: (clonedDoc, clonedElement) => {
                        // ✅ clonedElement 是被截圖的那個元素的複製
                        cloneHandler(clonedDoc);

                        // ✅ 強制撐開被截圖的元素本身
                        clonedElement.style.height = 'auto';
                        clonedElement.style.overflow = 'visible';
                        clonedElement.style.maxHeight = 'none';
                    }
                });

                const imgWidth = contentWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // ✅ 智能判斷：如果當前頁剩餘空間不足，換頁
                const remainingSpace = (pageHeight - margin) - currentY;

                if (!isFirstPage && imgHeight > remainingSpace && remainingSpace < contentHeight * 0.3) {
                    // 剩餘空間不足 30%，換頁
                    pdf.addPage();
                    currentY = margin;
                }

                // ============ 處理 section 分頁 ============
                if (imgHeight > contentHeight) {
                    // section 內容超過一頁
                    const totalPages = Math.ceil(imgHeight / contentHeight);

                    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
                        if (pageIndex > 0) {
                            pdf.addPage();
                            currentY = margin;
                        }

                        const startY = pageIndex * contentHeight;
                        const remainingHeight = imgHeight - startY;
                        const currentPageHeight = Math.min(contentHeight, remainingHeight);

                        // 精確裁切
                        const sourceY = (startY / imgWidth) * canvas.width;
                        const sourceHeight = (currentPageHeight / imgWidth) * canvas.width;
                        const actualSourceHeight = Math.min(sourceHeight, canvas.height - sourceY);

                        const croppedCanvas = document.createElement('canvas');
                        croppedCanvas.width = canvas.width;
                        croppedCanvas.height = actualSourceHeight;

                        const ctx = croppedCanvas.getContext('2d');
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, croppedCanvas.width, croppedCanvas.height);
                        ctx.drawImage(
                            canvas,
                            0, sourceY,
                            canvas.width, actualSourceHeight,
                            0, 0,
                            canvas.width, actualSourceHeight
                        );

                        const croppedImgData = croppedCanvas.toDataURL('image/jpeg', quality);
                        const croppedImgHeight = (actualSourceHeight * imgWidth) / canvas.width;

                        pdf.addImage(croppedImgData, 'JPEG', margin, currentY, imgWidth, croppedImgHeight);
                        currentY = margin + croppedImgHeight;
                    }
                } else {
                    // section 在一頁內
                    pdf.addImage(
                        canvas.toDataURL('image/jpeg', quality),
                        'JPEG',
                        margin,
                        currentY,
                        imgWidth,
                        imgHeight
                    );
                    currentY += imgHeight + 10; // 加上 section 間距
                }

                isFirstPage = false;
            }

            // ============ 添加頁碼 ============
            if (addPageNumbers) {
                const totalPages = pdf.internal.getNumberOfPages();
                pdf.setFontSize(10);
                pdf.setTextColor(150);

                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    pdf.text(
                        `第 ${i} 頁，共 ${totalPages} 頁`,
                        pageWidth / 2,
                        pageHeight - 5,
                        { align: 'center' }
                    );
                }
            }

            // 下載 PDF
            pdf.save(filename);

            return {
                success: true,
                message: `PDF 生成成功 (共 ${pdf.internal.getNumberOfPages()} 頁)`,
                pageCount: pdf.internal.getNumberOfPages()
            };

        } catch (error) {
            console.error('PDF 生成失敗:', error);
            return {
                success: false,
                message: 'PDF 生成失敗: ' + error.message,
                error: error
            };
        }
    }

    /**
     * 基本 PDF 生成（自動分頁）
     */
    async function generatePDF(element, filename = '創業計劃書.pdf', options = {}) {
        const {
            scale = 2,
            quality = 0.95,
            format = 'a4',
            orientation = 'portrait',
            margin = 10
        } = options;

        try {
            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: format
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);

            const canvas = await html2canvas(element, {
                scale: scale,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL('image/jpeg', quality);
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;
            let pageCount = 0;

            // 第一頁
            pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
            heightLeft -= contentHeight;
            pageCount++;

            // 後續頁面
            while (heightLeft > 0) {
                position = -(contentHeight * pageCount);
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', margin, position + margin, imgWidth, imgHeight);
                heightLeft -= contentHeight;
                pageCount++;
            }

            pdf.save(filename);

            return {
                success: true,
                message: `PDF 生成成功 (共 ${pageCount} 頁)`,
                pageCount: pageCount
            };

        } catch (error) {
            console.error('PDF 生成失敗:', error);
            return {
                success: false,
                message: 'PDF 生成失敗',
                error: error
            };
        }
    }


    return {
        generatePDF,
        generateSectionBasedPDF,
        generateStepByStepPDF,

    };
}
