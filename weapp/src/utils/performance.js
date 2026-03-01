// 性能优化工具函数

/**
 * 防抖函数 - 用于优化频繁触发的操作
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

/**
 * 节流函数 - 控制函数执行频率
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 内存缓存装饰器
 */
export function memoize(func, resolver) {
  const cache = new Map();
  
  return function(...args) {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * 批处理操作
 */
export class BatchProcessor {
  constructor(batchSize = 10, delay = 100) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.processing = false;
  }

  add(item) {
    this.queue.push(item);
    this.processIfNeeded();
  }

  addBatch(items) {
    this.queue.push(...items);
    this.processIfNeeded();
  }

  processIfNeeded() {
    if (!this.processing && this.queue.length > 0) {
      this.processing = true;
      setTimeout(() => this.processBatch(), this.delay);
    }
  }

  async processBatch() {
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      await this.processItems(batch);
    }
    this.processing = false;
  }

  async processItems(items) {
    // 子类需要实现具体的处理逻辑
    console.warn('BatchProcessor.processItems 未实现');
  }
}

/**
 * 异步任务队列
 */
export class AsyncTaskQueue {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  add(asyncFunc) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        asyncFunc,
        resolve,
        reject
      });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { asyncFunc, resolve, reject } = this.queue.shift();

    try {
      const result = await asyncFunc();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

/**
 * 数据预加载工具
 */
export class DataPreloader {
  constructor() {
    this.cache = new Map();
    this.loading = new Set();
  }

  async preload(key, loader) {
    // 如果已经在缓存中，直接返回
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // 如果正在加载中，等待完成
    if (this.loading.has(key)) {
      return new Promise(resolve => {
        const checkCache = () => {
          if (this.cache.has(key)) {
            resolve(this.cache.get(key));
          } else {
            setTimeout(checkCache, 10);
          }
        };
        checkCache();
      });
    }

    // 开始加载
    this.loading.add(key);
    try {
      const data = await loader();
      this.cache.set(key, data);
      return data;
    } finally {
      this.loading.delete(key);
    }
  }

  get(key) {
    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
    this.loading.clear();
  }

  clearKey(key) {
    this.cache.delete(key);
    this.loading.delete(key);
  }
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  start(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      count: (this.metrics.get(name)?.count || 0) + 1
    });
  }

  end(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      const duration = performance.now() - metric.startTime;
      metric.totalTime = (metric.totalTime || 0) + duration;
      metric.avgTime = metric.totalTime / metric.count;
      metric.lastTime = duration;
    }
  }

  getMetrics() {
    const result = {};
    for (const [name, metric] of this.metrics.entries()) {
      result[name] = {
        count: metric.count,
        totalTime: metric.totalTime,
        avgTime: metric.avgTime,
        lastTime: metric.lastTime
      };
    }
    return result;
  }

  reset() {
    this.metrics.clear();
  }
}

/**
 * 虚拟滚动优化
 */
export class VirtualScroller {
  constructor(container, itemHeight, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.items = [];
    this.visibleStart = 0;
    this.visibleEnd = 0;
    this.cachedElements = new Map();
  }

  updateItems(newItems) {
    this.items = newItems;
    this.calculateVisibleRange();
    this.render();
  }

  calculateVisibleRange() {
    const containerRect = this.container.getBoundingClientRect();
    const scrollTop = this.container.scrollTop;
    
    this.visibleStart = Math.floor(scrollTop / this.itemHeight);
    this.visibleEnd = Math.min(
      this.visibleStart + Math.ceil(containerRect.height / this.itemHeight) + 1,
      this.items.length
    );
  }

  render() {
    this.container.innerHTML = '';
    
    for (let i = this.visibleStart; i < this.visibleEnd; i++) {
      const item = this.items[i];
      const element = this.cachedElements.get(i) || this.renderItem(item, i);
      
      if (!this.cachedElements.has(i)) {
        this.cachedElements.set(i, element);
      }
      
      element.style.position = 'absolute';
      element.style.top = `${i * this.itemHeight}px`;
      element.style.width = '100%';
      
      this.container.appendChild(element);
    }
  }

  handleScroll = debounce(() => {
    this.calculateVisibleRange();
    this.render();
  }, 16);
}

// 导出所有工具
export default {
  debounce,
  throttle,
  memoize,
  BatchProcessor,
  AsyncTaskQueue,
  DataPreloader,
  PerformanceMonitor,
  VirtualScroller
};