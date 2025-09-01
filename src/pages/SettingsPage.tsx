import React, { useState } from 'react'
import { Settings } from 'lucide-react'

const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  return (
    <div className='settings-container'>
      <h2 className='settings-title'>
        <Settings size={24} className='settings-icon' /> 设置
      </h2>
      <div className='settings-content'>
        <div className='setting-item'>
          <label className='setting-label'>深色模式</label>
          <input
            type='checkbox'
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
            className='setting-toggle'
          />
        </div>
        <div className='setting-item'>
          <label className='setting-label'>通知</label>
          <input
            type='checkbox'
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className='setting-toggle'
          />
        </div>
        <div className='setting-item'>
          <label className='setting-label'>语言</label>
          <select className='setting-select'>
            <option value='zh'>中文</option>
            <option value='en'>英文</option>
          </select>
        </div>
        <div className='setting-item'>
          <label className='setting-label'>主题颜色</label>
          <div className='color-picker'>
            <button className='color-option' style={{ backgroundColor: '#3b82f6' }}></button>
            <button className='color-option' style={{ backgroundColor: '#10b981' }}></button>
            <button className='color-option' style={{ backgroundColor: '#ef4444' }}></button>
            <button className='color-option' style={{ backgroundColor: '#8b5cf6' }}></button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage