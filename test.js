var test_cases = [
    0, "127.0.0.1",
    0, "qq.com",
    0, "im.qq.com",
    0, "www.imqq.com",
    1, "qqq.com",
    1, "google.com",
    1, "www.google.com",
    0, "localhost"
];

function isPlainHostName(host) {
    if ( host.toLowerCase() == 'localhost' )
        return true;
    return false;
}
function test(url, host) {
    ret = FindProxyForURL(url, host);
    if ( ret === direct )
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
}

function begin_test() {
    var output = document.getElementById("output");
    output_result( output );
}

