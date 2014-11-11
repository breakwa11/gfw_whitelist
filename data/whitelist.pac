var wall_proxy = __PROXY__;
var nowall_proxy = "DIRECT;";
var direct = "DIRECT;";

var domains = __DOMAINS__;

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
			if (hasOwnProperty.call(domains, host)) {
				return nowall_proxy;
			} else {
				return wall_proxy;
			}
		}
		suffix = host.substring(pos + 1);
		if (hasOwnProperty.call(domains, suffix)) {
			return nowall_proxy;
		}
		pos = host.lastIndexOf('.', pos - 1);
	}
}

