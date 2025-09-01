import React from 'react'
import { FileText } from 'lucide-react'

const FeatureTwoPage: React.FC = () => {
  return (
    <div className='feature-two-container'>
      <h2 className='feature-two-title'>
        <FileText size={24} className='feature-two-icon' /> 功能二
      </h2>
      <div className='feature-two-content'>
        <p>这是功能二的内容区域。</p>
        <p>您可以在此处实现所需的功能。</p>
        <div className='example-box'>
          <h3>示例功能</h3>
          <p>这是一个示例功能展示区域。</p>
        </div>
      </div>
    </div>
  )
}

export default FeatureTwoPage