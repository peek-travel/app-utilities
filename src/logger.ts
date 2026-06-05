/**
 * Minimal structured logger interface the package can write diagnostics to.
 *
 * Consumers may supply their own implementation (e.g. wrapping an existing
 * application logger). When none is provided the package stays completely
 * silent via {@link noopLogger}.
 */
export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

/** A {@link Logger} that discards everything. Used as the default. */
export const noopLogger: Logger = {
  info() {},
  warn() {},
  error() {},
};
