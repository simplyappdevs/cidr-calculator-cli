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
import {Command, CommandArg} from './command';
import {getInfoCommandLineArgs} from './exec_info';

/**
 * SimplAppDevs Imports
 */
import {logger} from '@simplyappdevs/logging-helper';

/**
 * CommandsUsage definition
 */
interface CommandsUsage {
  maxCmdLen: number;
  cmdUsages: Array<[string, string]>;
}

/**
 * Module vars
 */
let appVersion: string = 'N/A';
let maxSwitchesLen: number = 0;

const depAppsVersion: Map<string, string> = new Map();
const cmdsUsage: CommandsUsage = {
  maxCmdLen: 0,
  cmdUsages: []
};
const cmds: Map<string, Command> = new Map();

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
        depAppsVersion.set(key, pkg.dependencies[key]);
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

    // get all commands
    cmdsUsage.cmdUsages.push(['version', 'Display version']);
    cmdsUsage.cmdUsages.push(['help <command>', 'Display help for a command (displays full usage if command is omitted)']);

    // info
    cmd = getInfoCommandLineArgs();
    cmds.set(cmd.command, cmd);
    cmdsUsage.cmdUsages.push([cmd.command, cmd.description]);

    // figure out the longest command
    cmdsUsage.maxCmdLen = cmdsUsage.cmdUsages.map((cmdUsage: [string, string]): number => {
      return cmdUsage[0].length;
    }).reduce((prevVal: number, curVal: number) => {
      if (curVal > prevVal) {
        return curVal;
      } else {
        return prevVal;
      }
    }, 0);

    // figure out the longest switch
    let tmpCmdArg: CommandArg | undefined;

    cmds.forEach((cmd: Command) => {
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
 * Returns command line arguments to show how to use the command
 * @param cmdArg Starting point of the command argument to print usage for
 */
function usageCommandBuildSwitches(cmdArg: CommandArg): string {
  let usage: string = '';

  usage = cmdArg.switches.reduce((acc: string, sw: string): string => {
    return `${acc}${acc === '' ? '' : '|'}${sw}`;
  }, '');

  usage += ` ${cmdArg.valuePatternText}`;

  if (cmdArg.nextCommandArg) {
    return `${usage} ${usageCommandBuildSwitches(cmdArg.nextCommandArg)}`;
  } else {
    return usage;
  }
}

/**
 * Prints Command usage
 * @param cmd Command object to print usage for
 * @param cmdArgs Starting point of the command argument to print usage for
 */
function usageCommand(cmd: Command, cmdArgs?: CommandArg): void {
  // prints command header
  console.log('');

  if (cmdArgs) {
    console.log(`  ${AppConstants.SCRIPTNAME} ${cmd.command} ${usageCommandBuildSwitches(cmdArgs)}`);
  } else {
    console.log(`  ${AppConstants.SCRIPTNAME} ${cmd.command}`);
  }
}

/**
 * Prints switches for CommandArg
 * @param cmdArg CommandArg to print switches for
 */
function usageCommandArgs(cmdArg: CommandArg): void {
  console.log('');

  cmdArg.switches.forEach((sw: string, index: number) => {
    if (index === 0) {
      // always show the first switch and description on the same line
      console.log(`    ${sw.padEnd(maxSwitchesLen, ' ')} : ${cmdArg.description}`);
    } else {
      console.log(`    ${sw}`);
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
    const cmdObj = cmds.get(cmd);

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
 * Print missing command
 * @param passedIn Command that was passed in
 */
export function usageMissingCommand(passedIn?: string): void {
  if (passedIn) {
    usageHeader();
    console.log('');

    console.log(`\x1b[31m${passedIn}\x1b[0m is an invalid command`);
  } else {
    usage();
  }
}

/**
 * Prints general usage information
 */
export function usage() {
  // header
  usageHeader();

  // get all of the commands usage
  if (cmdsUsage.maxCmdLen > 0) {
    console.log('');
    console.log(`${AppConstants.SCRIPTNAME} <command> <switches>`);
    console.log('');

    cmdsUsage.cmdUsages.forEach((cmdUsage: [string, string]) => {
      console.log(`  ${cmdUsage[0].padEnd(cmdsUsage.maxCmdLen, ' ')} : ${cmdUsage[1]}`);
    });
  }

  console.log('');
  console.log('Brought to you by SimplyAppDevs (c) 2021');
};