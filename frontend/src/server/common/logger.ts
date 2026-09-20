export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  debug(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
      console.debug(`\x1b[90m${this.formatMessage(LogLevel.DEBUG, message, context)}\x1b[0m`);
    }
  }

  info(message: string, context?: Record<string, any>): void {
    console.log(`\x1b[36m${this.formatMessage(LogLevel.INFO, message, context)}\x1b[0m`);
  }

  warn(message: string, context?: Record<string, any>): void {
    console.warn(`\x1b[33m${this.formatMessage(LogLevel.WARN, message, context)}\x1b[0m`);
  }

  error(message: string, error?: any, context?: Record<string, any>): void {
    const errDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack, ...context }
      : { rawError: error, ...context };
    console.error(`\x1b[31m${this.formatMessage(LogLevel.ERROR, message, errDetails)}\x1b[0m`);
  }
}

export const logger = new Logger();
