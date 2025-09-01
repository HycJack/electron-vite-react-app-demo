import { useState, useEffect } from 'react'
import UpdateElectron from '@/components/update'
import './App.css'
// 导入lucide图标
import { Menu, X, ChevronRight, ChevronLeft, Upload, FileText, Settings, Music, Video, Info, FileDown, Camera } from 'lucide-react'

// 导入页面组件
import UploadPage from '@/pages/UploadPage'
import FeatureTwoPage from '@/pages/FeatureTwoPage'
import FeatureThreePage from '@/pages/FeatureThreePage'
import SettingsPage from '@/pages/SettingsPage'
import ScreenshotPage from '@/pages/ScreenshotPage'


function App() {

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeMenuItem, setActiveMenuItem] = useState('upload') // 默认选中上传页面

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
    <div className='App-container'>
      {/* 侧边栏 */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className='sidebar-header'>
          <button onClick={toggleSidebar} className='toggle-btn'>
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        {!sidebarCollapsed && (
          <>
            <h2>导航菜单</h2>
            <ul className='nav-menu'>
              <li className={`nav-item ${activeMenuItem === 'upload' ? 'active' : ''}`} onClick={() => handleMenuItemClick('upload')}>
                <Upload size={18} className='icon' /> 文件上传
              </li>
              <li className={`nav-item ${activeMenuItem === 'featureTwo' ? 'active' : ''}`} onClick={() => handleMenuItemClick('featureTwo')}>
                <FileText size={18} className='icon' /> 功能二
              </li>
              <li className={`nav-item ${activeMenuItem === 'featureThree' ? 'active' : ''}`} onClick={() => handleMenuItemClick('featureThree')}>
                <Music size={18} className='icon' /> 功能三
              </li>
              <li className={`nav-item ${activeMenuItem === 'settings' ? 'active' : ''}`} onClick={() => handleMenuItemClick('settings')}>
                <Settings size={18} className='icon' /> 设置
              </li>
              <li className={`nav-item ${activeMenuItem === 'screenshot' ? 'active' : ''}`} onClick={() => handleMenuItemClick('screenshot')}>
                <Camera size={18} className='icon' /> 截图功能
              </li>
            </ul>
          </>
        )}
        <div className='sidebar-footer'>
          {!sidebarCollapsed && <UpdateElectron />}
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className='main-content'>
        <header className='main-header'>
          {/* <h1>Electron + Vite + React</h1> */}
          
        </header>

        {/* 根据选中的菜单项显示不同的页面 */}
        {activeMenuItem === 'upload' && <UploadPage />}
        {activeMenuItem === 'featureTwo' && <FeatureTwoPage />}
        {activeMenuItem === 'featureThree' && <FeatureThreePage />}
        {activeMenuItem === 'settings' && <SettingsPage />}
        {activeMenuItem === 'screenshot' && <ScreenshotPage />}
      </main>
    </div>
  )
}

export default App

