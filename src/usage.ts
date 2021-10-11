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
import {getUsageCommand as infoGetUsageCommand} from './exec_info';

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
const depAppsVersion: Map<string, string> = new Map();
const cmdsUsage: CommandsUsage = {
  maxCmdLen: 0,
  cmdUsages: []
};

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
    // get all commands
    cmdsUsage.cmdUsages.push(['version', 'Display version']);
    cmdsUsage.cmdUsages.push(['help <command>', 'Display help for a command (displays full usage if command is omitted)']);
    cmdsUsage.cmdUsages.push(infoGetUsageCommand());

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
    console.log(`Help on ${cmd}`);
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
    console.log('cidr <command> <switches>');
    console.log('');

    cmdsUsage.cmdUsages.forEach((cmdUsage: [string, string]) => {
      console.log(`  ${cmdUsage[0].padEnd(cmdsUsage.maxCmdLen, ' ')} : ${cmdUsage[1]}`);
    });
  }

  console.log('');
  console.log('Brought to you by SimplyAppDevs (c) 2021');
};