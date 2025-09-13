import React from 'react'
import { Home } from 'lucide-react'

const HomePage: React.FC = () => {
  return (
    <div className='home-container flex flex-col items-center justify-center h-full p-8'>
      <Home size={64} className='mb-6' style={{ color: 'var(--theme-color)' }} />
      <h1 className='text-3xl font-bold mb-4' style={{ color: 'var(--text-color)' }}>欢迎使用工具箱应用</h1>
      <p className='text-lg text-center max-w-md' style={{ color: 'var(--text-color-secondary)' }}>
        这是您的应用首页，您可以通过左侧导航栏访问各种功能。
      </p>
      <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl'>
        <div className='feature-card p-6 rounded-xl shadow-md flex flex-col items-center text-center' style={{ backgroundColor: 'var(--card-bg)', transition: 'background-color 0.3s ease' }}>
          <Home size={32} className='mb-3' style={{ color: 'var(--theme-color)' }} />
          <h3 className='font-semibold mb-2' style={{ color: 'var(--text-color)' }}>文件上传</h3>
          <p style={{ color: 'var(--text-color-secondary)' }}>上传和管理您的文件</p>
        </div>
        <div className='feature-card p-6 rounded-xl shadow-md flex flex-col items-center text-center' style={{ backgroundColor: 'var(--card-bg)', transition: 'background-color 0.3s ease' }}>
          <Home size={32} className='mb-3' style={{ color: 'var(--theme-color)' }} />
          <h3 className='font-semibold mb-2' style={{ color: 'var(--text-color)' }}>AI 聊天</h3>
          <p style={{ color: 'var(--text-color-secondary)' }}>与AI助手进行对话</p>
        </div>
        <div className='feature-card p-6 rounded-xl shadow-md flex flex-col items-center text-center' style={{ backgroundColor: 'var(--card-bg)', transition: 'background-color 0.3s ease' }}>
          <Home size={32} className='mb-3' style={{ color: 'var(--theme-color)' }} />
          <h3 className='font-semibold mb-2' style={{ color: 'var(--text-color)' }}>音乐播放器</h3>
          <p style={{ color: 'var(--text-color-secondary)' }}>享受您喜爱的音乐</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage