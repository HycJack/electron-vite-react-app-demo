import React from 'react'
import { Music } from 'lucide-react'

const FeatureThreePage: React.FC = () => {
  return (
    <div className='feature-three-container'>
      <h2 className='feature-three-title'>
        <Music size={24} className='feature-three-icon' /> 音乐播放器
      </h2>
      <div className='feature-three-content'>
        <p>这是功能三的内容区域。</p>
        <p>您可以在此处实现音乐相关的功能。</p>
        <div className='music-player'>
          <h3>音乐播放器</h3>
          <div className='player-controls'>
            <button className='play-btn'>播放</button>
            <button className='pause-btn'>暂停</button>
            <button className='stop-btn'>停止</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureThreePage