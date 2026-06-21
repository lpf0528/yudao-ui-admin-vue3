import html2canvas from 'html2canvas'
import download from '@/utils/download'

/** 预览区最小缩放比例 */
export const MIN_PREVIEW_SCALE = 0.5
/** 预览区最大缩放比例 */
export const MAX_PREVIEW_SCALE = 1.5
/** 每次缩放步进 */
const PREVIEW_SCALE_STEP = 0.1

/**
 * 打印预览弹窗通用工具：预览区缩放、截图复制剪贴板、图片下载
 * @param getFileName 下载文件名（不含扩展名），通常取订单号
 */
export function usePrintPreviewTools(getFileName: () => string) {
  /** 预览纸张 DOM，用于截图 */
  const previewPaperRef = ref<HTMLElement>()
  /** 预览区 CSS scale 缩放比例 */
  const previewScale = ref(1)
  /** 截图（复制剪贴板）进行中 */
  const screenshotLoading = ref(false)
  /** 下载进行中 */
  const downloadLoading = ref(false)
  /** 防止截图与下载同时触发导致缩放状态冲突 */
  let capturing = false

  const previewScalePercent = computed(() => Math.round(previewScale.value * 100))

  const zoomIn = () => {
    previewScale.value = Math.min(
      MAX_PREVIEW_SCALE,
      Math.round((previewScale.value + PREVIEW_SCALE_STEP) * 10) / 10
    )
  }

  const zoomOut = () => {
    previewScale.value = Math.max(
      MIN_PREVIEW_SCALE,
      Math.round((previewScale.value - PREVIEW_SCALE_STEP) * 10) / 10
    )
  }

  /** 打开弹窗时重置为 100%，避免沿用上次的缩放 */
  const resetPreviewScale = () => {
    previewScale.value = 1
  }

  /**
   * 将预览纸张 DOM 渲染为 Canvas。
   * 截图前临时恢复 100% 缩放，避免 transform 影响输出尺寸。
   */
  const capturePreviewToCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const el = previewPaperRef.value
    if (!el || capturing) return null

    capturing = true
    const savedScale = previewScale.value
    try {
      previewScale.value = 1
      await nextTick()
      return await html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      })
    } finally {
      previewScale.value = savedScale
      capturing = false
    }
  }

  /** 截图：复制预览内容为 PNG 到剪贴板 */
  const handleScreenshot = async () => {
    if (screenshotLoading.value || downloadLoading.value) return

    screenshotLoading.value = true
    try {
      const canvas = await capturePreviewToCanvas()
      if (!canvas) return

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) {
        throw new Error('截图生成失败')
      }

      if (!navigator.clipboard?.write) {
        ElMessage.warning('当前浏览器不支持复制图片到剪贴板')
        return
      }

      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      ElMessage.success('已复制到剪贴板')
    } catch {
      ElMessage.error('截图失败，请重试')
    } finally {
      screenshotLoading.value = false
    }
  }

  /** 下载：将预览内容保存为 PNG 文件 */
  const handleDownload = async () => {
    if (screenshotLoading.value || downloadLoading.value) return

    downloadLoading.value = true
    try {
      const canvas = await capturePreviewToCanvas()
      if (!canvas) return

      download.base64Image(canvas.toDataURL('image/png'), getFileName())
      ElMessage.success('图片已下载')
    } catch {
      ElMessage.error('下载失败，请重试')
    } finally {
      downloadLoading.value = false
    }
  }

  return {
    previewPaperRef,
    previewScale,
    previewScalePercent,
    screenshotLoading,
    downloadLoading,
    zoomIn,
    zoomOut,
    resetPreviewScale,
    handleScreenshot,
    handleDownload
  }
}
