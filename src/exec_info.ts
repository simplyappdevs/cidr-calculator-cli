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

/**
 * Initialize command arguments
 */
function initCommandArgs() {
  MODCMD.addArgument('cidr', ['-c', '--cidr'], 'CIDR notation', '<N.N.N.N>/<1-32>', /^(([0-9]|[1-9][0-9]|[1][0-9][0-9]|[2][0-5][0-5])\.){3}([0-9]|[1-9][0-9]|[1][0-9][0-9]|[2][0-5][0-5])\/([1-9]|[1-2][0-9]|[3][0-2])$/, '');

  MODCMD.addArgument('ip', ['-i', '--ipv4'], 'IPv4 address (N is a number between 0 and 255)', '<N.N.N.N>', /^(([0-9]|[1-9][0-9]|[1][0-9][0-9]|[2][0-5][0-5])\.){3}([0-9]|[1-9][0-9]|[1][0-9][0-9]|[2][0-5][0-5])$/, '')
    .addArgument('cb', ['-cb', '--cidr-block'], 'CIDR block (number between 1 and 32)', '<1-32>', /^([1-9]|[1-2][0-9]|[3][0-2])$/, '');
}

initCommandArgs();

/**
 * Returns command line configuration for CIDR related action
 */
export function getInfoCommandLineArgs(): Command {
  return MODCMD;
};

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