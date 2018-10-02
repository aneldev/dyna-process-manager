const name = process.argv[2];
const terminateAfter = Number(process.argv[3]);

console.log('Process Sample started (throw)');
if (process.argv.length < 4) {
  console.log('  Parameters not defined');
  console.log('  Syntax: <process name> <exit after ms>');
  console.log('  Example: MyAwesomeProcess 1000');
  process.exit(0);
}

console.log('  :::Name:::', name);
console.log('  This process will terminate with exception in', terminateAfter, 'ms');

setTimeout(function () {
  console.log('  Terminating...');
  throw new Error('CustomError');
}, terminateAfter);
