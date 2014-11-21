var wall_proxy = __PROXY__;
var nowall_proxy = __NOWALL_PROXY__;
var auto_proxy = __AUTO_PROXY__; // if you have something like COW proxy
var direct = __DIRECT__;

/*
 * Copyright (C) 2014 breakwa11
 * https://github.com/breakwa11/gfw_whitelist
 */

var white_domains = __WHITE_DOMAINS__;
var black_domains = __BLACK_DOMAINS__;

var hasOwnProperty = Object.hasOwnProperty;

function check_ipv4(host) {
	var re_ipv4 = /^\d+\.\d+\.\d+\.\d+$/g;
	if (re_ipv4.test(host)) {
		return true;
	}
}
function isInDomains(domain_dict, host) {
	var suffix;
	var pos1 = host.lastIndexOf('.');

	suffix = host.substring(pos1 + 1);
	if (suffix == "cn") {
		return true;
	}

	var domains = domain_dict[suffix];
	if ( domains === undefined ) {
		return true;
	}
	host = host.substring(0, pos1);
	var pos = host.lastIndexOf('.');

	while(1) {
		if (pos <= 0) {
			if (hasOwnProperty.call(domains, host)) {
				return true;
			} else {
				return false;
			}
		}
		suffix = host.substring(pos + 1);
		if (hasOwnProperty.call(domains, suffix)) {
			return true;
		}
		pos = host.lastIndexOf('.', pos - 1);
	}
}

function FindProxyForURL(url, host) {
	if ( isPlainHostName(host) === true ) {
		return direct;
	}
	if ( check_ipv4(host) === true ) {
		return direct;
	}
	if ( isInDomains(white_domains, host) === true ) {
		return nowall_proxy;
	}
	if ( isInDomains(black_domains, host) === true ) {
		return wall_proxy;
	}

	return auto_proxy;
}

