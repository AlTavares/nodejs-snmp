var express = require('express');
var snmp = require ("net-snmp");
var router = express.Router();
var porco;

var session;

function createSnmpSession(ipAddress, community){
	session = snmp.createSession (ipAddress, community, {version: snmp.Version1});
}

/* GET home page. */
router.get('/', function(req, res) {
	createSnmpSession("127.0.0.1","public");
 	res.render('index', { title: 'Express'});
});

router.get('/create_session', function(req, res) {
	createSnmpSession(req.query.ip, req.query.community);
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

	var textMetrics = {sysDescr : sysDescr,
					   sysUpTime : sysUpTime,
					   hrSystemProcesses : hrSystemProcesses,
					   hrMemorySize : hrMemorySize,
					   ifNumber : ifNumber
					   };
	var oids = [];
	var keys = [];

	//make oids array
	for (var metric in textMetrics) {
		keys.push(metric);
		oids.push(textMetrics[metric].oid);
	};
		session.get (oids, function (error, varbinds) {
		    if (error) {
		        console.error (error.toString ());
		    } else {
		    	for (var i = 0; i < varbinds.length; i++) {
		    		textMetrics[keys[i]].value = varbinds[i].value.toString();
		    	};
		        //res.render('index', { textMetrics: textMetrics, varbinds: varbinds });
		        res.json(textMetrics);
		    }
		});

});


// GET chart data
router.get('/chart', function(req, res) {
	
	var ifNumber = req.query.ifNumber;

	var ifDescr = {oid: "1.3.6.1.2.1.2.2.1.2." + ifNumber, description: "Interface Name", value: ""};

	// taxa de Kbytes enviados e recebidos por segundo
	var ifInOctets = {oid: "1.3.6.1.2.1.2.2.1.10." + ifNumber, description: "The total number of octets received on the interface,including framing characters."
						, value: ""};
	var ifOutOctets = {oid: "1.3.6.1.2.1.2.2.1.16." + ifNumber, description: "The total number of octets sent on the interface,including framing characters."
						, value: ""};

	// pacotes ICMP Echo Requests recebidos por segundo
	var icmpInEchosReps = {oid: "1.3.6.1.2.1.5.9.0", description: "The number of ICMP Echo Reply messages received."
						, value: ""};

	// taxa de segmentos TCP enviados e recebidos por segundo
	var tcpInSegs = {oid: "1.3.6.1.2.1.6.10.0", description: "The total number of segments received, including those received in error"
							, value: ""};
	var tcpOutSegs = {oid: "1.3.6.1.2.1.6.11.0", description: "The total number of segments sent, including those on current connections but excluding those containing only retransmitted octets."
						, value: ""};

	// quantidade de pacotes SNMP recebidos por segundo
	var snmpInPkts = {oid: "1.3.6.1.2.1.11.1.0", description: "The total number of messages delivered to the SNMP entity from the transport service."
						, value: ""};

	var chartMetrics = {ifDescr	: 	ifDescr,
						ifInOctets : ifInOctets,
						ifOutOctets : ifOutOctets,
						icmpInEchosReps : icmpInEchosReps,
						tcpInSegs : tcpInSegs,
						tcpOutSegs : tcpOutSegs,
	 					snmpInPkts : snmpInPkts};
	var oids = [];
	var keys = [];

	//make oids array
	for (var metric in chartMetrics) {
		keys.push(metric);
		oids.push(chartMetrics[metric].oid);
	};

	var rateX;
	var icmpX;
	var tcpX ;
	var snmpX;
	var ms = new Date().getTime();
		console.log(new Date().getTime());
		session.get (oids, function (error, varbinds) {
		    if (error) {
		        console.error (error.toString ());
		    } else {
		    	for (var i = 0; i < varbinds.length; i++) {
		    		chartMetrics[keys[i]].value = varbinds[i].value.toString();
		    	};
				rateX = ifInOctets.value - ifOutOctets.value;
				icmpX = icmpInEchosReps.value;
				tcpX  = tcpInSegs.value - tcpOutSegs.value;
				snmpX = snmpInPkts.value;
				
			}

			setTimeout(function() {
				session.get (oids, function (error, varbinds) {
				    if (error) {
				        console.error (error.toString ());
				    } else {
				    	for (var i = 0; i < varbinds.length; i++) {
				    		chartMetrics[keys[i]].value = varbinds[i].value.toString();
				    	};

						console.log(new Date().getTime());
						// Chart functions
						// taxa de Kbytes enviados e recebidos por segundo
						var kbps = rateX + (ifInOctets.value - ifOutOctets.value);
						var icmp = icmpX - icmpInEchosReps.value;
						var tcp  = tcpX  + (tcpInSegs.value - tcpOutSegs.value);
						var snmp = snmpX - snmpInPkts.value;
						ms = new Date().getTime() - ms;

						chartMetrics["kbps"] = kbps;
						chartMetrics["icmp"] = icmp;
						chartMetrics["tcp"] = tcp;
						chartMetrics["snmp"] = snmp;
						chartMetrics["ms"] = ms;

						res.status(200).json(chartMetrics);
			    	}
				});
			}, 1000);
		});
});

router.get('/show', function(req, res) {
	res.render('chart', { title: 'Express'});
});


module.exports = router;