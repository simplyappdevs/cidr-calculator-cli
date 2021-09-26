/**
 * Program output
 */

/**
 * App Imports
 */
import {SelectedCommand, SelectedCommandArg} from './command';

/**
 * SimplyAppDevs Imports
 */
import {CIDR, CIDRInformation, CIDRModule, OCTECTS} from '@simplyappdevs/cidr-calculator';

/**
 * Prints out CIDRInformation
 * @param cidrInfo CIDRInformation object
 */
const outputCIDRInformation = (cidrInfo: CIDRInformation): void => {
  try {
    let typicalUsage: string = 'Network';
    let usableIPs: number = 0;

    switch (cidrInfo.cidrBlock) {
      case 32:
        typicalUsage = 'Host Route';
        usableIPs = cidrInfo.totalIPs;

        break;

      case 31:
        typicalUsage = 'Point-to-Point Link';
        usableIPs = cidrInfo.totalIPs;

        break;

      case 30:
        typicalUsage = 'Point-to-Point Links (Glue Network)';
        usableIPs = cidrInfo.totalIPs - 2; // this is the smallest network with network + broadcast IP

        break;

      default:
        usableIPs = cidrInfo.totalIPs - 2; // this is the smallest network with network + broadcast IP

        break;
    }

    console.log('');
    console.log('CIDR Information');
    console.log(`  CIDR            : ${cidrInfo.networkPrefix}/${cidrInfo.cidrBlock}`);
    console.log(`  Network Prefix  : ${cidrInfo.networkPrefix}`);
    console.log(`  Broadcast IP    : ${cidrInfo.broadcastIP}`);
    console.log(`  Subnet Mask     : ${cidrInfo.subnetMask}`);
    console.log(`  Wilcard Mask    : ${cidrInfo.wilcardMask}`);
    console.log(`  Start IP        : ${cidrInfo.minIP}`);
    console.log(`  End IP          : ${cidrInfo.maxIP}`);
    console.log(`  # of Usable IPs : ${usableIPs}`);
    console.log(`  Typical Use     : ${typicalUsage}`);

  } catch (e) {
    throw e;
  }
};

/**
 * Prints out CIDR Information
 * @param cmd Command that was excuted
 * @param res Result from parsing CIDR information
 */
const outputCIDR = (res: CIDR): void => {
  try {
    console.log('');
    console.log('Input');
    console.log(`  IPv4            : ${res.inputIP}`);
    console.log(`  CIDR Block      : ${res.inputCIDR}`);

    outputCIDRInformation(res.cidrInformation);

    console.log('');
    console.log(`Subnetting        : ${res.maxSubnetCount > 0 ? res.maxSubnetCount.toString() : '0'}`);

  } catch (e) {
    throw e;
  }
};

/**
 * Output module
 */
const OutputModule = {
  outputCIDR: outputCIDR
};

// export default
export default OutputModule;