import React, { useState, useEffect } from 'react'
import { Camera } from 'lucide-react'
import { ScreenshotData, ScreenshotSavedData } from '../type/electron'
import { handleScreenshot as handleScreenshotService, saveScreenshot as saveScreenshotService } from '@/services/screenshotService'

const ScreenshotPage: React.FC = () => {
  const [status, setStatus] = useState<string>('等待截图...')
  const [screenshotData, setScreenshotData] = useState<ScreenshotData | null>(null)
  const [downloadsPath, setDownloadsPath] = useState<string>('')

  // 获取下载路径并设置事件监听
  useEffect(() => {
    // 获取下载路径
    window.electronAPI.getDownloadsPath().then((path: string) => {
      setDownloadsPath(path)
    })

    // 设置监听器
    window.electronAPI.onScreenshotCaptured((event: any, data: ScreenshotData) => {
      setScreenshotData(data)
      setStatus('截图完成！')
    })

    window.electronAPI.onScreenshotCancelled(() => {
      setStatus('截图已取消')
      setTimeout(() => setStatus('等待截图...'), 2000)
    })

    window.electronAPI.onScreenshotSaved((event: any, data: ScreenshotSavedData) => {
      setStatus(`截图已保存至: ${data.filepath}`)
    })

    // 清理监听器
    return () => {
      window.electronAPI.removeAllListeners('screenshot-captured')
      window.electronAPI.removeAllListeners('screenshot-cancelled')
      window.electronAPI.removeAllListeners('screenshot-saved')
    }
  }, [])

  // 处理截图
  const handleScreenshot = async (): Promise<void> => {
    handleScreenshotService(setStatus)
  }

  // 保存截图
  const saveScreenshot = (): void => {
    saveScreenshotService(screenshotData, setStatus)
  }
  return (
    <div className='screenshot-container'>
      <h2 className='screenshot-title'>
        <Camera size={24} className='screenshot-icon' /> 截图功能
      </h2>

      <div className='controls'>
        <button onClick={handleScreenshot} className='screenshot-btn'>
          开始截图 (Ctrl+Shift+A)
        </button>

        {screenshotData && (
          <button onClick={saveScreenshot} className='save-btn'>
            保存截图
          </button>
        )}
      </div>

      <div className='status'>
        <p>{status}</p>
        {downloadsPath && <p>下载路径: {downloadsPath}</p>}
      </div>

      {screenshotData && (
        <div className='result'>
          <h2>截图预览</h2>
          <p>截图范围: {JSON.stringify(screenshotData.bounds)}</p>
          <img
            src={`data:image/png;base64,${screenshotData.buffer}`}
            alt='截图预览'
            className='screenshot-image'
          />
        </div>
      )}

      <div className='instructions'>
        <h3>使用说明：</h3>
        <ul>
          <li>点击"开始截图"按钮或使用快捷键 Ctrl+Shift+A</li>
          <li>拖动鼠标选择截图区域</li>
          <li>按 Enter 确认截图，按 Esc 取消</li>
          <li>截图完成后可以保存到本地</li>
        </ul>
      </div>
    </div>
  )
}

export default ScreenshotPage