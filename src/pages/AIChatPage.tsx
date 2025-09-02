import React, { useState, useContext, useEffect } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { MessageSquare, PlusCircle, Trash2, Edit, X, Send, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react'
import llmService from '../services/llmService'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

// 对话接口定义
interface Conversation {
  id: string
  title: string
  messages: Message[]
}

// 消息接口定义
interface Message {
  id: string
  content: string
  isUser: boolean
  loading?: boolean
}

const AIChatPage: React.FC = () => {
  // 获取主题上下文
  // const { config, toggleMode } = useContext(ThemeContext)
  // if (!config) throw new Error('AIChatPage must be used within a ThemeProvider')

  // 状态管理
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: '默认对话',
      messages: [
        { id: '1-1', content: '你好！我是AI助手。', isUser: false },
        { id: '1-2', content: '你能帮我做什么？', isUser: true },
      ]
    }
  ])
  const [selectedConversationId, setSelectedConversationId] = useState<string>('1')
  const [newMessage, setNewMessage] = useState<string>('')
  // 跟踪当前正在编辑的对话ID，null表示没有对话正在编辑
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState<string>('')
  // 跟踪AI是否正在回复
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false)

  // 获取当前选中的对话
  const currentConversation = conversations.find(
    conv => conv.id === selectedConversationId
  )

  // 创建新对话
  const handleCreateConversation = () => {
    // 直接使用默认标题"新建对话"
    const newConv: Conversation = {
      id: Date.now().toString() + '-assistant',
      title: '新建对话',
      messages: [
        { id: 'init', content: '你好！我是AI助手。有什么可以帮到你的？', isUser: false }
      ]
    }

    setConversations([...conversations, newConv])
    setSelectedConversationId(newConv.id)
  }

  // 删除对话
  const handleDeleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== id)
    setConversations(updatedConversations)

    // 如果删除的是当前选中的对话，则选中第一个对话
    if (selectedConversationId === id && updatedConversations.length > 0) {
      setSelectedConversationId(updatedConversations[0].id)
    }
  }

  // 开始编辑标题
  const startEditingTitle = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id)
    if (conversation) {
      setEditingConversationId(id)
      setNewTitle(conversation.title)
    }
  }

  // 保存新标题
  const saveNewTitle = () => {
    if (!newTitle.trim() || !editingConversationId) return

    const updatedConversations = conversations.map(conv => {
      if (conv.id === editingConversationId) {
        return { ...conv, title: newTitle }
      }
      return conv
    })

    setConversations(updatedConversations)
    setEditingConversationId(null)
  }

  // 发送新消息
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation || !llmService) return

    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      isUser: true
    }

    // 检查是否是首次用户消息（初始只有一条AI消息）
    const isFirstUserMessage = currentConversation.messages.length === 1

    // 添加用户消息并更新标题（如果是首次消息）
    const updatedConversations = conversations.map(conv => {
      if (conv.id === currentConversation.id) {
        let updatedConv = { ...conv, messages: [...conv.messages, newMsg] }

        // 如果是首次用户消息，使用前5个字更新标题
        if (isFirstUserMessage) {
          const newTitle = newMessage.slice(0, 5)
          updatedConv = { ...updatedConv, title: newTitle }
        }

        return updatedConv
      }
      return conv
    })

    setConversations(updatedConversations)
    setNewMessage('')

    // 设置AI正在回复状态
    setIsAiResponding(true)

    // 添加加载状态的AI消息
    const loadingMsg: Message = {
      id: Date.now().toString() + '-user',
      content: '思考中...',
      isUser: false,
      loading: true
    }

    const withLoading = conversations.map(conv => {
      if (conv.id === currentConversation.id) {
        return { ...conv, messages: [...conv.messages, newMsg, loadingMsg] }
      }
      return conv
    })

    setConversations(withLoading)

    try {
      // 准备消息格式，转换为LLM服务需要的格式
      const messagesForLlm = currentConversation.messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }))

      // 添加当前新消息
      messagesForLlm.push({
        role: 'user' as const,
        content: newMessage
      })

      // 使用LLM服务进行流式发送
      llmService.sendMessageStream(
        messagesForLlm,
        (chunk) => {
          // 收到新的chunk时更新消息内容
          setConversations(prevConversations => {
            return prevConversations.map(conv => {
              if (conv.id === currentConversation.id) {
                const updatedMessages = conv.messages.map(msg => {
                  if (msg.id === loadingMsg.id) {
                    // 如果是首次收到chunk，替换'思考中...'，否则追加内容
                    const newContent = msg.content === '思考中...' ? chunk : msg.content + chunk;
                    return { ...msg, content: newContent, loading: false }
                  }
                  return msg;
                });
                return { ...conv, messages: updatedMessages };
              }
              return conv;
            });
          });
        },
        () => {
          // 流式完成时，标记loading为false并重置AI回复状态
          setConversations(prevConversations => {
            return prevConversations.map(conv => {
              if (conv.id === currentConversation.id) {
                const updatedMessages = conv.messages.map(msg => {
                  if (msg.id === loadingMsg.id) {
                    return { ...msg, loading: false }
                  }
                  return msg;
                });
                return { ...conv, messages: updatedMessages };
              }
              return conv;
            });
          });
          setIsAiResponding(false);
          console.log('流式对话完成');
        },
        (error) => {
          // 处理错误，重置AI回复状态
          setConversations(prevConversations => {
            return prevConversations.map(conv => {
              if (conv.id === currentConversation.id) {
                const updatedMessages = conv.messages.map(msg => {
                  if (msg.id === loadingMsg.id) {
                    return { ...msg, content: `请求失败: ${error.message}`, loading: false }
                  }
                  return msg;
                });
                return { ...conv, messages: updatedMessages };
              }
              return conv;
            });
          });
          setIsAiResponding(false);
        }
      );
    } catch (error) {
      // 处理错误
      const withError = conversations.map(conv => {
        if (conv.id === currentConversation.id) {
          const updatedMessages = conv.messages.map(msg => {
            if (msg.id === loadingMsg.id) {
              return { ...msg, content: `请求失败: ${error instanceof Error ? error.message : String(error)}`, loading: false }
        }
        setIsAiResponding(false);
            return msg
          })
          return { ...conv, messages: updatedMessages }
        }
        return conv
      })

      setConversations(withError)
    }
  }

  return (
    <div className='flex h-full' style={{ backgroundColor: 'var(--bg-color)', transition: 'background-color 0.3s ease' }} >
      {/* 左侧对话列表 */}
      <div className='flex-shrink-0 flex flex-col' style={{ width: sidebarCollapsed ? '60px' : '300px', backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', transition: 'background-color 0.3s ease, border-color 0.3s ease, width 0.3s ease' }}>
        <div className='p-4 border-b flex justify-between items-center' style={{ borderColor: 'var(--sidebar-border)', transition: 'border-color 0.3s ease' }}>
          {!sidebarCollapsed && (
            <h2 className='text-xl font-bold' style={{ color: 'var(--text-color)', transition: 'color 0.3s ease' }}>
              <MessageSquare className='inline-block mr-2' size={24} /> AI 聊天
            </h2>
          )}
          <div className='flex space-x-2'>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className='p-2 rounded-5 text-white'
              style={{
                backgroundColor: 'var(--theme-color)',
                transition: 'background-color 0.3s ease'
              }}
            >
              {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            {/* <button
              onClick={toggleMode}
              style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--text-color)', border: '1px solid var(--sidebar-border)', transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease' }}
              className='p-2 rounded-5 hover:bg-gray-300 dark:hover:bg-gray-700'
            >
              {config.mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button> */}
            <button
              onClick={handleCreateConversation}
              className='p-2 rounded-5 text-white'
              style={{
                backgroundColor: 'var(--theme-color)',
                transition: 'background-color 0.3s ease'
              }}
            >
              <PlusCircle size={20}/>
            </button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto'>
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              style={{
                backgroundColor: selectedConversationId === conversation.id ? 'var(--theme-color)' : 'transparent',
                borderBottom: `1px solid var(--sidebar-border)`,
                transition: 'background-color 0.3s ease, border-color 0.3s ease'
              }}
              className={`p-4 ${selectedConversationId !== conversation.id ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''}`}
            >
              {sidebarCollapsed ? (
                <div 
                  className='flex justify-center items-center h-8 cursor-pointer'
                  onClick={() => setSelectedConversationId(conversation.id)}
                >
                  <MessageSquare size={20} style={{ color: selectedConversationId === conversation.id ? 'white' : 'var(--text-color)' }} />
                </div>
              ) : editingConversationId === conversation.id ? (
                  <div className='flex items-center justify-between'>
                    <div className='flex-1 mr-2'>
                      <input
                        type='text'
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className='w-full border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500'
                        autoFocus
                      />
                    </div>
                    <div className='flex space-x-1'>
                      <button
                        onClick={saveNewTitle}
                        className='p-1 text-green-500 hover:text-green-700'
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingConversationId(null)}
                        className='p-1 text-gray-500 hover:text-gray-700'
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='flex justify-between items-center cursor-pointer' onClick={() => setSelectedConversationId(conversation.id)}>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-medium truncate' style={{ color: 'var(--text-color)', transition: 'color 0.3s ease' }}>{conversation.title}</h3>
                      <p className='text-sm truncate' style={{ color: 'var(--text-color)', opacity: 0.7, transition: 'color 0.3s ease, opacity 0.3s ease' }}>
                        {conversation.messages.length > 0
                          ? conversation.messages[conversation.messages.length - 1].content
                          : '无消息'}
                      </p>
                    </div>
                    <div className='flex space-x-1 ml-2'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditingTitle(conversation.id)
                        }}
                        className='p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                        style={{
                          color: 'var(--text-color)',
                          opacity: 0.7,
                          transition: 'opacity 0.3s ease, color 0.3s ease'
                        }}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteConversation(conversation.id)
                        }}
                        className='p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                        style={{
                          color: 'var(--text-color)',
                          opacity: 0.7,
                          transition: 'opacity 0.3s ease, color 0.3s ease'
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      {/* 右侧聊天区域 */}
      <div className='flex-1 flex flex-col h-full'>
        {currentConversation ? (
          <>{/* 聊天头部 */}
            {/* <div className='p-4 border-b flex justify-between items-center' style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)', transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
              <h3 className='font-medium' style={{ color: 'var(--text-color)', transition: 'color 0.3s ease' }}>{currentConversation.title}</h3>
              <button
                onClick={toggleMode}
                style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--text-color)', border: '1px solid var(--sidebar-border)', transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease' }}
                className='p-2 rounded-5 hover:bg-gray-300 dark:hover:bg-gray-700'
              >
                {config.mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div> */}

            {/* 聊天内容 */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4' style={{ backgroundColor: 'var(--bg-color)', transition: 'background-color 0.3s ease', height: '0' }}>
              {currentConversation.messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${message.isUser ? 'shadow-md' : 'shadow-sm'} ${message.loading ? 'animate-pulse' : ''}`}
                    style={{
                      backgroundColor: message.isUser ? 'var(--theme-color)' : 'var(--sidebar-bg)',
                      color: message.isUser ? 'white' : 'var(--text-color)',
                      transition: 'background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
                      boxShadow: message.isUser ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {message.isUser ? (
                      <div>{message.content}</div>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeHighlight]}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 输入区域 */}
            <div className='p-4 border-t' style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)', transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
                <div className='flex items-center gap-2'>
                  <input
                    type='text'
                    placeholder='输入消息...'
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isAiResponding && handleSendMessage()}
                    disabled={isAiResponding}
                    className='flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2'
                    style={{
                      backgroundColor: isAiResponding ? 'var(--disabled-bg)' : 'var(--bg-color)',
                      borderColor: 'var(--sidebar-border)',
                      color: 'var(--text-color)',
                      transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                      fontSize: '1rem',
                      cursor: isAiResponding ? 'not-allowed' : 'text'
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isAiResponding}
                    className='px-5 py-3 rounded-lg hover:shadow-md flex items-center justify-center gap-1'
                    style={{
                      backgroundColor: isAiResponding ? 'var(--disabled-theme)' : 'var(--theme-color)',
                      color: 'white',
                      transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                      fontWeight: '500',
                      cursor: isAiResponding ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Send size={18} /> 发送
                  </button>
                </div>
              </div>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center text-gray-500'>
            请选择或创建一个对话
          </div>
        )}
      </div>
    </div>
  )
}

export default AIChatPage