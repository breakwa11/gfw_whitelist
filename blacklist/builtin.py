#!/usr/bin/python
# -*- coding: utf-8 -*-

def getlist():
    liststr = """
google.com
google.co.jp
google.co.hk
googleapis.com
github.com
wikipedia.org
"""
    return set(liststr.splitlines(False))
