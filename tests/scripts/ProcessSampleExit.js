const name = process.argv[2];
const exitCode = Number(process.argv[3]);
const terminateAfter = Number(process.argv[4]);

console.log('Process Sample started (exit)');

if (process.argv.length < 5) {
  console.log('  Parameters not defined');
  console.log('  Syntax: <process name> <exit code> <exit after ms>');
  console.log('  Example: MyAwesomeProcess 0 1000');
  process.exit(0);
}

console.log('  :::Name:::', name);
console.log('  This process will terminate with exit code', exitCode, 'in', terminateAfter, 'ms');

setTimeout(function () {
  console.log('  Terminating...');
  process.exit(exitCode);
}, terminateAfter);
