#!/usr/bin/python
# -*- coding: utf-8 -*-

import urlparse
import logging
import copy

__all__ = ['main']

def decode_gfwlist(content):
	# decode base64 if have to
	try:
		if '.' in content:
			raise
		return content.decode('base64')
	except:
		return content


def get_hostname(something):
	try:
		# quite enough for GFW
		if not something.startswith('http:'):
			something = 'http://' + something
		r = urlparse.urlparse(something)
		return r.hostname
	except Exception as e:
		logging.error(e)
		return None

def parse_gfwlist(content):
	gfwlist = content.splitlines(False)
	rules = list()
	for line in gfwlist:
		if line.startswith('!'):
			continue
		elif line.startswith('['):
			continue
		elif len(line.strip(' ')) <= 0:
			continue
		else:
			rules.append(line)
	return rules

def obfs(url):
	ret = ''
	index = 0
	for c in url:
		if index > 0 and ( c == '.' or (index % 7) == 3 ):
			last = ord(ret[-1])
			ret = "%s\\x%x" % (ret[:-1], last)
		ret += c
		index += 1
	return ret

def obfs_list(list_result):
	ret = set()
	for item in list_result:
		ret.add( obfs(item) )
	return ret

def get_all_list(lists):
	result = list()
	key_comma = ''
	for key in lists:
		result.append('%s"%s"\n' % (key_comma, obfs(key) ) )
		key_comma = ','
	return result

def final_list():
	with open('gfwlist.txt', 'r') as f:
		content = f.read()
	content = decode_gfwlist(content)
	#with open('gfwlist_ogn.txt', 'w') as f:
	#	f.write(content)
	domains = parse_gfwlist(content)
	list_result = get_all_list(domains)
	content = ''.join(list_result)
	content = '[' + content + "]"
	return content

