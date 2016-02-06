#!/usr/bin/python
#-*- coding: utf-8 -*-

'''
You have to install pacparser before runing this script.
You can get pacparser from https://code.google.com/p/pacparser.
'''

import pacparser
import time

def get_pac_result(filename, url, host):
	pacparser.init()
	pacparser.parse_pac(filename)
	ret_str = pacparser.find_proxy(url, host)
	pacparser.cleanup()
	return ret_str

def main_test(filename, test_times):
	pacparser.init()
	pacparser.parse_pac(filename)
	beg_time = time.time()
	for i in xrange(test_times):
		ret_str = pacparser.find_proxy('http://www.coding.com', 'www.coding.com') # using the worst case
	end_time = time.time()
	print "%s:\nTotal Time: %s s\nAvg. Time: %s ms\n\n" % (filename, end_time - beg_time, (end_time - beg_time) * 1000.0 / test_times),
	pacparser.cleanup()

def time_test():
	main_test("whitelist.pac", 10000)
#	main_test("whiteiplist.pac", 100)
	#main_test("flora_pac.pac", 100)
	#main_test("usufu_flora_pac.pac", 100)

def main():
	time_test()

main()
