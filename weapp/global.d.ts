// 全局类型定义
declare module '@tarojs/components' {
  export * from '@tarojs/components/types/index';
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Taro 全局对象
declare const Taro: typeof import('@tarojs/taro');

// 环境变量
interface ImportMeta {
  env: {
    MODE: string;
    BASE_URL: string;
    PROD: boolean;
    DEV: boolean;
  };
}

// 全局CSS变量
interface CSSStyleDeclaration {
  [key: string]: string | number;
}

// 小程序全局配置
interface Window {
  __taroAppConfig: any;
}