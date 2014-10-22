#!/usr/bin/python
# -*- coding: utf-8 -*-
from argparse import ArgumentParser

fakeIpList = [
'74.125.127.102',
'74.125.155.102',
'74.125.39.102',
'74.125.39.113',
'209.85.229.138',
'128.121.126.139',
'159.106.121.75',
'169.132.13.103',
'192.67.198.6',
'202.106.1.2',
'202.181.7.85',
'203.161.230.171',
'203.98.7.65',
'207.12.88.98',
'208.56.31.43',
'209.145.54.50',
'209.220.30.174',
'209.36.73.33',
'211.94.66.147',
'213.169.251.35',
'216.221.188.182',
'216.234.179.13',
'243.185.187.39',
'37.61.54.158',
'4.36.66.178',
'46.82.174.68',
'59.24.3.173',
'64.33.88.161',
'64.33.99.47',
'64.66.163.251',
'65.104.202.252',
'65.160.219.113',
'66.45.252.237',
'72.14.205.104',
'72.14.205.99',
'78.16.49.15',
'8.7.198.45',
'93.46.8.89'
]

def ip2int(ipstr):
	intlist = ipstr.split('.')
	ret = 0
	for i in range(4):
		ret = ret * 256 + int(intlist[i])
	return ret

def parse_args():
	parser = ArgumentParser()
	parser.add_argument('-i', '--input', dest='input', default='data\\whiteiplist.pac',
		help='path to gfwlist')
	parser.add_argument('-o', '--output', dest='output', default='whiteiplist.pac',
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
	fileobj = open("data/cn_ip_range.txt", "r")
	content = ''
	if fileobj:
		lines_list = [line.rstrip('\n').split(' ') for line in fileobj]
		list_result = [ "0x%x:%s," % (int(line[0]),int(line[1])) for line in lines_list ]
		content = '\n'.join(list_result)
	content = '{\n' + content[:-1] + "\n}"
	return content

def fake_list():
	content = ''
	list_result = [ "0x%x:1," % int(ip2int(ip)) for ip in fakeIpList ]
	content = '\n'.join(list_result)
	content = '{\n' + content[:-1] + "\n}"
	return content

def writefile(input_file, proxy, output_file):
	ip_content = final_list()
	fake_ip_content = fake_list()
	proxy_content = get_file_data(input_file)
	proxy_content = proxy_content.replace('__PROXY__', proxy)
	proxy_content = proxy_content.replace('__IP_LIST__', ip_content)
	proxy_content = proxy_content.replace('__FAKE_IP_LIST__', fake_ip_content)
	with open(output_file, 'w') as file_obj:
		file_obj.write(proxy_content)

def main():
	args = parse_args()
	writefile(args.input, '"' + args.proxy.strip('"') + '"', args.output)

if __name__ == '__main__':
	main()

