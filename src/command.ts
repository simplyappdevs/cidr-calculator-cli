/**
 * Command + arguments builder
 */

/**
 * App Imports
 */
import {default as AppError, ErrorCodes} from './error';

/**
 * Constants
 */
const switchTest: RegExp = /^[\-]{1,2}[a-zA-Z]{1}[a-zA-Z0-9\-]{0,}/;

/**
 * Action needed after parsing arguments
 */
export enum ParsedActions {
  Success = 0,
  MissingCommand = 1,
  MissingArg = 2,
  Help = 3,
  Usage = 4,
  Version = 5
}

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
    argSwitches.forEach((val: string, index: number) => {
      if (!switchTest.test(val)) {
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

/**
 * Parse array of command line arguments
 * @param cmds Array of commands for this program
 * @param argv Command line arguments (excludes node and script path if from process.argv - pass process.argv.slice(2))
 * @returns Tupple of action to take and the command specified
 */
const parseCommandArguments = (cmds: Command[], argv: string[]): [ParsedActions, Command?] => {
  // retvals
  let action: ParsedActions = ParsedActions.Success;
  let cmd: Command | undefined;

  // validate
  if (cmds.length < 1) {
    throw new AppError(ErrorCodes.PARAM_INVALID, `command array is empty`);
  }

  if (argv.length < 1) {
    return [ParsedActions.Usage, undefined];
  }

  // command(s) must be in sequence
  cmd = cmds.find((val: Command, index: number) => {
    return val.command.toLowerCase() === argv[0].toLowerCase();
  });

  if (!cmd) {
    action = ParsedActions.Usage;
  } else if (!cmd.args || (cmd.args.length < 1)) {
    // command with out switches
    action = ParsedActions.Success;
  } else {
    // since we don't support nested command - we go to args next
    argv = argv.slice(1);

    // break up array into Map
    const args = new Map<string, string>();

    let key: string = '';

    while (argv.length > 0) {
      if (switchTest.test(argv[0])) {
        // this is a switch
        if (key !== '') {
          // key already set but value is not
          args.set(key, '');
        }

        key = argv[0];
      } else {
        // this is value
        if (key !== '') {
          // has key
          args.set(key, argv[0]);
        } else {
          // error out
          throw new AppError(ErrorCodes.CMDARG_NOKEY, argv[0]);
        }
      }

      // remove 0
      argv = argv.slice(1);
    }

    // loop through all CommandArgs and count how many matches for each
    const cmdArgsWithValueCount = new WeakMap<CommandArg, number>();
    const totalCmdArgsCount = new WeakMap<CommandArg, number>();

    let cmdArgs: CommandArg[] = [];
    let valueSetCount: number = 0;
    let nextCA: CommandArg;

    cmd.args.forEach((cmdArg: CommandArg, index: number) => {
      // reset counters
      valueSetCount = 0;
      cmdArgs = [];

      // match the first CommandArg switches
      if (matchCommandArg(cmdArg, args)) {
        ++valueSetCount;
      }

      if (valueSetCount > 0) {
        // matched the first CmdArg - let's continue down this path
        cmdArgs.push(cmdArg);

        // temp pointer
        nextCA = cmdArg;

        while (nextCA.nextCommandArg) {
          nextCA = nextCA.nextCommandArg;
          cmdArgs.push(nextCA);

          if (matchCommandArg(nextCA, args)) {
            ++valueSetCount;
          }
        }
      }

      // total # of CommandArgs in this linked link - it will be > 0 only if the first CommandArg value is set
      totalCmdArgsCount.set(cmdArg, cmdArgs.length);

       // total CommandArgs  with value set - it will be > 0 only if the first CommandArg value is set
      cmdArgsWithValueCount.set(cmdArg, valueSetCount);
    });

    // get all CommandArgs with matched
    cmdArgs = cmd.args.filter((cmdArg: CommandArg, index: number) => {
      return cmdArgsWithValueCount.get(cmdArg)! > 0;
    });

    if (cmdArgs.length === 0) {
      // just one

    }
  }

  return [action, cmd];
};

/**
 * Returns whether CommandArgs value set or not
 * @param cmdArg Command argument to look for in command line arguments
 * @param args Command line arguments
 * @returns True if value of CommandArg is set, False otherwise
 */
const matchCommandArg = (cmdArg: CommandArg, args: Map<string, string>): boolean => {
  // find first switch
  let swVal: string = '';
  let found: boolean = false;

  cmdArg.switches.forEach((sw: string, index: number) => {
    if (args.has(sw)) {
      // found it
      swVal = args.get(sw) || '';

      // only set value if it is not empty
      if (swVal !== '') {
        cmdArg.setValue(swVal);
      }
    }

    // consider matched if value is not empty (this is to support switch without value but value has been set during configuration as default value)
    if (cmdArg.value !== '') {
      found = true;
    }
  });

  return found;
};