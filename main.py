#!/usr/bin/python
# -*- coding: utf-8 -*-
from argparse import ArgumentParser

def parse_args():
    parser = ArgumentParser()
    parser.add_argument('-i', '--input', dest='input', default='data\\whitelist.pac',
        help='path to gfwlist')
    parser.add_argument('-f', '--file', dest='output', default='gfw_whitelist.pac',
        help='path to output pac', metavar='PAC')
    parser.add_argument('-p', '--proxy', dest='proxy', default='"127.0.0.1:1080"',
        help='the proxy parameter in the pac file, for example,\
        "127.0.0.1:1080;"', metavar='PROXY')
    parser.add_argument('-t', '--type', dest='type', default='"PROXY"',
        help='the proxy type in the pac file, "PROXY" or "SOCKS5"', metavar='TYPE')
    return parser.parse_args()

def get_all_list(lists):
    all_list = set()
    result = set()
    for item in lists:
        all_list = all_list | item.getlist()
    all_list.remove('')
    for item in all_list:
        result.add('\n  "' + item + '": 1,')
    return result

def get_file_data(filename):
    content = ''
    with open(filename, 'r') as file_obj:
        content = file_obj.read()
    return content

def final_list():
    import lists
    list_result = get_all_list(lists.get_list_set())
    content = ''
    content = content.join(list_result)
    content = '{' + content[:-1] + "\n}"
    return content

def writefile(input_file, ip, proxy_type, output_file):
    domains_content = final_list()
    proxy_content = get_file_data(input_file)
    proxy_content = proxy_content.replace('__IP__', ip)
    proxy_content = proxy_content.replace('__PROXY__', proxy_type)
    proxy_content = proxy_content.replace('__DOMAINS__', domains_content)
    with open(output_file, 'w') as file_obj:
        file_obj.write(proxy_content)

def main():
    args = parse_args()
    writefile(args.input, args.proxy, args.type, args.output)

if __name__ == '__main__':
    main()

