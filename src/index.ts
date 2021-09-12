/**
 * CLI Logic
 */

/**
 * SimplyAppDevs Imports
 */
import {CIDRModule} from '@simplyappdevs/cidr-calculator';

/**
 * Entrypoing for cli
 * @param argv Command line arguments (pass process.argv.slice(2))
 * @returns Promise of the error code
 */
export default async function execCLI(argv: string[]): Promise<number> {
  let retVal: number = 0;

  try {
  } catch (e) {
    retVal = 1;

    // log err
    const err = e as Error;
    console.error(`ERR: ${err.message}`);
    console.error(err.stack);
  }

  return retVal;
}