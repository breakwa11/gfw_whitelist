#!/usr/bin/python
# -*- coding: utf-8 -*-
from argparse import ArgumentParser

def parse_args():
    parser = ArgumentParser()
    parser.add_argument('-i', '--input', dest='input', default='data\\whitelist.pac',
        help='path to gfwlist')
    parser.add_argument('-o', '--output', dest='output', default='whitelist.pac',
        help='path to output pac', metavar='PAC')
    parser.add_argument('-p', '--proxy', dest='proxy', default='"PROXY 127.0.0.1:1080;"',
        help='the proxy parameter in the pac file, for example,\
        "127.0.0.1:1080;"', metavar='PROXY')
    return parser.parse_args()

def get_all_list(lists):
    all_list = set()
    result = list()
    for item in lists:
        all_list = all_list | item.getlist()
    all_list.remove('')
    sort_list = []
    for item in all_list:
        sort_list.append(item)
    sort_list.sort()
    for item in sort_list:
        result.append('\n  "' + item + '": 1,')
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

def writefile(input_file, proxy, output_file):
    domains_content = final_list()
    proxy_content = get_file_data(input_file)
    proxy_content = proxy_content.replace('__PROXY__', proxy)
    proxy_content = proxy_content.replace('__DOMAINS__', domains_content)
    with open(output_file, 'w') as file_obj:
        file_obj.write(proxy_content)

def main():
    args = parse_args()
    writefile(args.input, '"' + args.proxy.strip('"') + '"', args.output)

if __name__ == '__main__':
    main()

