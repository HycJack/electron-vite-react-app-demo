import React from 'react'
import { Camera } from 'lucide-react'
import { ScreenshotData } from '../type/electron'

interface ScreenshotPageProps {
  status: string
  screenshotData: ScreenshotData | null
  downloadsPath: string
  handleScreenshot: () => Promise<void>
  saveScreenshot: () => void
}

const ScreenshotPage: React.FC<ScreenshotPageProps> = ({ 
  status, 
  screenshotData, 
  downloadsPath, 
  handleScreenshot, 
  saveScreenshot 
}) => {
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