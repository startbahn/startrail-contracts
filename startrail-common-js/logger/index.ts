/**
 * A simple logger that modules inside common js should use instead of using
 * console directly.
 *
 * Currently uses console and provides a flag to enable silencing of the
 * logging from external modules.
 *
 * TODO: change to use Winston and support log levels etc.
 */
class Logger {
  private static silent = false

  static setSilent(silent: boolean) {
    Logger.silent = silent
  }

  static info(...data: any[]): void {
    if (!Logger.silent) {
      console.info(...data)
    }
  }

  static error(...data: any[]): void {
    if (!Logger.silent) {
      console.error(...data)
    }
  }

  static warn(...data: any[]): void {
    if (!Logger.silent) {
      console.warn(...data)
    }
  }
}

export { Logger }
