// 假设AppConfig类型没有使用，可以移除
// import { AppConfig } from '@/type/electron';

/**
 * 大模型服务类，用于处理与大模型API的交互
 * 现在这个服务通过Electron的IPC与后端服务通信，不再直接进行网络请求
 */
class LLMService {
  /**
   * 发送消息到大模型并获取回复（非流式）
   * @param messages 消息列表
   * @returns 大模型的回复
   */
  async sendMessage(messages: { role: 'user' | 'assistant' | 'system', content: string }[]): Promise<string> {
    try {
      // 调用Electron API发送消息到后端处理
      const result = await window.electronAPI.sendLlmMessage(messages);
      // console.log('大模型回复:', result);
      if (!result.success) {
        throw new Error(result.error || '发送消息失败');
      }
      
      return result.data || '';
    } catch (error) {
      console.error('大模型请求错误:', error);
      throw error;
    }
  }

  /**
   * 发送消息到大模型并以流的形式获取回复
   * @param messages 消息列表
   * @param onChunk 接收流数据的回调函数
   * @param onComplete 完成时的回调函数
   * @param onError 错误时的回调函数
   */
  sendMessageStream(
    messages: { role: 'user' | 'assistant' | 'system', content: string }[],
    onChunk: (chunk: string) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): void {
    try {
      // 调用Electron API发送消息到后端处理
      window.electronAPI.sendLlmMessageStream(
        messages,
        (chunk: string) => {
          // console.log('流式数据块:', chunk);
          onChunk(chunk);
        },
        () => {
          // console.log('流式完成');
          if (onComplete) onComplete();
        },
        (error: string) => {
          console.error('流式错误:', error);
          if (onError) onError(new Error(error));
        }
      );
    } catch (error) {
      console.error('大模型流式请求错误:', error);
      if (onError) onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

// 创建单例实例
const llmService = new LLMService();

export default llmService;