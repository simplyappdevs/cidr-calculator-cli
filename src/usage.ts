/**
 * Usage Module
 *
 * Print usage for this application. General usage is in this module
 * but specific action/command will be delegated to the owning modules.
 */

/**
 * App Imports
 */
const pkg = require('../package.json');   // leaving this as require() to indicate it is not a module

import {AppConstants} from './constants';
import {Command, CommandArg, SelectedCommand, SelectedCommandArg} from './command';
import {getInfoCommandLineArgs} from './exec_info';

/**
 * SimplAppDevs Imports
 */
import {logger} from '@simplyappdevs/logging-helper';

/**
 * Module vars
 */
let appVersion: string = 'N/A';   // app/cli version from package.json
let maxCommandLen: number = 0;    // max length between all Command
let maxSwitchesLen: number = 0;   // max length between all switches in CommandArgs

const DEPSVERSION: Map<string, string> = new Map();    // deps version from package.json
const ALLCOMMANDS: Map<string, Command> = new Map();   // all commands

// initialize
const modLogger = logger.createModuleLogger('USAGE');

/**
 * Retrieve app information from package.json
 */
const getAppInformation = (): void => {
  try {
    // version
    appVersion = pkg.version;

    // app dependencies
    if (pkg.dependencies) {
      Object.keys(pkg.dependencies).forEach((key: string) => {
        DEPSVERSION.set(key, pkg.dependencies[key]);
      });
    }
  } catch (err) {
    // log as warning
    modLogger.logWarning('getVersions()', err as Error, undefined, 'GET-VER-PKGJSON');
  }
};

// get
getAppInformation();

/**
 * Builds the commands and descriptions
 */
const getCommandsUsage = (): void => {
  try {
    let cmd: Command;

    /**
     * Workaround for now to "hardcode" version and help commands
     */
    cmd = {
      command: 'version',
      description: 'Display version',
      addArgument: (): CommandArg => {return {} as CommandArg}
    };
    ALLCOMMANDS.set(cmd.command, cmd);

    cmd = {
      command: 'help <command>',
      description: 'Display help for a command (displays full usage if command is omitted)',
      addArgument: (): CommandArg => {return {} as CommandArg;}
    };
    ALLCOMMANDS.set(cmd.command, cmd);

    // info
    cmd = getInfoCommandLineArgs();
    ALLCOMMANDS.set(cmd.command, cmd);

    // figure out the longest command
    ALLCOMMANDS.forEach((cmd: Command) => {
      if (cmd.command.length > maxCommandLen) {
        maxCommandLen = cmd.command.length;
      }
    });

    // figure out the longest switch
    let tmpCmdArg: CommandArg | undefined;

    ALLCOMMANDS.forEach((cmd: Command) => {
      // only act with cmd that has args
      if (cmd.args) {
        cmd.args.forEach((cmdArg: CommandArg) => {
          // simple loop for linked link - loop while current object is valid
          tmpCmdArg = cmdArg;

          while (tmpCmdArg) {
            // reduce for swtiches array to get max length - note that max length is a module
            // variable and will be fed into all switches reduce calls
            maxSwitchesLen = tmpCmdArg.switches.reduce((acc: number, sw: string): number => {
              return sw.length > acc ? sw.length : acc;
            }, maxSwitchesLen);

            tmpCmdArg = tmpCmdArg.nextCommandArg;
          }
        });
      }
    });
  } catch (err) {
    // log as warning
    modLogger.logWarning('getCommandsUsage()', err as Error, undefined, 'GET-CMDS-USAGE');
  }
};

// get commands usage
getCommandsUsage();

/**
 * Prints header
 */
function usageHeader(): void {
  console.log(`\x1b[4mCIDR Calculator v${appVersion}\x1b[0m`);
  console.log('');
  console.log('Utility to display Classless Inter-Domain Routing (CDIR) information.');
}

/**
 * Returns usage for switches in CommandArg or SelectedCommandArg (recurse through linked-list)
 * @param cmdArg CommandArg or SelectedCommandArg
 */
function usageCommandBuildSwitchesUsage(cmdArg: CommandArg | SelectedCommandArg): string {
  let usage: string = '';

  usage = cmdArg.switches.reduce((acc: string, sw: string): string => {
    return `${acc}${acc === '' ? '' : '|'}${sw}`;
  }, '');

  usage += ` ${cmdArg.valuePatternText}`;

  if (cmdArg.nextCommandArg) {
    // recurse to the next CommandArg
    return `${usage} ${usageCommandBuildSwitchesUsage(cmdArg.nextCommandArg)}`;
  } else {
    return usage;
  }
}

/**
 * Prints Command or SelectedCommand usage
 * @param cmd Command or SelectedCommand object to print usage
 * @param cmdArgs CommandArg or SelectedCommandArg
 */
function usageCommand(cmd: Command | SelectedCommand, cmdArgs?: CommandArg | SelectedCommandArg): void {
  // prints command header
  console.log('');

  if (cmdArgs) {
    console.log(`    ${AppConstants.SCRIPTNAME} \x1b[34m${cmd.command}\x1b[0m ${usageCommandBuildSwitchesUsage(cmdArgs)}`);
  } else {
    console.log(`    ${AppConstants.SCRIPTNAME} \x1b[34m${cmd.command}\x1b[0m`);
  }
}

/**
 * Prints CommandArg or SelectedCommandArg usage
 * @param cmdArg CommandArg or SelectedCommandArg
 */
function usageCommandArgs(cmdArg: CommandArg | SelectedCommandArg): void {
  console.log('');

  cmdArg.switches.forEach((sw: string, index: number) => {
    if (index === 0) {
      // always show the first switch and description on the same line
      console.log(`      ${sw.padEnd(maxSwitchesLen, ' ')} : ${cmdArg.description}`);
    } else {
      console.log(`      ${sw}`);
    }
  });

  // print next one
  if (cmdArg.nextCommandArg) {
    usageCommandArgs(cmdArg.nextCommandArg);
  }
}

/**
 * Prints app version
 */
export function usageVersion() {
  console.log(`v${appVersion}`);
};

/**
 * Prints help
 * @param cmd Command to show help for
 */
export function usageHelp(cmd?: string): void {
  if (cmd) {
    // get the Command object
    const cmdObj = ALLCOMMANDS.get(cmd);

    if (cmdObj) {
      // found the command
      usageHeader();

      console.log('');
      console.log(`  ${cmdObj.description}`);

      if (cmdObj.args) {
        // has arguments
        cmdObj.args.forEach((cmdArgs: CommandArg) => {
          usageCommand(cmdObj, cmdArgs);
          usageCommandArgs(cmdArgs);
        });
      } else {
        // no arguments
        usageCommand(cmdObj);
      }
    } else {
      usage();
    }
  } else {
    usage();
  }
};

/**
 * Prints missing or invalid command
 * @param passedIn Command that was passed in
 */
export function usageMissingCommand(passedIn?: string): void {
  if (passedIn) {
    // invalid command
    usageHeader();

    console.log('');
    console.log(`\x1b[31m${passedIn}\x1b[0m is an invalid command`);
  } else {
    // full usage since nothing was passed in
    usage();
  }
}

/**
 * Prints missing argument(s) for a Command (which means one or more expected CommandArgs were not set to non-empty value)
 * @param cmd SelectedCommand object
 */
export function usageMissingArguments(cmd: SelectedCommand) {
  usageHeader();

  console.log('');
  console.log(`\x1b[31mMissing one or more arguments for ${cmd.command}\x1b[0m`);

  console.log('');
  console.log(`  ${cmd.description}`);

  if (cmd.args) {
    cmd.args.forEach((cmdArgs: SelectedCommandArg) => {
      usageCommand(cmd, cmdArgs);
      usageCommandArgs(cmdArgs);
    });
  }
}

/**
 * Prints general usage information
 */
export function usage() {
  // header
  usageHeader();

  // get all of the commands usage
  if (maxCommandLen > 0) {
    console.log('');
    console.log(`${AppConstants.SCRIPTNAME} <command> <switches>`);
    console.log('');

    ALLCOMMANDS.forEach((cmd: Command) => {
      console.log(`  ${cmd.command.padEnd(maxCommandLen, ' ')} : ${cmd.description}`);
    });
  }

  console.log('');
  console.log('Brought to you by SimplyAppDevs (c) 2021');
};