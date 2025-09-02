import { AppConfig } from "@/type/electron";


/**
 * 默认配置
 */
const defaultConfig: AppConfig = {
  darkMode: false,
  notifications: true,
  language: 'zh',
  themeColor: '#3b82f6'
};

/**
 * 加载配置
 * @returns 应用配置
 */
const loadConfig = async (): Promise<AppConfig> => {
  try {
    const config = await window.electronAPI.loadConfig();
    return { ...defaultConfig, ...config };
  } catch (error) {
    console.error('加载配置失败:', error);
    return defaultConfig;
  }
};

/**
 * 保存配置
 * @param config 应用配置
 * @returns 是否保存成功
 */
const saveConfig = async (config: AppConfig): Promise<boolean> => {
  try {
    await window.electronAPI.saveConfig(config);
    return true;
  } catch (error) {
    console.error('保存配置失败:', error);
    return false;
  }
};

export { loadConfig, saveConfig, defaultConfig };