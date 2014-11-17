var wall_proxy = __PROXY__;
var nowall_proxy = "DIRECT;";
var auto_proxy = __AUTO_PROXY__; // if you have something like COW proxy
var direct = "DIRECT;";

var white_domains = __WHITE_DOMAINS__;
var black_domains = __BLACK_DOMAINS__;

var cnIpRange = __IP_LIST__;
var cnIp16Range = __IP16_LIST__;

var fakeIpRange = __FAKE_IP_LIST__;

var subnetIpRangeList = [
167772160,184549376,	//10.0.0.0/8
2886729728,2887778304,	//172.16.0.0/12
3232235520,3232301056,	//192.168.0.0/16
2130706432,2130706688	//127.0.0.0/24
];

var hasOwnProperty = Object.hasOwnProperty;

function check_ipv4(host) {
	var re_ipv4 = /^\d+\.\d+\.\d+\.\d+$/g;
	if (re_ipv4.test(host)) {
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
function isInSingleRange(ipRange, intIp) {
	if ( hasOwnProperty.call(cnIp16Range, intIp >>> 6) ) {
		for ( var range = 1; range < 64; range*=4 ) {
			var master = intIp & ~(range-1);
			if ( hasOwnProperty.call(ipRange, master) )
				return intIp - master < ipRange[master];
		}
	} else {
		for ( var range = 64; range <= 1024; range*=4 ) {
			var master = intIp & ~(range-1);
			if ( hasOwnProperty.call(ipRange, master) )
				return intIp - master < ipRange[master];
		}
	}
}
function isInSubnetRange(ipRange, intIp) {
	for ( var i = 0; i < 8; i += 2 ) {
		if ( ipRange[i] <= intIp && intIp < ipRange[i+1] )
			return true;
	}
}
function getProxyFromIP(strIp) {
	var intIp = convertAddress(strIp);
	if ( hasOwnProperty.call(fakeIpRange, intIp) ) {
		return wall_proxy;
	}
	if ( isInSubnetRange(subnetIpRangeList, intIp) ) {
		return direct;
	}
	var index = (intIp >>> 24) & 0xff;
	if ( isInSingleRange(cnIpRange[index], intIp) ) {
		return nowall_proxy;
	}
	return auto_proxy;
}
function FindProxyForURL(url, host) {
	if ( isPlainHostName(host) === true ) {
		return direct;
	}
	if ( check_ipv4(host) === true ) {
		return getProxyFromIP(host);
	}

	var suffix;
	var pos1 = host.lastIndexOf('.');

	if ( pos1 > 0 ) {
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

		pos = host.lastIndexOf('.');
		pos = host.lastIndexOf('.', pos - 1);

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
	}

	var strIp = dnsResolve(host);
	if (!strIp) {
		return wall_proxy;
	}
	return getProxyFromIP(strIp);
}

