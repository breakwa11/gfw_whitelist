var wall_proxy = __PROXY__;
var nowall_proxy = "DIRECT;";
var auto_proxy = __AUTO_PROXY__; // if you have something like COW proxy
var direct = "DIRECT;";

var white_domains = __WHITE_DOMAINS__;

var black_domains = __BLACK_DOMAINS__;

var cnIpRange = __IP_LIST__;

var fakeIpRange = __FAKE_IP_LIST__;

var subnetIpRange = {
167772160:16777216,	//10.0.0.0/8
2886729728:1048576,	//172.16.0.0/12
3232235520:65536,	//192.168.0.0/16
2130706432:256		//127.0.0.0/24
};

var hasOwnProperty = Object.hasOwnProperty;

function check_ipv4(host) {
	// check if the ipv4 format (TODO: ipv6)
	//   http://home.deds.nl/~aeron/regex/
	var re_ipv4 = /^\d+\.\d+\.\d+\.\d+$/g;
	if (re_ipv4.test(host)) {
		// in theory, we can add chnroutes test here.
		// but that is probably too much an overkill.
		return true;
	}
}

function convertAddress(ipchars) {
	var bytes = ipchars.split('.');
	var result = (bytes[0] << 24) |
	(bytes[1] << 16) |
	(bytes[2] << 8) |
	(bytes[3]);
	return result >>> 0;
};
function isInRange(ipRange, intIp) {
	for ( var range = 256; range <= 1048576; range*=4 ) {
		var sub = intIp & (range-1);
		var masterIp = intIp - sub;
		if ( hasOwnProperty.call(ipRange[range], masterIp) )
			return sub < range;
	}
	return 0;
}
function isInSingleRange(ipRange, intIp) {
	for ( var range = 256; range <= 1048576; range*=4 ) {
		var sub = intIp & (range-1);
		var masterIp = intIp - sub;
		if ( hasOwnProperty.call(ipRange, masterIp) )
			return sub < ipRange[masterIp];
	}
	return 0;
}
function isInSubnetRange(ipRange, intIp) {
	for ( var range = 256; range <= 16777216; range*=16 ) {
		var sub = intIp & (range-1);
		var masterIp = intIp - sub;
		if ( hasOwnProperty.call(ipRange, masterIp) )
			return sub < ipRange[masterIp];
	}
	return 0;
}
function FindProxyForURL(url, host) {
	if ( isPlainHostName(host) === true ) {
		return direct;
	}
	if ( check_ipv4(host) === true ) {
		return nowall_proxy;
	}
	var suffix;
	var pos1 = host.lastIndexOf('.');
	var pos = host.lastIndexOf('.', pos1 - 1);

	suffix = host.substring(pos1 + 1);
	if (suffix == "cn") {
		return nowall_proxy;
	}

	while(1) {
		if (pos == -1) {
			if (hasOwnProperty.call(white_domains, host)) {
				return nowall_proxy;
			} else {
				break;
			}
		}
		suffix = host.substring(pos + 1);
		if (hasOwnProperty.call(white_domains, suffix)) {
			return nowall_proxy;
		}
		pos = host.lastIndexOf('.', pos - 1);
	}

	while(1) {
		if (pos == -1) {
			if (hasOwnProperty.call(black_domains, host)) {
				return wall_proxy;
			} else {
				break;
			}
		}
		suffix = host.substring(pos + 1);
		if (hasOwnProperty.call(black_domains, suffix)) {
			return wall_proxy;
		}
		pos = host.lastIndexOf('.', pos - 1);
	}

	var strIp = dnsResolve(host);
	if (!strIp) {
		return wall_proxy;
	}
	
	var intIp = convertAddress(strIp);
	if ( hasOwnProperty.call(fakeIpRange, intIp) ) {
		return wall_proxy;
	}
	if ( isInSubnetRange(subnetIpRange, intIp) ) {
		return direct;
	}
	if ( isInSingleRange(cnIpRange, intIp) ) {
		return nowall_proxy;
	}
	return auto_proxy;
}

