/**
 * CLI Logic
 */

/**
 * App Imports
 */
import {default as parseCommandArguments, Command, CommandImpl, ParsedActions} from './command';
import {default as execCIDR, getCIDRCommandLineArgs} from './exec_cidr';
import {usage} from './usage';

/**
 * SimplyAppDevs Imports
 */
import {logger} from '@simplyappdevs/logging-helper';

// initialize logger
logger.init('CIDRAPP');

/**
 * Returns Command configuration
 * @returns Array of Command objects
 */
const configCommandArgs = (): Command[] => {
  const cmds: Command[] = [];

  cmds.push(getCIDRCommandLineArgs());

  return cmds;
};

/**
 * Entrypoing for cli
 * @param argv Command line arguments (pass process.argv.slice(2))
 * @returns Promise of the error code
 */
export default async function execCLI(argv: string[]): Promise<number> {
  let retVal: number = 0;

  try {
    // config
    const cmds = configCommandArgs();

    // parse command lines
    const [action, selCmd] = parseCommandArguments(cmds, argv);

    switch (action) {
      case ParsedActions.FullUsage:
        usage();
        break;

      case ParsedActions.Usage:
        console.log('Show command usage');
        break;

      case ParsedActions.Help:
        console.log('Show help');
        break;

      case ParsedActions.Version:
        console.log('Show version');
        break;

      case ParsedActions.MissingCommand:
        console.log('Missing command');
        break;

      case ParsedActions.MissingArg:
        console.log('Missing argument');
        break;

      case ParsedActions.Success:
        switch (selCmd?.command) {
          case 'cidr':
            execCIDR(selCmd);
            break;
        }

        break;
    }
  } catch (e) {
    retVal = 1;

    // log err
    const err = e as Error;
    console.error(`ERR: ${err.message}`);
    console.error(err.stack);
  }

  return retVal;
}