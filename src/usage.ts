/**
 * Usage Module
 *
 * Print usage for this application. General usage is in this module
 * but specific action/command will be delegated to the owning modules.
 */

/**
 * Module vars
 */
let appVersion: string = 'N/A';

/**
 * App Imports
 */
const pkg = require('../package.json');   // leaving this as require() to indicate it is not a module

/**
 * SimplAppDevs Imports
 */
import {logger} from '@simplyappdevs/logging-helper';

// initialize
const modLogger = logger.createModuleLogger('USAGE');

/**
 * Retrieve versions from package.json
 */
const getVersions = async (): Promise<void> => {
  try {
    // read
    console.log(pkg.version);
  } catch (err) {
    // log as warning
    modLogger.logWarning('getVersions()', err as Error, undefined, 'GET-VER-PKGJSON');
  }
};

getVersions();

export function usage() {
  console.log(`version: ${appVersion}`);
};