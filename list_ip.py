#!/usr/bin/python
# -*- coding: utf-8 -*-
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

def final_list():
	fileobj = open("data/cn_ip_range.txt", "r")
	content = ''
	if fileobj:
		list_result = []
		lines_list = [line.rstrip('\n').split(' ') for line in fileobj]
		#list_result = [ "0x%x:%s," % (int(line[0]),int(line[1])) for line in lines_list ]
		#'''
		list_result.append('{')
		start_num = 0
		for line in lines_list:
			while (int(line[0]) >> 24) > start_num:
				start_num += 1
				list_result.append('},{')
			list_result.append("0x%x:%s," % ( int(line[0])/256, int(line[1])/256 ))
		list_result.append('}')
		#'''
		content = '\n'.join(list_result)
	content = '[\n' + content[:] + "\n]"
	return content

def center_list():
	fileobj = open("data/cn_ip_range.txt", "r")
	master_net = set()
	content = ''
	if fileobj:
		list_result = []
		lines_list = [line.rstrip('\n').split(' ') for line in fileobj]
		for line in lines_list:
			if int(line[1]) < (1 << 16):
				master_net.add( int(int(line[0]) >> 16) )
	master_net = list(master_net)
	master_net.sort()
	list_result = ['0x%x:1,' % s for s in master_net]
	content = '\n'.join(list_result)
	content = '{\n' + content + "\n}"
	return content

def fake_list():
	content = ''
	list_result = [ "0x%x:1," % int(ip2int(ip)) for ip in fakeIpList ]
	content = '\n'.join(list_result)
	content = '{\n' + content[:-1] + "\n}"
	return content

def main():
	print center_list()

if __name__ == '__main__':
	main()

