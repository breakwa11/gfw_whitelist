#!/usr/bin/python
# -*- coding: utf-8 -*-

import urlparse
import logging
import copy
from blacklist import ban
from blacklist import builtin
from blacklist import custom
from blacklist import tld

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

def add_domain_to_set(s, something):
	hostname = get_hostname(something)
	if hostname is not None:
		if hostname.startswith('.'):
			hostname = hostname.lstrip('.')
		if hostname.endswith('/'):
			hostname = hostname.rstrip('/')
		if hostname:
			s.add(hostname)

def parse_gfwlist(content):
	gfwlist = content.splitlines(False)
	domains = builtin.getlist()
	for line in gfwlist:
		if line.find('.*') >= 0:
			continue
		elif line.find('*') >= 0:
			line = line.replace('*', '/')
		if line.startswith('!'):
			continue
		elif line.startswith('['):
			continue
		elif line.startswith('@'):
			# ignore white list
			continue
		elif line.startswith('||!--'):
			continue
		elif line.startswith('||'):
			add_domain_to_set(domains, line.lstrip('||'))
		elif line.startswith('|'):
			add_domain_to_set(domains, line.lstrip('|'))
		elif line.startswith('.'):
			add_domain_to_set(domains, line.lstrip('.'))
		else:
			add_domain_to_set(domains, line)
	return domains

def reduce_domains(domains):
	# reduce 'www.google.com' to 'google.com'
	# remove invalid domains
	tlds = tld.getlist()
	cuss = custom.getlist()
	bans = ban.getlist()
	new_domains = set()
	for cus in cuss:
		new_domains.add(cus)
	for domain in domains:
		domain_parts = domain.split('.')
		last_root_domain = None
		for i in xrange(0, len(domain_parts)):
			root_domain = '.'.join(domain_parts[len(domain_parts) - i - 1:])
			if i == 0:
				if not tlds.__contains__(root_domain):
					# root_domain is not a valid tld
					break
			last_root_domain = root_domain
			if tlds.__contains__(root_domain):
				continue
			else:
				break
		if last_root_domain is not None \
			and last_root_domain not in bans \
			and last_root_domain not in new_domains:
			same = False
			for cus in new_domains:
				if len(cus) < len(last_root_domain):
					if cmp(cus[::-1] + '.', last_root_domain[::-1][0:len(cus)+1]) == 0 :
						same = True
						break
				elif len(cus) > len(last_root_domain):
					if cmp(last_root_domain[::-1] + '.', cus[::-1][0:len(last_root_domain)+1]) == 0 :
						new_domains.remove(cus)
						break
			if not same :
				new_domains.add(last_root_domain)
	return new_domains

def obfs(url):
	ret = ''
	index = 0
	for c in url:
		if c == '.' or ((index & 3) == 0 and index > 0):
			last = ord(ret[-1])
			if last < 64:
				ret = "%s\\%o" % (ret[:-1], last)
			else:
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
	all_list = lists
	result = list()
	all_list.remove('')
	url_dict = {}
	for item in all_list:
		parts = item.split('.')
		if not url_dict.has_key(parts[-1]) :
			url_dict[parts[-1]] = list()
		url_dict[parts[-1]].append( obfs('.'.join(parts[:-1])) )

	key_comma = ''
	url_dict_keys = url_dict.keys()
	url_dict_keys.sort()
	for key in url_dict_keys:
		url_dict[key].sort()
		result.append('%s"%s":{' % (key_comma, key) )
		comma = ''
		for item in url_dict[key]:
			result.append(comma + '\n"' + item + '":1')
			comma = ','
		result.append('\n}')
		key_comma = ','
	return result

def final_list():
	with open('gfwlist.txt', 'r') as f:
		content = f.read()
	content = decode_gfwlist(content)
	#with open('gfwlist_ogn.txt', 'w') as f:
	#	f.write(content)
	domains = parse_gfwlist(content)
	list_result = get_all_list(reduce_domains(domains))
	content = ''.join(list_result)
	content = '{' + content + "\n}"
	return content

