/**
 * Extends Error
 */

/**
 * Error codes
 */
export enum ErrorCodes {
  PARAM_START = 10000,
  PARAM_MISSING = PARAM_START + 1,
  PARAM_INVALID = PARAM_START + 2,
  PARAM_END = PARAM_START + 9999,
  CMDARG_START = PARAM_END + 1,
  CMDARG_NOKEY = CMDARG_START + 1,
  CMDARG_END = CMDARG_START + 9999
}

/**
 * Custom app error
 */
export default class AppError extends Error {
  // class vars
  private _errCode: number = 0;

  /**
   * Creates new error
   * @param errCode Error code
   */
  constructor(errCode: number);

  /**
   * Creates new error
   * @param errCode Error code
   * @param msg Error message
   */
  constructor(errCode: number, msg: string);

  /**
   * Creates new error
   * @param errCode Error code
   * @param msg Error message
   */
  constructor(errCode: number, msg?: string) {
    // TODO: future add msg looking if not specified using error code
    super(msg || `Error ${errCode}`);
  }
}