import { app, BrowserWindow, shell, ipcMain, globalShortcut } from 'electron'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { update } from './update'
import llmService from '../services/llmService'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
let screenshots: any = null;
// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  // 在主进程 ready 后动态导入原生模块
  const Screenshots = require('electron-screenshots');
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
// 初始化截图工具
  screenshots = new Screenshots({
    lang: {
      // @ts-ignore 忽略类型检查，因为 operate 不在 Lang 类型中
      operate: {
        exit: '退出', 
        ok: '确认', 
        cancel: '取消',
        save: '保存',
        reset: '重选'
      }
    }
  });

  // 截图完成事件Uint8Array
  screenshots.on('ok', (e: any, buffer: Uint8Array, bounds: any) => {
    win?.webContents.send('screenshot-captured', {
      buffer: Buffer.from(buffer).toString("base64"),
      bounds
    });
  });

  screenshots.on('cancel', () => {
    win?.webContents.send('screenshot-cancelled');
  });

  screenshots.on('save', (e: any, buffer: Buffer, bounds: any) => {
    const fs = require('fs');
    const path = require('path');
    const downloadsPath = app.getPath('downloads');
    const filename = `screenshot-${Date.now()}.png`;
    const filepath = path.join(downloadsPath, filename);
    
    fs.writeFileSync(filepath, buffer);
    win?.webContents.send('screenshot-saved', { filepath });
  });

  // 注册全局快捷键
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    screenshots.startCapture();
  });
  // Auto update
  update(win)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// 配置文件处理
const configPath = path.join(app.getPath('userData'), 'config.json');

// 默认配置
const defaultConfig = {
  mode: 'light',
  notifications: true,
  language: 'zh',
  themeColor: '#3b82f6'
};

// 加载配置
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
    return defaultConfig;
  } catch (error) {
    console.error('Error loading config:', error);
    return defaultConfig;
  }
}

// 保存配置
function saveConfig(config: any) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    // 更新LLM服务的配置
    llmService.updateConfig(config);
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

// IPC 处理
ipcMain.handle('start-screenshot', () => {
  screenshots.startCapture();
});

// 处理LLM消息（非流式）
ipcMain.handle('send-llm-message', async (_, messages) => {
  try {
    const response = await llmService.sendMessage(messages);
    return { success: true, data: response };
  } catch (error) {
    console.error('LLM消息处理错误:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

// 处理LLM消息（流式）
ipcMain.on('send-llm-message-stream', (event, messages, chunkId, completeId, errorId) => {
  llmService.sendMessageStream(
    messages,
    (chunk) => {
      event.sender.send(chunkId, chunk);
    },
    () => {
      event.sender.send(completeId);
    },
    (error) => {
      event.sender.send(errorId, error.message);
    }
  );
});

ipcMain.handle('get-downloads-path', () => {
  return app.getPath('downloads');
});

// 配置相关 IPC 处理
ipcMain.handle('load-config', () => {
  const config = loadConfig();
  // 确保LLM服务有最新的配置
  llmService.updateConfig(config);
  return config;
});

ipcMain.handle('save-config', (_, config) => {
  return saveConfig(config);
});

// LLM服务相关 IPC 处理
ipcMain.handle('send-llm-message', async (_, messages) => {
  try {
    const response = await llmService.sendMessage(messages);
    return { success: true, data: response };
  } catch (error) {
    console.error('LLM消息发送失败:', error);
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
});


// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
