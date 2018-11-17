const fs = require('fs');
const moduleSetup = require('./module-setup');
const package_ = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const webpackDefaultSetup = require('./webpack.dist.default.config');
const webpackWebSetup = require('./webpack.dist.web.config');
const webpackNodeSetup = require('./webpack.dist.node.config');

[
	'./web.js',
	'./web.js.map',
	'./node.js',
	'./node.js.map',
].forEach(file => {
	if (fs.existsSync(file)) fs.unlinkSync(file);
});

const config = [];

if (moduleSetup.defaultTarget) {
	config.push(webpackDefaultSetup);
	console.log('module-setup: Build "' + package_.name + '", targeting', webpackDefaultSetup.target);
}
if (moduleSetup.outputWeb) {
	config.push(webpackWebSetup);
	console.log('module-setup: Build "' + package_.name + '/web"');
}
if (moduleSetup.outputNode) {
	config.push(webpackNodeSetup);
	console.log('module-setup: Build "' + package_.name + '/node"');
}

if (config.length === 0) {
	console.log('module-setup: Error there is nothing defined to build, check the `/nodule-setup.js`');
}

module.exports = config;
