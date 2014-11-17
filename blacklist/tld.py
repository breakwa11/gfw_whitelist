#!/usr/bin/python
# -*- coding: utf-8 -*-

def getfile(pathlist):
	for filename in pathlist:
		try:
			fileobj = open(filename, 'r')
		except:
			continue
		return fileobj

def getlist():
	fileobj = getfile(["../data/tld.txt", "data/tld.txt"])
	data = set()
	for line in fileobj:
		line = line.strip('\n')
		if len(line) < 1 or line[0] == '/':
			continue
		if line[:2] == '*.':
			line = line[2:]
		if line[:1] == '!':
			line = line[1:]

		data.add(line)
	return data
