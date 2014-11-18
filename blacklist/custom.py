#!/usr/bin/python
# -*- coding: utf-8 -*-

def getlist():
    liststr = """
cloudfront.net
googlecode.com
verisign.com
qpic.cn
translate-tab.com
layervault.com
list-manage.com
goagent.co
goo.gl
"""
    return set(liststr.splitlines(False))
