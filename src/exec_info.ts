/**
 * Execute CIDR related commands
 */

/**
 * App Imports
 */
import {Command, CommandImpl, SelectedCommand} from './command';
import {default as OutputModule} from './output';
import {default as AppError, ErrorCodes} from './error';

/**
 * SimplyAppDevs Imports
 */
import {CIDR, CIDRModule} from '@simplyappdevs/cidr-calculator';

/**
 * Module initializations
 */
const MODCMD = new CommandImpl('info', 'CIDR information given a full CIDR notation or combination of IPv4 and CIDR block');

MODCMD.addArgument('cidr', ['-c', '--cidr'], 'CIDR notation', 'N.N.N.N/CB', /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/[0-9]{1,2}$/, '');

MODCMD.addArgument('ip', ['-i', '--ipv4'], 'IPv4 address', 'N.N.N.N', /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/, '')
  .addArgument('cb', ['-cb', '--cidr-block'], 'CIDR block', 'CB', /^[0-9]{1,2}$/, '');


/**
 * Returns command line configuration for CIDR related action
 */
export function getInfoCommandLineArgs(): Command {
  return MODCMD;
};

/**
 * Returns the CIDR command and description.
 * @returns Returns tupple of command and description
 */
export function getUsageCommand(): [string, string] {
  return [MODCMD.command, MODCMD.description]
};

/**
 * Prints help for cidr command
 * @param prefix Prefix for each new line
 */
export function getHelpCommand(prefix: string): string {
  return `
  `;
}

/**
 * Execute CIDR command
 * @param cmd Command to execute
 */
export default function execInfo(cmd: SelectedCommand): void {
  try {
    // validate
    if (cmd.command !== MODCMD.command) {
      throw new AppError(ErrorCodes.PARAM_INVALID, 'command is not for executing cidr');
    }

    if (!cmd.args) {
      throw new AppError(ErrorCodes.PARAM_INVALID, 'command does not have any command arguments');
    }

    if (cmd.args && (cmd.args.length > 1)) {
      throw new AppError(ErrorCodes.PARAM_INVALID, 'command has more than one command arguments');
    }

    // either accepts full cidr or ip + cidr block
    let queryIP: string = '';
    let queryCB: string = '';

    switch (cmd.args[0].name) {
      case 'cidr':
        // value is in ip/cb format
        [queryIP, queryCB] = cmd.args[0].value.split('/');
        break;

      case 'ip':
        queryIP = cmd.args[0].value;
        queryCB = cmd.args[0].nextCommandArg!.value;
        break;

      default:
        throw new AppError(ErrorCodes.PARAM_INVALID, 'command contains one or more invalid command arguments')
    }

    // calculate CIDR
    const res: CIDR = CIDRModule.parseCIDR(queryIP, queryCB);

    // output
    OutputModule.outputCIDR(res);
  } catch (err) {
    throw err;
  }
};