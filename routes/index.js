var express = require('express');
var snmp = require ("net-snmp");
var router = express.Router();
var session = snmp.createSession ("localhost", "public", {version: snmp.Version1});

/* GET home page. */
router.get('/', function(req, res) {
 	res.render('index', { title: 'Express'});
});


// GET metrics
router.get('/metrics', function(req, res) {

	var sysDescr = {name: "sysDescr", oid: "1.3.6.1.2.1.1.1.0", description: "System description", value: ""};
	var sysUpTime = {name: "sysUpTime", oid: "1.3.6.1.2.1.1.3.0", description: "System uptime", value: ""};
	var hrSystemProcesses = {name: "hrSystemProcesses", oid: "1.3.6.1.2.1.25.1.6.0", description: "The number of process contexts currently loaded or running on this system." 
							, value: ""};
	var hrMemorySize = {name: "hrMemorySize", oid: "1.3.6.1.2.1.25.2.2.0", description: "The amount of physical read-write main memory, typically RAM, contained by the host."
							, value: ""};
	var ifNumber = {name: "ifNumber", oid: "1.3.6.1.2.1.2.1.0", description: "The number of network interfaces present on this system.", value: ""};

	var textMetrics = [sysDescr,sysUpTime,hrSystemProcesses,hrMemorySize, ifNumber];
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


// GET chart data
router.get('/chart', function(req, res) {

	var ifNumber = req.query.ifNumber;

	var ifDescr = {name: "ifDescr", oid: "1.3.6.1.2.1.2.2.1.2." + ifNumber, description: "Interface Name", value: ""};

	// taxa de Kbytes enviados e recebidos por segundo
	var ifInOctets = {name: "ifInOctets", oid: "1.3.6.1.2.1.2.2.1.10." + ifNumber, description: "The total number of octets received on the interface,including framing characters."
							, value: ""};
	var ifOutOctets = {name: "ifOutOctets", oid: "1.3.6.1.2.1.2.2.1.16." + ifNumber, description: "The total number of octets sent on the interface,including framing characters."
							, value: ""};

	// pacotes ICMP Echo Requests recebidos por segundo
	var icmpInEchosReps = {name: "icmpInEchosReps", oid: "1.3.6.1.2.1.5.9.0", description: "The number of ICMP Echo Reply messages received."
							, value: ""};

	// taxa de segmentos TCP enviados e recebidos por segundo
	var tcpInSegs = {name: "tcpInSegs", oid: "1.3.6.1.2.1.6.10.0", description: "The total number of segments received, including those received in error"
							, value: ""};
	var tcpOutSegs = {name: "tcpOutSegs", oid: "1.3.6.1.2.1.6.11.0", description: "The total number of segments sent, including those on current connections but excluding those containing only retransmitted octets."
							, value: ""};

	// quantidade de pacotes SNMP recebidos por segundo
	var snmpInPkts = {name: "snmpInPkts", oid: "1.3.6.1.2.1.11.1.0", description: "The total number of messages delivered to the SNMP entity from the transport service."
							, value: ""};

	var chartMetrics = [ifDescr,ifInOctets,ifOutOctets,icmpInEchosReps,tcpInSegs, tcpOutSegs,snmpInPkts];
	var oids = [];

	//make oids array
	for (var i = 0; i < chartMetrics.length; i++) {
		oids[i] = chartMetrics[i].oid;
	};
	console.log(oids);

		session.get (oids, function (error, varbinds) {
		    if (error) {
		        console.error (error.toString ());
		    } else {
		    	for (var i = 0; i < varbinds.length; i++) {
		    		chartMetrics[i].value = varbinds[i].value.toString();
		    	};
		        //res.render('index', { chartMetrics: chartMetrics, varbinds: varbinds });
		        res.json(chartMetrics);
		    }
		});

});



module.exports = router;