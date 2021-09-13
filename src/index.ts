/**
 * CLI Logic
 */

/**
 * SimplyAppDevs Imports
 */
import {CIDRModule} from '@simplyappdevs/cidr-calculator';
import {default as parseCommandArguments, Command, CommandImpl} from './command';

/**
 * Returns command line arguments configuration
 * @returns Command object
 */
const configCommandArgs = (): Command => {
  const cmd = new CommandImpl('cidr', 'Get CIDR information');

  cmd.addArgument(['-c', '--cidr'], 'CIDR notation', 'N.N.N.N/CB', /.*/, '');

  cmd.addArgument(['-i', '--ipv4'], 'IPv4 address', 'N.N.N.N', /.*/)
    .addArgument(['-cb', '--cidr-block'], 'CIDR block', 'CB', /.*/);

  return cmd;
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
    const cmd = configCommandArgs();

    // parse command lines
    const [action, selCmd] = parseCommandArguments([cmd], argv);

    console.log(action);
    console.log(JSON.stringify(selCmd, undefined, 2));
  } catch (e) {
    retVal = 1;

    // log err
    const err = e as Error;
    console.error(`ERR: ${err.message}`);
    console.error(err.stack);
  }

  return retVal;
}