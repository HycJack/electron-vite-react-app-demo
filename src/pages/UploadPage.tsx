import React from 'react'
import { Upload } from 'lucide-react'

const UploadPage: React.FC = () => {
  return (
    <div className='upload-container'>
      <h2 className='upload-title'>
        <Upload size={24} className='upload-icon' /> 上传视频或音频
      </h2>
      <div className='upload-area'>
        <p>拖放文件到此处，或点击选择文件</p>
        <button className='select-file-btn'>选择文件</button>
      </div>
      <div className='upload-list'>
        <h3>上传历史</h3>
        <p className='empty-state'>暂无上传记录</p>
      </div>
    </div>
  )
}

export default UploadPage