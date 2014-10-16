var domains = __DOMAINS__;

var proxy = __PROXY__;

var direct = "DIRECT;";


function FindProxyForURL(url, host) {
    function check_ipv4() {
        // check if the ipv4 format (TODO: ipv6)
        //   http://home.deds.nl/~aeron/regex/
        var re_ipv4 = /^\d+\.\d+\.\d+\.\d+$/g;
        if (re_ipv4.test(host)) {
            // in theory, we can add chnroutes test here.
            // but that is probably too much an overkill.
            return true;
        }
    }
    if ( isPlainHostName(host) === true ||  check_ipv4() === true ) {
        return direct;
    }
    var suffix;
    var pos1 = host.lastIndexOf('.');
    var pos = host.lastIndexOf('.', pos1 - 1);

    suffix = host.substring(pos1 + 1);
    if (hasOwnProperty.call(domains, suffix)) {
        return direct;
    }

    while(1) {
        if (pos == -1) {
            if (hasOwnProperty.call(domains, host)) {
                return direct;
            } else {
                return proxy;
            }
        }
        suffix = host.substring(pos + 1);
        if (hasOwnProperty.call(domains, suffix)) {
            return direct;
        }
        pos = host.lastIndexOf('.', pos - 1);
    }
}

