const name = process.argv[2];
const crashAfter = Number(process.argv[3]);

console.log('Process Sample started (throw)');
if (process.argv.length < 4) {
  console.log('  Parameters not defined');
  console.log('  Syntax: <process name> <exit after ms>');
  console.log('  Example: MyAwesomeProcess 1000');
  process.exit(0);
}

console.log('  :::Name:::', name);
console.log('  This process will terminate with exception in', crashAfter, 'ms');

setTimeout(function () {
  console.log('  Crashing...');
  throw new Error('CustomError');
}, crashAfter);
