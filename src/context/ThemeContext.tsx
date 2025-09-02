import React, { createContext, useState, useEffect, useContext } from 'react'
import { AppConfig } from '@/type/electron'
import { loadConfig } from '@/services/configService'

// 创建主题上下文
interface ThemeContextType {
  config: AppConfig
  updateConfig: (newConfig: Partial<AppConfig>) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// 主题提供者组件
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>({
    darkMode: false,
    notifications: true,
    language: 'zh',
    themeColor: '#3b82f6'
  })

  // 加载配置
  useEffect(() => {
    const fetchConfig = async () => {
      const loadedConfig = await loadConfig()
      setConfig(loadedConfig)
      applyTheme(loadedConfig)
    }
    fetchConfig()
  }, [])

  // 应用主题
  const applyTheme = (config: AppConfig) => {
    // 应用深色模式
    if (config.darkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }

    // 应用主题色
    document.documentElement.style.setProperty('--theme-color', config.themeColor)
  }

  // 更新配置
  const updateConfig = (newConfig: Partial<AppConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfig(updatedConfig)
    applyTheme(updatedConfig)
  }

  return (
    <ThemeContext.Provider value={{ config, updateConfig }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 自定义钩子，便于使用主题上下文
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}