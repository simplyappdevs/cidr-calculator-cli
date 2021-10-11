/**
 * CLI Logic
 */

/**
 * App Imports
 */
import {default as parseCommandArguments, Command, ParsedActions, SelectedCommand} from './command';
import {default as execInfo, getInfoCommandLineArgs} from './exec_info';
import {usage, usageHelp, usageMissingCommand, usageVersion} from './usage';

/**
 * SimplyAppDevs Imports
 */
import {logger} from '@simplyappdevs/logging-helper';

/**
 * Module Initializations
 */
logger.init('CIDRAPP');

const CMDS = new Map<string, (selCmd: SelectedCommand)=> void>()

/**
 * Returns Command configuration
 * @returns Array of Command objects
 */
const configCommandArgs = (): Command[] => {
  const cmds: Command[] = [];
  let cmd: Command;

  // INFO
  cmd = getInfoCommandLineArgs();
  CMDS.set(cmd.command, execInfo);
  cmds.push(getInfoCommandLineArgs());

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
      case ParsedActions.Usage:
        usage();
        break;

      case ParsedActions.Help:
        usageHelp(selCmd ? selCmd.command : '');
        break;

      case ParsedActions.Version:
        usageVersion();
        break;

      case ParsedActions.MissingCommand:
        usageMissingCommand(argv.length > 0 ? argv[0] : '');
        break;

      case ParsedActions.MissingArg:
        console.log('Missing argument');
        break;

      case ParsedActions.ExecCommand:
        // the exec function is in the map and this should be valid all the time
        CMDS.get(selCmd!.command)!(selCmd!);
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