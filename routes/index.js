var express = require('express');
var snmp = require ("net-snmp");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
 	res.render('index', { title: 'Express'});
});



router.get('/metrics', function(req, res) {
	var session = snmp.createSession ("localhost", "public", {version: snmp.Version1});

var sysDescr = {name: "sysDescr", oid: "1.3.6.1.2.1.1.1.0", description: "System description", value: ""};
var sysUpTime = {name: "sysUpTime", oid: "1.3.6.1.2.1.1.3.0", description: "System uptime", value: ""};
var hrSystemProcesses = {name: "hrSystemProcesses", oid: "1.3.6.1.2.1.25.1.6.0", description: "The number of process contexts currently loaded or running on this system." 
						, value: ""};
var hrMemorySize = {name: "hrMemorySize", oid: "1.3.6.1.2.1.25.2.2.0", description: "The amount of physical read-write main memory, typically RAM, contained by the host."
						, value: ""};

var textMetrics = [sysDescr,sysUpTime,hrSystemProcesses,hrMemorySize];
var oids = [];

//make oids array
for (var i = 0; i < textMetrics.length; i++) {
	oids[i] = textMetrics[i].oid;
};

	session.get (oids, function (error, varbinds) {
	    if (error) {
	        console.error (error.toString ());
	    } else {
	    	for (var i = 0; i < varbinds.length; i++) {
	    		textMetrics[i].value = varbinds[i].value.toString();
	    	};
	        //res.render('index', { textMetrics: textMetrics, varbinds: varbinds });
	        res.json(textMetrics);
	    }
	});

});



module.exports = router;