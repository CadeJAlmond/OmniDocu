/**
 * @file Logger Utility
 * @description Simple logging utility with levels and timestamps
 */

/**
 * Log level type
 */
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Log entry structure
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Format log entry for console output
 * @param entry - Log entry to format
 * @returns Formatted log string
 */
function formatLogEntry(entry: LogEntry): string {
  const timestamp = entry.timestamp.toISOString();
  const metaString = entry.meta ? JSON.stringify(entry.meta) : '';
  return `[${timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${metaString ? ' ' + metaString : ''}`;
}

/**
 * Log a message with specified level
 * @param level - Log level
 * @param message - Log message
 * @param meta - Additional metadata
 */
function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date(),
    meta,
  };

  if (isDevelopment) {
    console.log(formatLogEntry(entry));
  } else {
    // In production, use structured JSON logging
    console.log(JSON.stringify(entry));
  }
}

/**
 * Logger instance with standardized methods
 */
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
};