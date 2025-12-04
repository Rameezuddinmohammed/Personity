/**
 * Structured Logger
 * 
 * Production-ready logging with context and levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Get minimum log level from environment
const getMinLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return envLevel;
  }
  // Default: debug in development, info in production
  return process.env.NODE_ENV === 'development' ? 'debug' : 'info';
};

const minLevel = getMinLevel();

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
};

const formatEntry = (entry: LogEntry): string => {
  const contextStr = entry.context 
    ? ` ${JSON.stringify(entry.context)}`
    : '';
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}`;
};

const createLogEntry = (level: LogLevel, message: string, context?: LogContext): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  context,
});

/**
 * Structured logger for the application
 */
export const logger = {
  /**
   * Debug level - detailed information for debugging
   */
  debug: (message: string, context?: LogContext): void => {
    if (!shouldLog('debug')) return;
    const entry = createLogEntry('debug', message, context);
    console.debug(formatEntry(entry));
  },

  /**
   * Info level - general operational information
   */
  info: (message: string, context?: LogContext): void => {
    if (!shouldLog('info')) return;
    const entry = createLogEntry('info', message, context);
    console.info(formatEntry(entry));
  },

  /**
   * Warn level - potentially harmful situations
   */
  warn: (message: string, context?: LogContext): void => {
    if (!shouldLog('warn')) return;
    const entry = createLogEntry('warn', message, context);
    console.warn(formatEntry(entry));
  },

  /**
   * Error level - error events that might still allow the app to continue
   */
  error: (message: string, error?: Error | unknown, context?: LogContext): void => {
    if (!shouldLog('error')) return;
    
    const errorContext: LogContext = { ...context };
    
    if (error instanceof Error) {
      errorContext.errorName = error.name;
      errorContext.errorMessage = error.message;
      if (process.env.NODE_ENV === 'development') {
        errorContext.stack = error.stack;
      }
    } else if (error) {
      errorContext.error = String(error);
    }
    
    const entry = createLogEntry('error', message, errorContext);
    console.error(formatEntry(entry));
  },

  /**
   * Create a child logger with preset context
   */
  child: (defaultContext: LogContext) => ({
    debug: (message: string, context?: LogContext) => 
      logger.debug(message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) => 
      logger.info(message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext) => 
      logger.warn(message, { ...defaultContext, ...context }),
    error: (message: string, error?: Error | unknown, context?: LogContext) => 
      logger.error(message, error, { ...defaultContext, ...context }),
  }),
};

// Convenience exports for common logging patterns
export const logConversation = logger.child({ module: 'conversation' });
export const logAI = logger.child({ module: 'ai' });
export const logAuth = logger.child({ module: 'auth' });
export const logFraud = logger.child({ module: 'fraud' });
export const logAnalysis = logger.child({ module: 'analysis' });
