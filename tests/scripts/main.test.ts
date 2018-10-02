declare let jasmine: any, describe: any, expect: any, it: any;

if (typeof jasmine !== 'undefined') jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;

// help: https://facebook.github.io/jest/docs/expect.html

describe.skip('Internal module test', () => {
	it('should do this', () => {
		expect(true).toBe(true);
	});
});
