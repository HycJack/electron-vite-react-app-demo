import React, { useState, useEffect } from 'react'
import { Settings, Moon, Sun, Bell, BellOff, Globe, Palette, Save } from 'lucide-react'
import { saveConfig } from '@/services/configService'
import { AppConfig } from '@/type/electron'
import { useTheme } from '@/context/ThemeContext'

const SettingsPage: React.FC = () => {
  const { config, updateConfig } = useTheme()
  const [status, setStatus] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // 处理配置变更
  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    updateConfig({ [key]: value })
  }

  // 保存配置
  const handleSaveConfig = async () => {
    setIsSaving(true)
    setStatus('正在保存配置...')
    const success = await saveConfig(config)
    if (success) {
      setStatus('配置保存成功！')
    } else {
      setStatus('配置保存失败，请重试。')
    }
    setIsSaving(false)
    setTimeout(() => setStatus(''), 3000)
  }

  // 可用的主题颜色
  const themeColors = [
    { value: '#3b82f6', name: '蓝色' },
    { value: '#10b981', name: '绿色' },
    { value: '#ef4444', name: '红色' },
    { value: '#8b5cf6', name: '紫色' },
    { value: '#f59e0b', name: '橙色' },
    { value: '#ec4899', name: '粉色' }
  ]

  return (
    <div className='settings-container'>
      <h2 className='settings-title'>
        <Settings size={24} className='settings-icon' /> 设置
      </h2>

      <div className='controls'>
        <button
          onClick={handleSaveConfig}
          className='save-btn'
          disabled={isSaving}
        >
          <Save size={18} className='save-icon' />
          {isSaving ? '保存中...' : '保存配置'}
        </button>
      </div>

      <div className='status'>
        {status && <p>{status}</p>}
      </div>

      <div className='settings-content'>
        <div className='setting-card'>
          <h3 className='card-title'>外观设置</h3>
          <div className='setting-item'>
            <label className='setting-label'>
              {config.darkMode ? <Moon size={18} className='icon' /> : <Sun size={18} className='icon' />}
              深色模式
            </label>
            <input
              type='checkbox'
              checked={config.darkMode}
              onChange={(e) => handleConfigChange('darkMode', e.target.checked)}
              className='setting-toggle'
            />
          </div>
          <div className='setting-item'>
            <label className='setting-label'>
              {config.notifications ? <Bell size={18} className='icon' /> : <BellOff size={18} className='icon' />}
              通知
            </label>
            <input
              type='checkbox'
              checked={config.notifications}
              onChange={(e) => handleConfigChange('notifications', e.target.checked)}
              className='setting-toggle'
            />
          </div>
        </div>

        <div className='setting-card'>
          <h3 className='card-title'>语言设置</h3>
          <div className='setting-item'>
            <label className='setting-label'>
              <Globe size={18} className='icon' />
              语言
            </label>
            <select
              className='setting-select'
              value={config.language}
              onChange={(e) => handleConfigChange('language', e.target.value)}
            >
              <option value='zh'>中文</option>
              <option value='en'>英文</option>
            </select>
          </div>
        </div>

        <div className='setting-card'>
          <h3 className='card-title'>主题设置</h3>
          <div className='setting-item'>
            <label className='setting-label'>
              <Palette size={18} className='icon' />
              主题颜色
            </label>
            <div className='color-picker'>
              {themeColors.map((color) => (
                <button
                  key={color.value}
                  className={`color-option ${config.themeColor === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleConfigChange('themeColor', color.value)}
                  title={color.name}
                >
                  {config.themeColor === color.value && <div className='selected-indicator'>✓</div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='instructions'>
        <h3>使用说明：</h3>
        <ul>
          <li>修改设置后点击"保存配置"按钮生效</li>
          <li>深色模式会改变应用的整体色调</li>
          <li>通知开关控制应用的消息提醒</li>
          <li>选择主题颜色可以个性化应用外观</li>
        </ul>
      </div>
    </div>
  )
}

export default SettingsPage