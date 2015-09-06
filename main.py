#!/usr/bin/python
# -*- coding: utf-8 -*-
from argparse import ArgumentParser
import list_white
import list_ip

def parse_args():
	parser = ArgumentParser()
	parser.add_argument('-i', '--input', dest='input', default='data/whitelist.pac',
		help='path to gfwlist')
	parser.add_argument('-o', '--output', dest='output', default='whitelist.pac',
		help='path to output pac', metavar='PAC')
	parser.add_argument('-p', '--proxy', dest='proxy', default='"SOCKS5 127.0.0.1:1080;"',
		help='the proxy parameter in the pac file, for example,\
		"127.0.0.1:1080;"', metavar='SOCKS5')
	return parser.parse_args()

def get_file_data(filename):
	content = ''
	with open(filename, 'r') as file_obj:
		content = file_obj.read()
	return content

def writefile(input_file, proxy, output_file):
	ip_content = list_ip.final_list()
	ip16_content = list_ip.center_list()
	fake_ip_content = list_ip.fake_list()
	domains_content = list_white.final_list()
	proxy_content = get_file_data(input_file)
	proxy_content = proxy_content.replace('__PROXY__', proxy)
	proxy_content = proxy_content.replace('__DOMAINS__', domains_content)
	proxy_content = proxy_content.replace('__IP_LIST__', ip_content)
	proxy_content = proxy_content.replace('__IP16_LIST__', ip16_content)
	proxy_content = proxy_content.replace('__FAKE_IP_LIST__', fake_ip_content)
	with open(output_file, 'w') as file_obj:
		file_obj.write(proxy_content)

def main():
	args = parse_args()
	writefile(args.input, '"' + args.proxy.strip('"') + '"', args.output)

if __name__ == '__main__':
	main()

