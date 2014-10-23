var test_cases = [
	1, "www.google.com",
	0, "127.0.0.1",
	0, "qq.com",
	0, "im.qq.com",
	0, "www.imqq.com",
	1, "qqq.com",
	1, "google.com",
	0, "localhost"
];

function isPlainHostName(host) {
	if ( host.toLowerCase() == 'localhost' )
		return true;
	return false;
}

function dnsResolve(host) {
	//*
	return "0.0.0.0";
	/*/
	return "27.40.0.0"
	//*/
}

function isInNet(ip, ipstart, ipmask) {
	return false;
}

function test(url, host) {
	ret = FindProxyForURL(url, host);
	if ( typeof(direct) == "undefined" ) {
		if ( ret.toLowerCase().indexOf("direct") >= 0 ) {
			return 0;
		}
		return 1;
	} else if ( ret === direct )
		return 0;
	else
		return 1;
}

function output_result(out_obj) {
	output.value = "";
	for (var j = 0; j < test_cases.length; j+=2) {
		var test_case = test_cases[j+1];
		var test_result = test(test_case, test_case);
		var out_line = "" + test_result + " " + test_case + " ";
		if ( test_result === test_cases[j] ) {
			out_line = out_line + "Pass";
		} else {
			out_line = out_line + "NOT Pass";
		}
		out_obj.value = out_obj.value + out_line + "\n";
	}
	var start = new Date();
	if ( test_cases.length > 1 ) {
		for (var j = 0; j < 100000; ++j) {
			var test_case = test_cases[1];
			test(test_case, test_case);
		}
	}
	var end = new Date();
	alert(String(end - start) + "ms in 100,000 tests");
}

function begin_test() {
	var output = document.getElementById("output");
	output_result( output );
}

function test_one() {
	var input = document.getElementById("input");
	var result_obj = document.getElementById("result");
	result = test(input.value, input.value);
	if ( result === 1 )
		result_obj.value = "Proxy";
	else
		result_obj.value = "Direct";
}
