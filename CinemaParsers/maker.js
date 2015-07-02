
var xmlName = '/ZoopalastSession.xml';

var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();
fs.readFile(__dirname + xmlName, function(err, data) {
    parser.parseString(data, function (err, result) {

    	var listOfHTTPRequests = [];
    	var transactions = result['charles-session']['transaction'];

    	for (var i = 0; i < transactions.length; i++) {

    		var transaction = transactions[i];

    		var request = transaction['request'][0];
    		var headers = request['headers'][0]['header'];
    		var body = request['body'];

    		console.log(transaction['$']);

    		var requestToExport = {};
    		var urlToExport = transaction['$']['protocol'] + '://' + transaction['$']['host'] + transaction['$']['path'];

    		if (transaction['$']['query']) {
    			urlToExport = urlToExport + '?' + transaction['$']['query'];
    		}

			var headersToExport = {};
			var methodToExport = transaction['$']['method'];
			var bodyToExport = (body) ? body[0] : {};

    		for (var j = 0; j < headers.length; j++) {
    			var header = headers[j];

    			headersToExport[header.name[0]] = header.value[0];

    		};

    		requestToExport['type'] = methodToExport;
    		requestToExport['url'] = urlToExport;
    		requestToExport['headers'] = headersToExport;
    		requestToExport['body'] = bodyToExport;

    		listOfHTTPRequests.push(requestToExport);
    	};

        writeToFile(listOfHTTPRequests);

        
    });
});

var writeToFile = function(dataToWrite) {

	var outputFilename = '.' + xmlName.split('.')[0] + 'Requests.js';

	fs.writeFile(outputFilename, JSON.stringify(dataToWrite, null, 4), function(err) {
    	if(err) {
      		console.log(err);
    	} else {
      		console.log("JSON saved to " + outputFilename);
    	}
	}); 

}
