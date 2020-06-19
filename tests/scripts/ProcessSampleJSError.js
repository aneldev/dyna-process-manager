const dynaNodeArguments = require("dyna-node-arguments").dynaNodeArguments;

const {
  name,
  crashAfter,
} = dynaNodeArguments;

console.log('Process Sample started (JS Error)');
if (!name || !crashAfter) {
  console.log('  Parameters not defined');
  console.log('  Syntax: --name <process name> --crashAfter <exit after ms>');
  console.log('  Example: MyAwesomeProcess 1000');
  process.exit(0);
}

console.log('  :::Name:::', name);
console.log('  This process will terminate with exception in', crashAfter, 'ms');

setTimeout(function () {
  console.log('  Crashing...');
  const name = null;
  const nameSize = name.length;
}, Number(crashAfter));
