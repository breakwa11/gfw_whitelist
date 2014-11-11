#!/usr/bin/python
# -*- coding: utf-8 -*-

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
		result.append('\n\t"' + item + '": 1,')
	return result

def final_list():
	import lists
	list_result = get_all_list(lists.get_list_set())
	content = ''.join(list_result)
	content = '{' + content[:-1] + "\n}"
	return content

