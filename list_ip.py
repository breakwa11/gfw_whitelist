#!/usr/bin/python
# -*- coding: utf-8 -*-
fakeIpList = [
# https://zh.wikipedia.org/wiki/%E5%9F%9F%E5%90%8D%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%BC%93%E5%AD%98%E6%B1%A1%E6%9F%93
'4.36.66.178',
'8.7.198.45',
'23.89.5.60',
'37.61.54.158',
'46.82.174.68',
'49.2.123.56',
'54.76.135.1',
'59.24.3.173',
'64.33.88.161',
'64.33.99.47',
'64.66.163.251',
'65.104.202.252',
'65.160.219.113',
'66.45.252.237',
'72.14.205.99',
'72.14.205.104',
'77.4.7.92',
'78.16.49.15',
'93.46.8.89',
'118.5.49.6',
'128.121.126.139',
'159.106.121.75',
'169.132.13.103',
'188.5.4.96',
'189.163.17.5',
'192.67.198.6',
'197.4.4.12',
'202.106.1.2',
'202.181.7.85',
'203.98.7.65',
'203.161.230.171',
'207.12.88.98',
'208.56.31.43',
'209.36.73.33',
'209.145.54.50',
'209.220.30.174',
'211.94.66.147',
'213.169.251.35',
'216.221.188.182',
'216.234.179.13',
'243.185.187.39',
'249.129.46.48',
'253.157.14.165',
'74.125.31.113',
'74.125.39.102',
'74.125.39.113',
'74.125.127.102',
'74.125.130.47',
'74.125.155.102',
'209.85.229.138',
'210.242.125.20',
'0.0.0.0',
'2.1.1.2',
'4.193.80.0',
'8.105.84.0',
'12.87.133.0',
'16.63.155.0',
'20.139.56.0',
'24.51.184.0',
'28.121.126.139',
'28.13.216.0',
'46.20.126.252',
'46.38.24.209',
'61.54.28.6',
'66.206.11.194',
'74.117.57.138',
'89.31.55.106',
'113.11.194.190',
'122.218.101.190',
'123.50.49.171',
'123.126.249.238',
'125.230.148.48',
'127.0.0.2',
'173.201.216.6',
'203.199.57.81',
'208.109.138.55',
'211.5.133.18',
'211.8.69.27',
'213.186.33.5',
'216.139.213.144',
'221.8.69.27',
'243.185.187.3',
'243.185.187.30'
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
		comma = ''
		for line in lines_list:
			while (int(line[0]) >> 24) > start_num:
				start_num += 1
				list_result.append('},{')
				comma = ''
			list_result.append("%s0x%x:%s" % ( comma, int(line[0])/256, int(line[1])/256 ))
			comma = ','
		list_result.append('}')
		#'''
		content = ''.join(list_result)
	content = '[\n' + content + "\n]"
	return content

def center_list():
	fileobj = open("data/cn_ip_range.txt", "r")
	master_net = set()
	content = ''
	if fileobj:
		list_result = []
		lines_list = [line.rstrip('\n').split(' ') for line in fileobj]
		for line in lines_list:
			if int(line[1]) < (1 << 14):
				master_net.add( int(int(line[0]) >> 14) )
	master_net = list(master_net)
	master_net.sort()
	list_result = ['0x%x:1,' % s for s in master_net]
	content = ''.join(list_result)
	content = '{\n' + content[:-1] + "\n}"
	return content

def fake_list():
	content = ''
	list_result = [ "0x%x," % int(ip2int(ip)) for ip in fakeIpList ]
	content = ''.join(list_result)
	content = '[\n' + content[:-1] + "\n]"
	return content

def main():
	print center_list()

if __name__ == '__main__':
	main()
