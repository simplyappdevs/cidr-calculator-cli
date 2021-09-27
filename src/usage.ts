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
import {getUsageCommand as cidrGetUsageCommand} from './exec_cidr';

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
const cmdsUsage: CommandsUsage = new Array();

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
    cmdsUsage.cmdUsages.push(cidrGetUsageCommand());

    // figure out the longest command
    cmdsUsage.cmdUsages.reduce()
  } catch (err) {
    // log as warning
    modLogger.logWarning('getCommandsUsage()', err as Error, undefined, 'GET-CMDS-USAGE');
  }
};

/**
 * Prints app version
 */
export function usageVersion() {
  console.log(`v${appVersion}`);
};

/**
 * Prints general usage information
 */
export function usage() {
  console.log(`CIDR Calculator v${appVersion}`);
  console.log('');
  console.log('Utility to display Classless Inter-Domain Routing (CDIR) information.');

  // get all of the commands usage

};