var logger = require('./logger');
var Client = require('node-rest-client').Client;

module.exports = function PublicPackageStore(config) {
	var publicBowerUrl = config.publicRegistry || 'http://bower.herokuapp.com/packages/';

	function createClient() {
		var clientOptions;
		if (config.proxySettings && config.proxySettings.enabled) {
			clientOptions = {
				proxy: {
					host: config.proxySettings.host,
					port: config.proxySettings.port,
					user: config.proxySettings.username,
					password: config.proxySettings.password,
					tunnel: config.proxySettings.tunnel
				}
			};
		}
		return new Client(clientOptions);
	}

	function processData(data) {
		if (data.indexOf('Not Found') !== -1) {
			return;
		}
		try {
			return JSON.parse(data);
		} catch (e) {
			logger.error('Could not load public packages');
		}
	}

	function _getPackage(packageName, callback) {
		var client = createClient();
		client.get(publicBowerUrl + packageName, function (data) {
            callback(null, processData(data));
		}).on('error', function (err) {
			console.log('something went wrong on the request', err.request.options);
			callback(err, null);
		});

		client.on('error', function (err) {
			console.error('Something went wrong on the client', err);
			callback(err, null);
		});
	}

	function _searchPackage(name, callback) {
        var client = createClient();
        client.get(publicBowerUrl + 'search/' + name, function (data) {
            callback(null, processData(data));
        }).on('error', function (err) {
            console.log('something went wrong on the request', err.request.options);
            callback(err, null);
        });

        client.on('error', function (err) {
            console.error('Something went wrong on the client', err);
            callback(err, null);
        });
	}

	return {
		getPackage: _getPackage,
		searchPackage: _searchPackage
	};
};