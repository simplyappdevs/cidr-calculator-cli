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
 * Selected Command definition
 */
export interface SelectedCommand {
  readonly command: string;
  readonly description: string;
  readonly args?: SelectedCommandArg[];
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
 * Selected CommandArg definition
 */
export interface SelectedCommandArg {
  readonly switches: string[];
  readonly description: string;
  readonly valuePatternText: string;
  readonly valuePatternRegEx: RegExp;
  readonly value: string;
  readonly nextCommandArg?: SelectedCommandArg;
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
  public get args(): CommandArg[] {
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
export default function parseCommandArguments(cmds: Command[], argv: string[]): [ParsedActions, SelectedCommand?] {
  // retvals
  let action: ParsedActions = ParsedActions.Success;
  let cmd: Command | undefined;
  let selCmd: SelectedCommand | undefined;

  // validate
  if (cmds.length < 1) {
    throw new AppError(ErrorCodes.PARAM_INVALID, `command array is empty`);
  }

  if (argv.length < 1) {
    // display usage of this program
    return [ParsedActions.Usage, undefined];
  }

  // command must be the first item in the argv
  // TODO: future support for subcommand
  cmd = cmds.find((val: Command, index: number) => {
    return val.command.toLowerCase() === argv[0].toLowerCase();
  });

  if (!cmd) {
    // display Command usage
    action = ParsedActions.Usage;
  } else if (!(cmd.args) || (cmd.args.length < 1)) {
    // command with out switches
    action = ParsedActions.Success;
    selCmd = selectCommand(cmd);
  } else {
    // since we don't support nested command - we go to args next
    argv = argv.slice(1);

    // convert argv into a Map
    // expect -switch (or --switch) and followed by value as the next token
    // if next token match switch pattern, then we just set the value to ''
    const args = convertArgvtoMap(argv);

    /**
     * The next section matches each expected command args set with
     * what was passed in.
     *
     * Important to remember that cmd (Command) object has args (CommandArg) array
     * which is the start of set of switches. So, if there are 3 elements in the args
     * array, that means there are 3 sets of switches for this comment.
     *
     * Each CommandArg set (starts as an element in args array) has a linked-list to next switches in the
     * same set.
     *
     * cmd.args[0.0]=>[0.1]=>[0.2] means the first set has 3 different switches in it
     * cmd.args[1.0]=>[1.1] means the second set has 2 different switches in it
     */

    const cmdArgsWithValueCount = new WeakMap<CommandArg, number>();  // for each CommandArg set, keep the number of switches specified in command line args
    const totalCmdArgsCount = new WeakMap<CommandArg, number>();      // for each CommandArg set, count total number of switches

    let cmdArgs: CommandArg[] = [];   // flattens linked-list to array
    let valueSetCount: number = 0;
    let nextCA: CommandArg;

    cmd.args.forEach((cmdArg: CommandArg, index: number) => {
      // reset counters
      valueSetCount = 0;
      cmdArgs = [];

      // match the first CommandArg switches (the beginning of a CommandArg set)
      if (matchCommandArg(cmdArg, args)) {
        ++valueSetCount;
      }

      // we only record CommandArg with at least the first switch its value set. If not, we consider
      // this set not specified (so cmdArgsWithValueCount will have value = 0 for this CommandArg)
      if (valueSetCount > 0) {
        // first switch in the CommandArg set
        cmdArgs.push(cmdArg);

        // temp pointer
        nextCA = cmdArg;

        // walk through the linked-list
        while (nextCA.nextCommandArg) {
          nextCA = nextCA.nextCommandArg;
          cmdArgs.push(nextCA);

          if (matchCommandArg(nextCA, args)) {
            ++valueSetCount;
          }
        }
      }

      // total # of switches for this CommandArg set
      totalCmdArgsCount.set(cmdArg, cmdArgs.length);

      // total # of switches with value for this CommandArg set
      cmdArgsWithValueCount.set(cmdArg, valueSetCount);
    });

    /**
     * Loop through the CommandArg set with the lowest number of switches
     * and breakout as soon as we find one with all values set
     */
    // convert map to array first
    const cmdArgsWithCount: Array<{cmdArg: CommandArg, count: number;}> = new Array<{cmdArg: CommandArg, count: number;}>();

    cmd.args.forEach((cmdArg: CommandArg, index: number) => {
      cmdArgsWithCount.push({cmdArg: cmdArg, count: totalCmdArgsCount.get(cmdArg)!});
    });

    // sort
    cmdArgsWithCount.sort((a: {cmdArg: CommandArg, count: number;}, b: {cmdArg: CommandArg, count: number;}): number => {
      return a.count < b.count ? -1 : a.count > b.count ? 1 : 0;
    });

    // loop cmdArgsWithCount to convert CommandArg into SelectedCommandArg
    // and set the selectedCmdArg for the first one with all values set
    const selectedCmdArgs: SelectedCommandArg[] = [];
    let selectedCmdArg: SelectedCommandArg | undefined;
    let cmdArgToSelectedCmdArg: SelectedCommandArg;

    cmdArgsWithCount.forEach((argWithCount: {cmdArg: CommandArg, count: number;}, index: number) => {
      cmdArgToSelectedCmdArg = selectCommandArg(argWithCount.cmdArg);
      selectedCmdArgs.push(cmdArgToSelectedCmdArg);

      if ((!selectedCmdArg) && (argWithCount.count === cmdArgsWithValueCount.get(argWithCount.cmdArg))) {
        selectedCmdArg = cmdArgToSelectedCmdArg;
      }
    });

    if (selectedCmdArg) {
      // clone the Command to only have the selected CommandArgs
      selCmd = selectCommand(cmd);

      // display usage for this command and for this commandargs
      action = ParsedActions.Usage;
    } else {
      // display usage of this Command
      action = ParsedActions.Usage;
    }
  }

  return [action, selCmd];
};

/**
 * Return array of switches and values as Map<string, string>
 * @param argv Array of switches and values
 * @returns Map<string, string> of argv
 */
const convertArgvtoMap = (argv: string[]): Map<string, string> => {
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

        // reset key
        key = '';
      } else {
        // error out since we encounter non-switch not preceeded by one
        throw new AppError(ErrorCodes.CMDARG_NOKEY, argv[0]);
      }
    }

    // remove first element
    argv = argv.slice(1);
  }

  return args;
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
      // the idea here is if value is not set, we don't want to overwrite the value already exist in the CommandArg object
      // which can be set by other switch or as default value
      if (swVal !== '') {
        cmdArg.setValue(swVal); // setValue() does other validation and this may throw exception
      }
    }

    // consider matched if value is not empty
    // do not use swVal since CommandArg object may have the value set already
    if (cmdArg.value !== '') {
      found = true;
    }
  });

  return found;
};

/**
 * Converts Command to SelectedCommand
 * @param cmd Command to convert to SelectedCommand
 * @param cmdArg CommandArg to convert to SelectedCommandArg
 * @returns SelectedCommand
 */
const selectCommand = (cmd: Command, cmdArg?: CommandArg): SelectedCommand => {
  return {
    command:  cmd.command,
    description: cmd.description,
    args: cmdArg? [selectCommandArg(cmdArg)] : undefined
  };
};

/**
 * Converts CommandArg to SelectedCommandArg
 * @param cmdArg CommandArg to convert to SelectedCommandArg
 * @returns SelectedCommandArg
 */
const selectCommandArg = (cmdArg: CommandArg): SelectedCommandArg => {
  return {
    switches: cmdArg.switches,
    description: cmdArg.description,
    valuePatternText: cmdArg.valuePatternText,
    valuePatternRegEx: cmdArg.valuePatternRegEx,
    value: cmdArg.value,
    nextCommandArg: cmdArg.nextCommandArg? selectCommandArg(cmdArg.nextCommandArg) : undefined
  }
};