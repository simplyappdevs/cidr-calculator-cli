/**
 * Command + arguments builder
 */

/**
 * App Imports
 */
import {default as AppError, ErrorCodes} from './error';

/**
 * Command definition
 */
export interface Command {
  readonly command: string;
  readonly description: string;
  readonly args?: CommandArg[];
  addArgument(opts: CommandArgsOptions): CommandArg;
  addArgument(switches: string[], desc: string, valuePatternText: string, valuePatternRegEx: RegExp, defaultVal?: string): CommandArg;
}

/**
 * Command argument definition
 */
export interface CommandArg {
  readonly switches: string[];
  readonly description: string;
  readonly valuePatternText: string;
  readonly valuePatternRegEx: RegExp;
  readonly value: string;
  readonly nextCommandArg?: CommandArg;
  addArgument(opts: CommandArgsOptions): CommandArg;
  addArgument(switches: string[], desc: string, valuePatternText: string, valuePatternRegEx: RegExp, defaultVal?: string): CommandArg;
  setValue: (val: string) => boolean;
}

/**
 * Command line argument options definition
 */
export interface CommandArgsOptions {
  switches: string[];
  desc: string;
  valuePatternText: string;
  valuePatternRegEx: RegExp;
  defaultVal?: string;
}

/**
 * Implementation of Command
 */
export class CommandImpl implements Command {
  // class vars
  private _command: string = '';
  private _desc: string = '';
  private _args: CommandArg[] = [];

  /**
   * Creates new command
   * @param command Command
   * @param desc Command description
   */
  constructor(command: string, desc: string) {
    command = command.trim();

    if (command === '') {
      throw new AppError(ErrorCodes.PARAM_MISSING, 'command');
    }

    if (command.startsWith('-') || command.startsWith('--')) {
      throw new AppError(ErrorCodes.PARAM_INVALID, `${command}`);
    }

    this._command = command.toLowerCase();
    this._desc = desc.trim();
  }

  /**
   * Gets the command
   */
  public get command() : string {
    return this._command;
  }

  /**
   * Gets command description
   */
  public get description(): string {
    return this._desc;
  }

  /**
   * Gets command line arguments for the command
   */
  public get arguments(): CommandArg[] {
    return this._args;
  }

  /**
   * Add next argument
   * @param opts Command args options
   */
  addArgument(opts: CommandArgsOptions): CommandArg;

  /**
   * Add next argument
   * @param switches Switches for this argument
   * @param desc Description for this argument
   * @param valuePatternText Value pattern in text
   * @param valuePatternRegEx Value pattern in RegEx
   * @param defaultVal Default value if specified
   */
  addArgument(switches: string[], desc: string, valuePatternText: string, valuePatternRegEx: RegExp, defaultVal?: string): CommandArg;

  /**
   * Add next argument
   * @param firstArgs Switches for this argument or options object
   * @param desc Description for this argument
   * @param valuePatternText Value pattern in text
   * @param valuePatternRegEx Value pattern in RegEx
   * @param defaultVal Default value if specified
   * @returns CommandArg object for chaining
   */
  public addArgument(firstArgs: string[] | CommandArgsOptions, desc?: string, valuePatternText?: string, valuePatternRegEx?: RegExp, defaultVal?: string): CommandArg {
    let newArg: CommandArg;

    if (Array.isArray(firstArgs)) {
      newArg = new CommandArgImpl(firstArgs, desc || '', valuePatternText || '', valuePatternRegEx || /.*/gi, defaultVal);
    } else {
      newArg = new CommandArgImpl(firstArgs);
    }

    this._args.push(newArg);

    return newArg;
  }

}

/**
 * Implementation of CommandArg
 */
export class CommandArgImpl implements CommandArg {
  // class vars
  private _switches: string[] = [];
  private _desc: string = '';
  private _textPattern: string = '';
  private _regExPattern: RegExp = /.*/gi;
  private _value: string = '';
  private _nextArg?: CommandArg;

  /**
   * Creates new command argument
   * @param args Command args options
   */
  constructor(args: CommandArgsOptions);

  /**
   * Creates new command argument
   * @param switches Switches for this argument
   * @param desc Description for this argument
   * @param valuePatternText Value pattern in text
   * @param valuePatternRegEx Value pattern in RegEx
   * @param defaultVal Default value if specified
   */
  constructor(switches: string[], desc: string, valuePatternText: string, valuePatternRegEx: RegExp, defaultVal?: string);

  /**
   * Creates new command argument
   * @param firstArgs Either a CommandArgsOptions or string[]
   * @param desc Description for this argument
   * @param valuePatternText Value pattern in text
   * @param valuePatternRegEx Value pattern in RegEx
   * @param defaultVal Default value if specified
   */
  constructor(firstArgs: string[] | CommandArgsOptions, desc?: string, valuePatternText?: string, valuePatternRegEx?: RegExp, defaultVal?: string) {
    // check if first arg is array
    let argSwitches: string[], argDesc: string, argPatternText: string, argPatternRegEx: RegExp, argDefVal: string;

    if (Array.isArray(firstArgs)) {
      argSwitches = firstArgs as string[];
      argDesc = desc || '';
      argPatternText = valuePatternText || '';
      argPatternRegEx = valuePatternRegEx || /.*/gi;
      argDefVal = defaultVal || '';
    } else {
      argSwitches = firstArgs.switches;
      argDesc = firstArgs.desc;
      argPatternText = firstArgs.valuePatternText;
      argPatternRegEx = firstArgs.valuePatternRegEx;
      argDefVal = firstArgs.defaultVal || '';
    }

    // validate
    if (argSwitches.length < 1) {
      throw new AppError(ErrorCodes.PARAM_MISSING, 'command argument switches');
    } else {
      // trim all switches
      argSwitches = argSwitches.map((val: string, index: number): string => {
        val = val.trim();

        if (val === '') {
          throw new AppError(ErrorCodes.PARAM_INVALID, 'empty command argument switch')
        }

        return val;
      });
    }

    // check that it starts with -- and at least follow by 1 letter
    const testArg = /^[-]{1,2}[a-zA-Z]{1,}$/g;

    argSwitches.forEach((val: string, index: number) => {
      if (!testArg.test(val)) {
        throw new AppError(ErrorCodes.PARAM_INVALID, `${val}`)
      }
    });

    // create unique list
    argSwitches = argSwitches.filter((val: string, index: number, switches: string[]) => {
      return switches.indexOf(val) === index;
    });

    this._switches = argSwitches;
    this._desc = argDesc;
    this._textPattern = argPatternText;
    this._regExPattern = argPatternRegEx;
    this._value = argDefVal;
  }

  /**
   * Gets command line switches
   */
  public get switches(): string[] {
    return this._switches;
  }

  /**
   * Gets command line description
   */
  public get description(): string {
    return this._desc;
  }

  /**
   * Gets command line value pattern/description
   */
  public get valuePatternText(): string {
    return this._textPattern;
  }

  /**
   * Gets command line value regex pattern (used to make sure value is valid)
   */
  public get valuePatternRegEx(): RegExp {
    return this._regExPattern;
  }

  /**
   * Gets the command line value
   */
  public get value(): string {
    return this._value;
  }

  /**
   * Gets the next command line argument
   */
  public get nextCommandArg(): CommandArg | undefined {
    return this._nextArg;
  }

  /**
   * Add next argument
   * @param opts Command args options
   */
  addArgument(opts: CommandArgsOptions): CommandArg;

  /**
   * Add next argument
   * @param switches Switches for this argument
   * @param desc Description for this argument
   * @param valuePatternText Value pattern in text
   * @param valuePatternRegEx Value pattern in RegEx
   * @param defaultVal Default value if specified
   */
  addArgument(switches: string[], desc: string, valuePatternText: string, valuePatternRegEx: RegExp, defaultVal?: string) : CommandArg;

  /**
   * Add next argument
   * @param firstArgs Switches for this argument or options object
   * @param desc Description for this argument
   * @param valuePatternText Value pattern in text
   * @param valuePatternRegEx Value pattern in RegEx
   * @param defaultVal Default value if specified
   * @returns CommandArg object for chaining
   */
  public addArgument(firstArgs: string[] | CommandArgsOptions, desc?: string, valuePatternText?: string, valuePatternRegEx?: RegExp, defaultVal?: string): CommandArg {
    let newArg: CommandArg;

    if (Array.isArray(firstArgs)) {
      newArg = new CommandArgImpl(firstArgs, desc || '', valuePatternText || '', valuePatternRegEx || /.*/gi, defaultVal);
    } else {
      newArg = new CommandArgImpl(firstArgs);
    }

    this._nextArg = newArg;

    return newArg;
  }

  /**
   * Sets value if it matched the pattern (if failed previous value will not change)
   * @param val Value to set for this argument
   * @returns True if value matched the pattern and will be set, False otherwise and will not be set
   */
  public setValue(val: string): boolean {
    val = val.trim();

    if (this._regExPattern.test(val)) {
      this._value = val;
      return true;
    }
    else {
      return false;
    }
  }
}