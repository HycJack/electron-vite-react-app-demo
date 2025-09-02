import { ipcRenderer, contextBridge } from 'electron'
import { ElectronAPI, ScreenshotData, ScreenshotSavedData, AppConfig } from '../../src/type/electron';

// 扩展ElectronAPI接口以支持流式消息
declare module '../../src/type/electron' {
  interface ElectronAPI {
    sendLlmMessageStream(
      messages: { role: 'user' | 'assistant' | 'system', content: string }[],
      onChunk: (chunk: string) => void,
      onComplete: () => void,
      onError: (error: string) => void
    ): void;
  }
}

const electronAPI: ElectronAPI = {
  startScreenshot: () => ipcRenderer.invoke('start-screenshot'),
  getDownloadsPath: () => ipcRenderer.invoke('get-downloads-path'),
  onScreenshotCaptured: (callback: (event: any, data: ScreenshotData) => void) => 
    ipcRenderer.on('screenshot-captured', callback),
  onScreenshotCancelled: (callback: () => void) =>
    ipcRenderer.on('screenshot-cancelled', callback),
  onScreenshotSaved: (callback: (event: any, data: ScreenshotSavedData) => void) =>
    ipcRenderer.on('screenshot-saved', callback),
  removeAllListeners: (channel: string) => 
    ipcRenderer.removeAllListeners(channel),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (config: AppConfig) => ipcRenderer.invoke('save-config', config),
  sendLlmMessage: (messages) => ipcRenderer.invoke('send-llm-message', messages),
  sendLlmMessageStream: (messages, onChunk, onComplete, onError) => {
    // 设置一次性监听器以接收流式响应
    const chunkId = 'llm-stream-chunk-' + Date.now();
    const completeId = 'llm-stream-complete-' + Date.now();
    const errorId = 'llm-stream-error-' + Date.now();

    ipcRenderer.on(chunkId, (_, chunk) => onChunk(chunk));
    ipcRenderer.on(completeId, () => {
      ipcRenderer.removeAllListeners(chunkId);
      ipcRenderer.removeAllListeners(completeId);
      ipcRenderer.removeAllListeners(errorId);
      onComplete();
    });
    ipcRenderer.on(errorId, (_, error) => {
      ipcRenderer.removeAllListeners(chunkId);
      ipcRenderer.removeAllListeners(completeId);
      ipcRenderer.removeAllListeners(errorId);
      onError(error);
    });

    // 发送消息到主进程
    ipcRenderer.send('send-llm-message-stream', messages, chunkId, completeId, errorId);
  }
};
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)