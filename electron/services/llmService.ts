import { AppConfig } from '../../src/type/electron';
import axios, { AxiosRequestConfig } from 'axios'; // 使用已安装的axios包进行网络请求
import { Readable } from 'stream';

/**
 * 大模型服务类，用于处理与大模型API的交互
 * 此服务在Electron主进程中运行，更安全地处理API密钥和网络请求
 */
class LLMService {
  private config: AppConfig | null = null;

  /**
   * 更新配置
   * @param newConfig 新的配置
   */
  updateConfig(newConfig: AppConfig) {
    this.config = newConfig;
  }

  /**
   * 发送消息到大模型并获取回复
   * @param messages 消息列表
   * @returns 大模型的回复
   */
  async sendMessage(messages: { role: 'user' | 'assistant' | 'system', content: string }[]): Promise<string> {
    if (!this.config?.apiKey) {
      throw new Error('未配置API Key，请在设置中填写');
    }

    const { modelId, baseUrl, apiKey } = this.config;

    try {
      const response = await axios.post(`${baseUrl}/chat/completions`, {
        model: modelId,
        messages: messages,
        temperature: 0.7
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('大模型请求错误:', error);
      throw error;
    }
  }

  /**
   * 流式发送消息到大模型并获取回复
   * @param messages 消息列表
   * @param onChunk 接收流式数据的回调
   * @param onComplete 完成回调
   * @param onError 错误回调
   */
  sendMessageStream(
    messages: { role: 'user' | 'assistant' | 'system', content: string }[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): void {
    if (!this.config?.apiKey) {
      onError(new Error('未配置API Key，请在设置中填写'));
      return;
    }

    const { modelId, baseUrl, apiKey } = this.config;

    const config: AxiosRequestConfig = {
      method: 'post',
      url: `${baseUrl}/chat/completions`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      data: {
        model: modelId,
        messages: messages,
        temperature: 0.7,
        stream: true // 启用流式响应
      },
      responseType: 'stream'
    };

    axios(config)
      .then(response => {
        const stream = response.data as Readable;

        let buffer = '';
        const chunkSeparator = 'data: ';

        stream.on('data', (data: Buffer) => {
          buffer += data.toString('utf8');

          // 处理缓冲区中的所有块
          while (true) {
            const separatorIndex = buffer.indexOf(chunkSeparator);
            if (separatorIndex === -1) break;

            // 找到结束标记
            const endIndex = buffer.indexOf('\n\n', separatorIndex);
            if (endIndex === -1) break;

            // 提取并处理块
            const chunkData = buffer.substring(separatorIndex + chunkSeparator.length, endIndex).trim();
            buffer = buffer.substring(endIndex + 2); // 跳过\n\n
            if (chunkData === '[DONE]') {
              onComplete();
              break;
            }

            try {
              const parsed = JSON.parse(chunkData);
              if (parsed.choices && parsed.choices.length > 0) {
                const content = parsed.choices[0].delta?.content || '';
                if (content) {
                  onChunk(content);
                }
              }
            } catch (e) {
              console.error('解析流式数据错误:', e);
            }
          }
        });

        stream.on('end', () => {
          onComplete();
        });

        stream.on('error', (error) => {
          console.error('流式请求错误:', error);
          onError(error);
        });
      })
      .catch(error => {
        console.error('流式请求发起错误:', error);
        onError(error instanceof Error ? error : new Error(String(error)));
      });
  }
}

// 创建单例实例
const llmService = new LLMService();

export default llmService;