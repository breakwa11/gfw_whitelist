#!/usr/bin/python
# -*- coding: utf-8 -*-
from argparse import ArgumentParser
import re
import list_white
import list_black
import list_gfw
import list_ip

def parse_args():
	parser = ArgumentParser()
	parser.add_argument('-i', '--input', dest='input', default='data\\proxy.pac',
		help='path to gfwlist')
	parser.add_argument('-o', '--output', dest='output', default='proxy.pac',
		help='path to output pac', metavar='PAC')
	parser.add_argument('-p', '--proxy', dest='proxy', default='"SOCKS5 127.0.0.1:1080;"',
		help='the proxy parameter in the pac file, for example,\
		"SOCKS5 127.0.0.1:1080;"', metavar='SOCKS5')
	parser.add_argument('-a', '--auto_proxy', dest='auto_proxy', default='auto',
		help='the auto proxy parameter in the pac file, for example,\
		"SOCKS5 127.0.0.1:1080;"', metavar='SOCKS5')
	parser.add_argument('-d', '--directip_proxy', dest='ip_proxy', default='auto',
		help='the auto proxy parameter in the pac file, for example,\
		"SOCKS5 127.0.0.1:1080;"', metavar='SOCKS5')
	parser.add_argument('-z', '--dynamic', dest='dynamic', default='no')
	return parser.parse_args()

def get_file_data(filename):
	content = ''
	with open(filename, 'r') as file_obj:
		content = file_obj.read()
	return content

def js_shorter(content):
	result = []
	class ParseState(object):
		def __init__(self):
			self.state = 'empty'
			self.buff = ''
			self.cur = ''
			self.laststate = 'empty'
			self.word_set = set()
			for i in xrange(26):
				self.word_set.add(chr(i + ord('A')))
				self.word_set.add(chr(i + ord('a')))
			for i in xrange(10):
				self.word_set.add(chr(i + ord('0')))
			self.word_set.add('_')
			self.word_set.add('$')
			self.empty_set = set([' ', '\t', '\r', '\n'])
		def retbuf(self):
			ret = self.buff
			self.buff = ''
			return ret
		def next(self, ch):
			self.buff += self.cur
			self.cur = ch
			if self.state == 'empty':
				if ch in self.empty_set:
					self.cur = ''
				elif ch in self.word_set:
					self.state = 'word'
					if self.laststate == 'word':
						return ' ' + self.retbuf()
					return self.retbuf()
				elif ch == '/':
					self.state = 'slash'
				elif ch == '"':
					self.state = 'string'
				else:
					self.state = 'symbol'
			elif self.state == 'symbol': # symbol
				self.laststate = 'symbol'
				if ch in self.empty_set:
					self.cur = ''
					self.state = 'empty'
				elif ch in self.word_set:
					self.state = 'word'
				elif ch == '/':
					self.state = 'slash'
				elif ch == '"':
					self.state = 'string'
				else:
					self.state = 'symbol'
				return self.retbuf()
			elif self.state == 'word':
				self.laststate = 'word'
				if ch in self.empty_set:
					self.cur = ''
					self.state = 'empty'
					return self.retbuf()
				elif ch in self.word_set:
					self.state = 'word'
				elif ch == '/':
					self.state = 'slash'
					return self.retbuf()
				elif ch == '"':
					self.state = 'string'
					return self.retbuf()
				else:
					self.state = 'symbol'
					return self.retbuf()
			elif self.state == 'string':
				if ch == '"':
					self.cur = ''
					self.state = 'empty'
					return self.retbuf() + ch
				elif ch == '\\':
					self.state = 'string_conv'
			elif self.state == 'string_conv':
				self.state = 'string'
			elif self.state == 'slash': # just OK in this case
				if ch == '/':
					self.state = 'comment'
				elif ch == '*':
					self.state = 'multiline_comment'
				else:
					self.state = 'symbol'
					cur = self.cur
					self.cur = ''
					return self.next(ch)
			elif self.state == 'comment':
				if ch == '\n':
					self.buff = ''
					self.cur = ''
					self.state = 'empty'
			elif self.state == 'multiline_comment':
				if ch == '*':
					self.state = 'multiline_comment_ed1'
			elif self.state == 'multiline_comment_ed1':
				if ch == '/':
					# keep multiline_comment
					self.state = 'symbol'
				else:
					self.state = 'multiline_comment'
			return ''
	prase = ParseState()
	for c in content:
		r = prase.next(c)
		if len(r) > 0:
			result.append(r)
	return ''.join(result)

def writefile(input_file, proxy, auto_proxy, ip_proxy, output_file, dynamic):
	ip_content = list_ip.final_list()
	ip16_content = list_ip.center_list()
	proxy_content = get_file_data(input_file)
	proxy_content = proxy_content.replace('__IP_LIST__', ip_content)
	proxy_content = proxy_content.replace('__IP16_LIST__', ip16_content)
	proxy_content = proxy_content.replace('__FAKE_IP_LIST__', list_ip.fake_list())
	proxy_content = proxy_content.replace('__WHITE_DOMAINS__', list_white.final_list())
	if '__BLACK_DOMAINS__' in proxy_content:
		proxy_content = proxy_content.replace('__BLACK_DOMAINS__', list_black.final_list())
	if '__GFWBLACK_DOMAINS__' in proxy_content:
		proxy_content = proxy_content.replace('__GFWBLACK_DOMAINS__', list_gfw.final_list())

	if dynamic != 'no':
		with open(dynamic + output_file, 'w') as file_obj:
			file_obj.write( js_shorter(proxy_content) )

	proxy_content = proxy_content.replace('__PROXY__', proxy)
	proxy_content = proxy_content.replace('__NOWALL_PROXY__', '"DIRECT;"')
	proxy_content = proxy_content.replace('__IP_PROXY__', ip_proxy)
	proxy_content = proxy_content.replace('__AUTO_PROXY__', auto_proxy)
	proxy_content = proxy_content.replace('__DIRECT__', '"DIRECT;"')
	with open(output_file, 'w') as file_obj:
		file_obj.write(proxy_content)

	with open('min_' + output_file, 'w') as file_obj:
		file_obj.write(js_shorter(proxy_content))

def get_default_param(param, defstring, defval):
	if param == defstring:
		return defval
	return '"' + param.strip('"') + '"'

def main():
	args = parse_args()

	auto_proxy = get_default_param(args.auto_proxy, 'auto', 'wall_proxy')
	ip_proxy = get_default_param(args.ip_proxy, 'auto', 'nowall_proxy')

	writefile(args.input, '"' + args.proxy.strip('"') + '"', auto_proxy, ip_proxy, args.output, args.dynamic)

if __name__ == '__main__':
	main()

