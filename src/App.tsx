import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/context/ThemeContext'
import UpdateElectron from '@/components/update'
import './App.css'
// 导入lucide图标
import { Menu, X, ArrowRight, ArrowLeft, Upload, FileText, Settings, Music, Video, Info, FileDown, Camera, Home } from 'lucide-react'

// 导入页面组件
import HomePage from '@/pages/HomePage'
import UploadPage from '@/pages/UploadPage'
import FeatureTwoPage from '@/pages/AIChatPage'
import FeatureThreePage from '@/pages/MusicPlayerPage'
import SettingsPage from '@/pages/SettingsPage'
import ScreenshotPage from '@/pages/ScreenshotPage'


function App() {

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeMenuItem, setActiveMenuItem] = useState('home') // 默认选中首页

  // 监听窗口大小变化，小于768px时自动收起侧边栏
  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 768)
    }

    // 初始化
    handleResize()
    window.addEventListener('resize', handleResize)

    // 清理监听器
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleMenuItemClick = (menuItem: string) => {
    setActiveMenuItem(menuItem)
  }

  return (
    <ThemeProvider>
      <div className='App-container'>
      {/* 侧边栏 */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className='sidebar-header'>
          <button onClick={toggleSidebar} className='toggle-btn'>
            {sidebarCollapsed ? <Menu size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <div className='menu-container'>
          {!sidebarCollapsed && <h2>工具箱</h2>}
          <ul className='nav-menu'>
            <li className={`nav-item ${activeMenuItem === 'home' ? 'active' : ''}`} onClick={() => handleMenuItemClick('home')}>
              <Home size={18} className='icon' /> <span>{!sidebarCollapsed && '首页'}</span>
            </li>
            <li className={`nav-item ${activeMenuItem === 'upload' ? 'active' : ''}`} onClick={() => handleMenuItemClick('upload')}>
              <Upload size={18} className='icon' /> <span>{!sidebarCollapsed && '文件上传'}</span>
            </li>
            <li className={`nav-item ${activeMenuItem === 'featureTwo' ? 'active' : ''}`} onClick={() => handleMenuItemClick('featureTwo')}>
              <FileText size={18} className='icon' /> <span>{!sidebarCollapsed && 'AI 聊天'}</span>
            </li>
            <li className={`nav-item ${activeMenuItem === 'screenshot' ? 'active' : ''}`} onClick={() => handleMenuItemClick('screenshot')}>
              <Camera size={18} className='icon' /> <span>{!sidebarCollapsed && '截图功能'}</span>
            </li>
            <li className={`nav-item ${activeMenuItem === 'featureThree' ? 'active' : ''}`} onClick={() => handleMenuItemClick('featureThree')}>
              <Music size={18} className='icon' /> <span>{!sidebarCollapsed && '音乐播放器'}</span>
            </li>
            <li className={`nav-item ${activeMenuItem === 'settings' ? 'active' : ''}`} onClick={() => handleMenuItemClick('settings')}>
              <Settings size={18} className='icon' /> <span>{!sidebarCollapsed && '设置'}</span>
            </li>
            
          </ul>
        </div>
        <div className='sidebar-footer'>
          {/* {!sidebarCollapsed && <UpdateElectron />} */}
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className='main-content'>
        {/* <header className='main-header'>
          
        </header> */}

        {/* 根据选中的菜单项显示不同的页面 */}
        {activeMenuItem === 'home' && <HomePage />}
        {activeMenuItem === 'upload' && <UploadPage />}
        {activeMenuItem === 'featureTwo' && <FeatureTwoPage />}
        {activeMenuItem === 'featureThree' && <FeatureThreePage />}
        {activeMenuItem === 'settings' && <SettingsPage />}
        {activeMenuItem === 'screenshot' && <ScreenshotPage />}
      </main>
    </div>
  </ThemeProvider>
  )
}

export default App

