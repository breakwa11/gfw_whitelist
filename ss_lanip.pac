var direct = "DIRECT;";

var wall_proxy = function(){ return "__PROXY__;" + direct; };
var wall_v6_proxy = function(){ return "__PROXY__;" + direct; };

var ip_proxy = function(){ return wall_proxy(); };
var ipv6_proxy = function(){ return wall_v6_proxy(); };
var nowall_proxy = function(){ return direct; };

/*
 * Copyright (C) 2014 breakwa11
 * https://github.com/breakwa11/gfw_whitelist
 */

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
function check_ipv6(host) {
	var re_ipv6 = /^\[?([a-fA-F0-9]{0,4}\:){1,7}[a-fA-F0-9]{0,4}\]?$/g;
	if (re_ipv6.test(host)) {
		return true;
	}
}
function check_ipv6_dns(dnsstr) {
	var re_ipv6 = /([a-fA-F0-9]{0,4}\:){1,7}[a-fA-F0-9]{0,4}(%[0-9]+)?/g;
	if (re_ipv6.test(dnsstr)) {
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
}
function isInSubnetRange(ipRange, intIp) {
	for ( var i = 0; i < 8; i += 2 ) {
		if ( ipRange[i] <= intIp && intIp < ipRange[i+1] )
			return true;
	}
}
function getProxyFromIP(strIp) {
	var intIp = convertAddress(strIp);
	if ( isInSubnetRange(subnetIpRangeList, intIp) ) {
		return direct;
	}
	return wall_proxy();
}
function FindProxyForURL(url, host) {
	if ( isPlainHostName(host) === true ) {
		return direct;
	}
	if ( check_ipv4(host) === true ) {
		return getProxyFromIP(host);
	}
	if ( check_ipv6(host) === true ) {
		return ipv6_proxy();
	}

	var strIp = dnsResolve(host);
	if ( !strIp ) {
		return wall_proxy();
	}
	
	return getProxyFromIP(strIp);
}

function FindProxyForURLEx(url, host) {
	if ( isPlainHostName(host) === true ) {
		return direct;
	}
	if ( check_ipv4(host) === true ) {
		return getProxyFromIP(host);
	}
	if ( check_ipv6(host) === true ) {
		return ipv6_proxy();
	}

	var strIp = dnsResolveEx(host);
	if ( !strIp ) {
		return wall_proxy();
	}
	if ( check_ipv6_dns(strIp) === true ) {
		return ipv6_proxy();
	}
	var dnsIps = strIp.split(";");
	if (check_ipv4(dnsIps[0]) === true) {
		return getProxyFromIP(dnsIps[0]);
	} else if (check_ipv6_dns(dnsIps[0]) === true) {
		return ipv6_proxy();
	}
	return wall_proxy();
}

