if (typeof process !== "undefined") {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection', {promise, reason});
  });
}
