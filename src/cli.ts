#!/usr/bin/env node
/**
 * CLI entrypoint
 */

/**
 * App Imports
 */
import {default as execCLI} from './index';

// exec CLI
(function () {
  return execCLI(process.argv.slice(2));
})();