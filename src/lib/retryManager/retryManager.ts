export interface IRetryManager {
  try(id: string | number): void;
  register(id: string | number, callback: (...args: any[]) => void): IItem;
  stop(id: string | number): void;
  remove(id: string | number): void;
  reset(id: string | number): void;
}

type RetryManagerSettings = {
  maxRetries?: number;
  initialRetryInterval?: number;
  isExponentialBackoff?: boolean;
  failHandler?: () => void;
};

type TimeoutId = number;

export default class RetryManager implements IRetryManager {
  private maxRetries: number;
  private initialRetryInterval: number;
  private isExponentialBackoff: boolean;
  private commonFailHandler: null | (() => void);
  private repository: Map<string | number, IItem>;
  private timers: Map<string | number, TimeoutId | undefined>;

  constructor(settings?: RetryManagerSettings) {
    const {
      maxRetries = 5,
      initialRetryInterval = 1000,
      isExponentialBackoff = true,
      failHandler,
    } = settings || {};
    this.maxRetries = maxRetries;
    this.initialRetryInterval = initialRetryInterval;
    this.isExponentialBackoff = isExponentialBackoff;
    this.commonFailHandler = failHandler || null;
    this.repository = new Map();
    this.timers = new Map();
  }

  try(id: string | number) {
    const item = this.repository.get(id);
    if (!item) return;

    if (item.retriesCount < this.maxRetries) {
      if (item.beforeCallHandler)
        item.beforeCallHandler({
          timesCalled: item.retriesCount,
          nextCallDelay: item.currentInterval,
        });

      setTimeout(() => item.callee(), item.currentInterval);
      item.retriesCount++;
      if (this.isExponentialBackoff) {
        item.currentInterval *= 2;
      }
    } else {
      const failHandler = item.failHandler || this.commonFailHandler;
      if (failHandler) failHandler();
    }
  }

  register(id: string | number, callback: (...args: any[]) => void): IItem {
    const item = new Item(callback, this.initialRetryInterval);
    this.repository.set(id, item);
    this.timers.set(id, undefined);
    return item;
  }

  stop(id: string | number) {
    const timerId = this.timers.get(id);
    if (timerId) {
      clearTimeout(timerId);
      this.timers.set(id, undefined);
    }
  }

  remove(id: string | number) {
    this.repository.delete(id);
    const timerId = this.timers.get(id);
    if (timerId) {
      clearTimeout(timerId);
      this.timers.delete(id);
    }
  }

  reset(id: string | number): void {
    const item = this.repository.get(id);
    if (item) item.reset();
  }
}

interface IItem {
  currentInterval: number;
  retriesCount: number;
  callee: () => void;
  beforeCallHandler: BeforeCallHandler | null;
  failHandler: (() => void) | null;
  reset: () => void;
  setFailHandler: (handler: () => void) => this;
  setBeforeCallHandler: (handler: BeforeCallHandler) => this;
  setInitialRetryInterval: (delay: number) => this;
}

type BeforeCallHandler = ({
  timesCalled,
  nextCallDelay,
}: {
  timesCalled: number;
  nextCallDelay: number;
}) => void;

class Item implements IItem {
  private initialRetryInterval: number;
  public currentInterval: number;
  public retriesCount: number;
  public callee: () => void;
  public beforeCallHandler: BeforeCallHandler | null;
  public failHandler: (() => void) | null;

  constructor(callback: () => void, initialRetryInterval?: number) {
    this.initialRetryInterval = initialRetryInterval || 1000;
    this.currentInterval = initialRetryInterval || 1000;
    this.retriesCount = 0;
    this.callee = callback;
    this.beforeCallHandler = null;
    this.failHandler = null;
    return this;
  }

  reset() {
    this.currentInterval = this.initialRetryInterval;
    this.retriesCount = 0;
  }

  setFailHandler(handler: () => void) {
    this.failHandler = handler;
    return this;
  }

  setBeforeCallHandler(handler: BeforeCallHandler) {
    this.beforeCallHandler = handler;
    return this;
  }

  setInitialRetryInterval(delay: number) {
    this.currentInterval = delay;
    return this;
  }
}
