#!/usr/bin/python
# -*- coding: utf-8 -*-

def get_all_list(lists):
	all_list = set()
	result = list()
	for item in lists:
		all_list = all_list | item.getlist()
	all_list.remove('')
	url_dict = {}
	for item in all_list:
		parts = item.split('.')
		if not url_dict.has_key(parts[-1]) :
			url_dict[parts[-1]] = list()
		url_dict[parts[-1]].append( '.'.join(parts[:-1]) )

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
	import lists
	list_result = get_all_list(lists.get_list_set())
	content = ''.join(list_result)
	content = '{' + content + "\n}"
	return content

