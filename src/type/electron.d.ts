export interface ScreenshotData {
  buffer: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ScreenshotSavedData {
  filepath: string;
}

export interface ElectronAPI {
  startScreenshot: () => Promise<void>;
  getDownloadsPath: () => Promise<string>;
  onScreenshotCaptured: (callback: (event: any, data: ScreenshotData) => void) => void;
  onScreenshotCancelled: (callback: () => void) => void;
  onScreenshotSaved: (callback: (event: any, data: ScreenshotSavedData) => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
