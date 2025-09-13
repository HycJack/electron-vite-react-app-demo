import { ScreenshotData } from '@/type/electron';

/**
 * 处理截图功能
 */
const handleScreenshot = async (setStatus: (status: string) => void): Promise<void> => {
  setStatus('正在截图...');
  await window.electronAPI.startScreenshot();
};

/**
 * 保存截图到本地
 * @param screenshotData 截图数据
 * @param setStatus 状态更新函数
 */
const saveScreenshot = (screenshotData: ScreenshotData | null, setStatus: (status: string) => void): void => {
  if (screenshotData) {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${screenshotData.buffer}`;
    link.download = `screenshot-${Date.now()}.png`;
    link.click();
    setStatus('截图已下载');
  }
};

export { handleScreenshot, saveScreenshot };