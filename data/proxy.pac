var wall_proxy = __PROXY__;
var nowall_proxy = __NOWALL_PROXY__;
var auto_proxy = __AUTO_PROXY__; // if you have something like COW proxy
var direct = __DIRECT__;

/*
 * Copyright (C) 2014 breakwa11
 * https://github.com/breakwa11/gfw_whitelist
 */

var white_domains = __WHITE_DOMAINS__;
var black_domains = __GFWBLACK_DOMAINS__;

var cnIpRange = __IP_LIST__;
var cnIp16Range = __IP16_LIST__;

var fakeIpRange = __FAKE_IP_LIST__;

var subnetIpRangeList = [
167772160,184549376,	//10.0.0.0/8
2886729728,2887778304,	//172.16.0.0/12
3232235520,3232301056,	//192.168.0.0/16
2130706432,2130706688	//127.0.0.0/24
];

var hasOwnProperty = Object.hasOwnProperty;

function check_ipv4(host) {
	var re_ipv4 = /^\d+\.\d+\.\d+\.\d+$/g;
	if (re_ipv4.test(host)) {
		return true;
	}
}
function convertAddress(ipchars) {
	var bytes = ipchars.split('.');
	var result = (bytes[0] << 24) |
	(bytes[1] << 16) |
	(bytes[2] << 8) |
	(bytes[3]);
	return result >>> 0;
}
function isInSingleRange(ipRange, intIp) {
	if ( hasOwnProperty.call(cnIp16Range, intIp >>> 6) ) {
		for ( var range = 1; range < 64; range*=4 ) {
			var master = intIp & ~(range-1);
			if ( hasOwnProperty.call(ipRange, master) )
				return intIp - master < ipRange[master];
		}
	} else {
		for ( var range = 64; range <= 1024; range*=4 ) {
			var master = intIp & ~(range-1);
			if ( hasOwnProperty.call(ipRange, master) )
				return intIp - master < ipRange[master];
		}
	}
}
function isInSubnetRange(ipRange, intIp) {
	for ( var i = 0; i < 8; i += 2 ) {
		if ( ipRange[i] <= intIp && intIp < ipRange[i+1] )
			return true;
	}
}
function getProxyFromIP(strIp) {
	var intIp = convertAddress(strIp);
	{
		var len = fakeIpRange.length;
		for ( var i = 0; i < len; ++i ) {
			if ( intIp == fakeIpRange[i] )
				return wall_proxy;
		}
	}
	if ( isInSubnetRange(subnetIpRangeList, intIp) ) {
		return direct;
	}
	var index = (intIp >>> 24) & 0xff;
	if ( isInSingleRange(cnIpRange[index], intIp) ) {
		return nowall_proxy;
	}
	return auto_proxy;
}
function isInDomains(domain_dict, host) {
	var suffix;
	var pos1 = host.lastIndexOf('.');

	suffix = host.substring(pos1 + 1);
	if (suffix == "cn") {
		return true;
	}

	var domains = domain_dict[suffix];
	if ( domains === undefined ) {
		return true;
	}
	host = host.substring(0, pos1);
	var pos = host.lastIndexOf('.');

	while(1) {
		if (pos <= 0) {
			if (hasOwnProperty.call(domains, host)) {
				return true;
			} else {
				return false;
			}
		}
		suffix = host.substring(pos + 1);
		if (hasOwnProperty.call(domains, suffix)) {
			return true;
		}
		pos = host.lastIndexOf('.', pos - 1);
	}
}

/*
* This file is part of Adblock Plus <http://adblockplus.org/>,
* Copyright (C) 2006-2014 Eyeo GmbH
*
* Adblock Plus is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License version 3 as
* published by the Free Software Foundation.
*
* Adblock Plus is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Adblock Plus.	If not, see <http://www.gnu.org/licenses/>.
*/

function Filter(text)
{
	this.text = text;
	this.subscriptions = [];
}
Filter.prototype = {
	text: null,
	subscriptions: null,
	serialize: function(buffer)
	{
		buffer.push("[Filter]");
		buffer.push("text=" + this.text);
	},
	toString: function()
	{
		return this.text;
	}
};
Filter.knownFilters = Object.create(null);
Filter.elemhideRegExp = /^([^\/\*\|\@"!]*?)#(\@)?(?:([\w\-]+|\*)((?:\([\w\-]+(?:[$^*]?=[^\(\)"]*)?\))*)|#([^{}]+))$/;
Filter.regexpRegExp = /^(@@)?\/.*\/(?:\$~?[\w\-]+(?:=[^,\s]+)?(?:,~?[\w\-]+(?:=[^,\s]+)?)*)?$/;
Filter.optionsRegExp = /\$(~?[\w\-]+(?:=[^,\s]+)?(?:,~?[\w\-]+(?:=[^,\s]+)?)*)$/;
Filter.fromText = function(text)
{
	if (text in Filter.knownFilters)
	{
		return Filter.knownFilters[text];
	}
	var ret;
	var match = text.indexOf("#") >= 0 ? Filter.elemhideRegExp.exec(text) : null;
	if (match)
	{
		ret = ElemHideBase.fromText(text, match[1], match[2], match[3], match[4], match[5]);
	}
	else if (text[0] == "!")
	{
		ret = new CommentFilter(text);
	}
	else
	{
		ret = RegExpFilter.fromText(text);
	}
	Filter.knownFilters[ret.text] = ret;
	return ret;
};
Filter.fromObject = function(obj)
{
	var ret = Filter.fromText(obj.text);
	if (ret instanceof ActiveFilter)
	{
		if ("disabled" in obj)
		{
			ret._disabled = obj.disabled == "true";
		}
		if ("hitCount" in obj)
		{
			ret._hitCount = parseInt(obj.hitCount) || 0;
		}
		if ("lastHit" in obj)
		{
			ret._lastHit = parseInt(obj.lastHit) || 0;
		}
	}
	return ret;
};
Filter.normalize = function(text)
{
	if (!text)
	{
		return text;
	}
	text = text.replace(/[^\S ]/g, "");
	if (/^\s*!/.test(text))
	{
		return text.replace(/^\s+/, "").replace(/\s+$/, "");
	}
	else if (Filter.elemhideRegExp.test(text))
	{
		var _tempVar5 = /^(.*?)(#\@?#?)(.*)$/.exec(text);
		var domain = _tempVar5[1];
		var separator = _tempVar5[2];
		var selector = _tempVar5[3];
		return domain.replace(/\s/g, "") + separator + selector.replace(/^\s+/, "").replace(/\s+$/, "");
	}
	else
	{
		return text.replace(/\s/g, "");
	}
};

function InvalidFilter(text, reason)
{
	Filter.call(this, text);
	this.reason = reason;
}
InvalidFilter.prototype = {
	__proto__: Filter.prototype,
	reason: null,
	serialize: function(buffer)
	{}
};

function CommentFilter(text)
{
	Filter.call(this, text);
}
CommentFilter.prototype = {
	__proto__: Filter.prototype,
	serialize: function(buffer)
	{}
};

function ActiveFilter(text, domains)
{
	Filter.call(this, text);
	this.domainSource = domains;
}
ActiveFilter.prototype = {
	__proto__: Filter.prototype,
	_disabled: false,
	_hitCount: 0,
	_lastHit: 0,
	get disabled()
	{
		return this._disabled;
	},
	set disabled(value)
	{
		if (value != this._disabled)
		{
			var oldValue = this._disabled;
			this._disabled = value;
		}
		return this._disabled;
	},
	get hitCount()
	{
		return this._hitCount;
	},
	set hitCount(value)
	{
		if (value != this._hitCount)
		{
			var oldValue = this._hitCount;
			this._hitCount = value;
		}
		return this._hitCount;
	},
	get lastHit()
	{
		return this._lastHit;
	},
	set lastHit(value)
	{
		if (value != this._lastHit)
		{
			var oldValue = this._lastHit;
			this._lastHit = value;
		}
		return this._lastHit;
	},
	domainSource: null,
	domainSeparator: null,
	ignoreTrailingDot: true,
	domainSourceIsUpperCase: false,
	get domains()
	{
		var prop = Object.getOwnPropertyDescriptor(this, "domains");
		if (prop)
		{
			return prop.value;
		}
		var domains = null;
		if (this.domainSource)
		{
			var source = this.domainSource;
			if (!this.domainSourceIsUpperCase)
			{
				source = source.toUpperCase();
			}
			var list = source.split(this.domainSeparator);
			if (list.length == 1 && list[0][0] != "~")
			{
				domains = {
					__proto__: null,
					"": false
				};
				if (this.ignoreTrailingDot)
				{
					list[0] = list[0].replace(/\.+$/, "");
				}
				domains[list[0]] = true;
			}
			else
			{
				var hasIncludes = false;
				for (var i = 0; i < list.length; i++)
				{
					var domain = list[i];
					if (this.ignoreTrailingDot)
					{
						domain = domain.replace(/\.+$/, "");
					}
					if (domain == "")
					{
						continue;
					}
					var include;
					if (domain[0] == "~")
					{
						include = false;
						domain = domain.substr(1);
					}
					else
					{
						include = true;
						hasIncludes = true;
					}
					if (!domains)
					{
						domains = Object.create(null);
					}
					domains[domain] = include;
				}
				domains[""] = !hasIncludes;
			}
			this.domainSource = null;
		}
		Object.defineProperty(this, "domains",
			{
				value: domains,
				enumerable: true
			});
		return this.domains;
	},
	sitekeys: null,
	isActiveOnDomain: function(docDomain, sitekey)
	{
		if (this.sitekeys && (!sitekey || this.sitekeys.indexOf(sitekey.toUpperCase()) < 0))
		{
			return false;
		}
		if (!this.domains)
		{
			return true;
		}
		if (!docDomain)
		{
			return this.domains[""];
		}
		if (this.ignoreTrailingDot)
		{
			docDomain = docDomain.replace(/\.+$/, "");
		}
		docDomain = docDomain.toUpperCase();
		while (true)
		{
			if (docDomain in this.domains)
			{
				return this.domains[docDomain];
			}
			var nextDot = docDomain.indexOf(".");
			if (nextDot < 0)
			{
				break;
			}
			docDomain = docDomain.substr(nextDot + 1);
		}
		return this.domains[""];
	},
	isActiveOnlyOnDomain: function(docDomain)
	{
		if (!docDomain || !this.domains || this.domains[""])
		{
			return false;
		}
		if (this.ignoreTrailingDot)
		{
			docDomain = docDomain.replace(/\.+$/, "");
		}
		docDomain = docDomain.toUpperCase();
		for (var domain in this.domains)
		{
			if (this.domains[domain] && domain != docDomain && (domain.length <= docDomain.length || domain.indexOf("." + docDomain) != domain.length - docDomain.length - 1))
			{
				return false;
			}
		}
		return true;
	},
	serialize: function(buffer)
	{
		if (this._disabled || this._hitCount || this._lastHit)
		{
			Filter.prototype.serialize.call(this, buffer);
			if (this._disabled)
			{
				buffer.push("disabled=true");
			}
			if (this._hitCount)
			{
				buffer.push("hitCount=" + this._hitCount);
			}
			if (this._lastHit)
			{
				buffer.push("lastHit=" + this._lastHit);
			}
		}
	}
};

function RegExpFilter(text, regexpSource, contentType, matchCase, domains, thirdParty, sitekeys)
{
	ActiveFilter.call(this, text, domains, sitekeys);
	if (contentType != null)
	{
		this.contentType = contentType;
	}
	if (matchCase)
	{
		this.matchCase = matchCase;
	}
	if (thirdParty != null)
	{
		this.thirdParty = thirdParty;
	}
	if (sitekeys != null)
	{
		this.sitekeySource = sitekeys;
	}
	if (regexpSource.length >= 2 && regexpSource[0] == "/" && regexpSource[regexpSource.length - 1] == "/")
	{
		var regexp = new RegExp(regexpSource.substr(1, regexpSource.length - 2), this.matchCase ? "" : "i");
		Object.defineProperty(this, "regexp",
			{
				value: regexp
			});
	}
	else
	{
		this.regexpSource = regexpSource;
	}
}
RegExpFilter.prototype = {
	__proto__: ActiveFilter.prototype,
	domainSourceIsUpperCase: true,
	length: 1,
	domainSeparator: "|",
	regexpSource: null,
	get regexp()
	{
		var prop = Object.getOwnPropertyDescriptor(this, "regexp");
		if (prop)
		{
			return prop.value;
		}
		var source = this.regexpSource.replace(/\*+/g, "*").replace(/\^\|$/, "^").replace(/\W/g, "\\$&").replace(/\\\*/g, ".*").replace(/\\\^/g, "(?:[\\x00-\\x24\\x26-\\x2C\\x2F\\x3A-\\x40\\x5B-\\x5E\\x60\\x7B-\\x7F]|$)").replace(/^\\\|\\\|/, "^[\\w\\-]+:\\/+(?!\\/)(?:[^\\/]+\\.)?").replace(/^\\\|/, "^").replace(/\\\|$/, "$").replace(/^(\.\*)/, "").replace(/(\.\*)$/, "");
		var regexp = new RegExp(source, this.matchCase ? "" : "i");
		Object.defineProperty(this, "regexp",
			{
				value: regexp
			});
		return regexp;
	},
	contentType: 2147483647,
	matchCase: false,
	thirdParty: null,
	sitekeySource: null,
	get sitekeys()
	{
		var prop = Object.getOwnPropertyDescriptor(this, "sitekeys");
		if (prop)
		{
			return prop.value;
		}
		var sitekeys = null;
		if (this.sitekeySource)
		{
			sitekeys = this.sitekeySource.split("|");
			this.sitekeySource = null;
		}
		Object.defineProperty(this, "sitekeys",
			{
				value: sitekeys,
				enumerable: true
			});
		return this.sitekeys;
	},
	matches: function(location, contentType, docDomain, thirdParty, sitekey)
	{
		if (this.regexp.test(location) && this.isActiveOnDomain(docDomain, sitekey))
		{
			return true;
		}
		return false;
	}
};
Object.defineProperty(RegExpFilter.prototype, "0",
	{
		get: function()
		{
			return this;
		}
	});
RegExpFilter.fromText = function(text)
{
	var blocking = true;
	var origText = text;
	if (text.indexOf("@@") == 0)
	{
		blocking = false;
		text = text.substr(2);
	}
	var contentType = null;
	var matchCase = null;
	var domains = null;
	var sitekeys = null;
	var thirdParty = null;
	var collapse = null;
	var options;
	var match = text.indexOf("$") >= 0 ? Filter.optionsRegExp.exec(text) : null;
	if (match)
	{
		options = match[1].toUpperCase().split(",");
		text = match.input.substr(0, match.index);
		for (var _loopIndex6 = 0; _loopIndex6 < options.length; ++_loopIndex6)
		{
			var option = options[_loopIndex6];
			var value = null;
			var separatorIndex = option.indexOf("=");
			if (separatorIndex >= 0)
			{
				value = option.substr(separatorIndex + 1);
				option = option.substr(0, separatorIndex);
			}
			option = option.replace(/-/, "_");
			if (option in RegExpFilter.typeMap)
			{
				if (contentType == null)
				{
					contentType = 0;
				}
				contentType |= RegExpFilter.typeMap[option];
			}
			else if (option[0] == "~" && option.substr(1) in RegExpFilter.typeMap)
			{
				if (contentType == null)
				{
					contentType = RegExpFilter.prototype.contentType;
				}
				contentType &= ~RegExpFilter.typeMap[option.substr(1)];
			}
			else if (option == "MATCH_CASE")
			{
				matchCase = true;
			}
			else if (option == "~MATCH_CASE")
			{
				matchCase = false;
			}
			else if (option == "DOMAIN" && typeof value != "undefined")
			{
				domains = value;
			}
			else if (option == "THIRD_PARTY")
			{
				thirdParty = true;
			}
			else if (option == "~THIRD_PARTY")
			{
				thirdParty = false;
			}
			else if (option == "COLLAPSE")
			{
				collapse = true;
			}
			else if (option == "~COLLAPSE")
			{
				collapse = false;
			}
			else if (option == "SITEKEY" && typeof value != "undefined")
			{
				sitekeys = value;
			}
			else
			{
				return new InvalidFilter(origText, "Unknown option " + option.toLowerCase());
			}
		}
	}
	if (!blocking && (contentType == null || contentType & RegExpFilter.typeMap.DOCUMENT) && (!options || options.indexOf("DOCUMENT") < 0) && !/^\|?[\w\-]+:/.test(text))
	{
		if (contentType == null)
		{
			contentType = RegExpFilter.prototype.contentType;
		}
		contentType &= ~RegExpFilter.typeMap.DOCUMENT;
	}
	try
	{
		if (blocking)
		{
			return new BlockingFilter(origText, text, contentType, matchCase, domains, thirdParty, sitekeys, collapse);
		}
		else
		{
			return new WhitelistFilter(origText, text, contentType, matchCase, domains, thirdParty, sitekeys);
		}
	}
	catch (e)
	{
		return new InvalidFilter(origText, e);
	}
};
RegExpFilter.typeMap = {
	OTHER: 1,
	SCRIPT: 2,
	IMAGE: 4,
	STYLESHEET: 8,
	OBJECT: 16,
	SUBDOCUMENT: 32,
	DOCUMENT: 64,
	XBL: 1,
	PING: 1,
	XMLHTTPREQUEST: 2048,
	OBJECT_SUBREQUEST: 4096,
	DTD: 1,
	MEDIA: 16384,
	FONT: 32768,
	BACKGROUND: 4,
	POPUP: 268435456,
	ELEMHIDE: 1073741824
};
RegExpFilter.prototype.contentType &= ~ (RegExpFilter.typeMap.ELEMHIDE | RegExpFilter.typeMap.POPUP);

function BlockingFilter(text, regexpSource, contentType, matchCase, domains, thirdParty, sitekeys, collapse)
{
	RegExpFilter.call(this, text, regexpSource, contentType, matchCase, domains, thirdParty, sitekeys);
	this.collapse = collapse;
}
BlockingFilter.prototype = {
	__proto__: RegExpFilter.prototype,
	collapse: null
};

function WhitelistFilter(text, regexpSource, contentType, matchCase, domains, thirdParty, sitekeys)
{
	RegExpFilter.call(this, text, regexpSource, contentType, matchCase, domains, thirdParty, sitekeys);
}
WhitelistFilter.prototype = {
	__proto__: RegExpFilter.prototype
};

function ElemHideBase(text, domains, selector)
{
	ActiveFilter.call(this, text, domains || null);
	if (domains)
	{
		this.selectorDomain = domains.replace(/,~[^,]+/g, "").replace(/^~[^,]+,?/, "").toLowerCase();
	}
	this.selector = selector;
}
ElemHideBase.prototype = {
	__proto__: ActiveFilter.prototype,
	domainSeparator: ",",
	ignoreTrailingDot: false,
	selectorDomain: null,
	selector: null
};
ElemHideBase.fromText = function(text, domain, isException, tagName, attrRules, selector)
{
	if (!selector)
	{
		if (tagName == "*")
		{
			tagName = "";
		}
		var id = null;
		var additional = "";
		if (attrRules)
		{
			attrRules = attrRules.match(/\([\w\-]+(?:[$^*]?=[^\(\)"]*)?\)/g);
			for (var _loopIndex7 = 0; _loopIndex7 < attrRules.length; ++_loopIndex7)
			{
				var rule = attrRules[_loopIndex7];
				rule = rule.substr(1, rule.length - 2);
				var separatorPos = rule.indexOf("=");
				if (separatorPos > 0)
				{
					rule = rule.replace(/=/, "=\"") + "\"";
					additional += "[" + rule + "]";
				}
				else
				{
					if (id)
					{
						var Utils = require("utils").Utils;
						return new InvalidFilter(text, Utils.getString("filter_elemhide_duplicate_id"));
					}
					else
					{
						id = rule;
					}
				}
			}
		}
		if (id)
		{
			selector = tagName + "." + id + additional + "," + tagName + "#" + id + additional;
		}
		else if (tagName || additional)
		{
			selector = tagName + additional;
		}
		else
		{
			var Utils = require("utils").Utils;
			return new InvalidFilter(text, Utils.getString("filter_elemhide_nocriteria"));
		}
	}
	if (isException)
	{
		return new ElemHideException(text, domain, selector);
	}
	else
	{
		return new ElemHideFilter(text, domain, selector);
	}
};

function ElemHideFilter(text, domains, selector)
{
	ElemHideBase.call(this, text, domains, selector);
}
ElemHideFilter.prototype = {
	__proto__: ElemHideBase.prototype
};

function ElemHideException(text, domains, selector)
{
	ElemHideBase.call(this, text, domains, selector);
}
ElemHideException.prototype = {
	__proto__: ElemHideBase.prototype
};

function Matcher()
{
	this.clear();
}
Matcher.prototype = {
	filterByKeyword: null,
	keywordByFilter: null,
	clear: function()
	{
		this.filterByKeyword = Object.create(null);
		this.keywordByFilter = Object.create(null);
	},
	add: function(filter)
	{
		if (filter.text in this.keywordByFilter)
		{
			return;
		}
		var keyword = this.findKeyword(filter);
		var oldEntry = this.filterByKeyword[keyword];
		if (typeof oldEntry == "undefined")
		{
			this.filterByKeyword[keyword] = filter;
		}
		else if (oldEntry.length == 1)
		{
			this.filterByKeyword[keyword] = [oldEntry, filter];
		}
		else
		{
			oldEntry.push(filter);
		}
		this.keywordByFilter[filter.text] = keyword;
	},
	remove: function(filter)
	{
		if (!(filter.text in this.keywordByFilter))
		{
			return;
		}
		var keyword = this.keywordByFilter[filter.text];
		var list = this.filterByKeyword[keyword];
		if (list.length <= 1)
		{
			delete this.filterByKeyword[keyword];
		}
		else
		{
			var index = list.indexOf(filter);
			if (index >= 0)
			{
				list.splice(index, 1);
				if (list.length == 1)
				{
					this.filterByKeyword[keyword] = list[0];
				}
			}
		}
		delete this.keywordByFilter[filter.text];
	},
	findKeyword: function(filter)
	{
		var result = "";
		var text = filter.text;
		if (Filter.regexpRegExp.test(text))
		{
			return result;
		}
		var match = Filter.optionsRegExp.exec(text);
		if (match)
		{
			text = match.input.substr(0, match.index);
		}
		if (text.substr(0, 2) == "@@")
		{
			text = text.substr(2);
		}
		var candidates = text.toLowerCase().match(/[^a-z0-9%*][a-z0-9%]{3,}(?=[^a-z0-9%*])/g);
		if (!candidates)
		{
			return result;
		}
		var hash = this.filterByKeyword;
		var resultCount = 16777215;
		var resultLength = 0;
		for (var i = 0, l = candidates.length; i < l; i++)
		{
			var candidate = candidates[i].substr(1);
			var count = candidate in hash ? hash[candidate].length : 0;
			if (count < resultCount || count == resultCount && candidate.length > resultLength)
			{
				result = candidate;
				resultCount = count;
				resultLength = candidate.length;
			}
		}
		return result;
	},
	hasFilter: function(filter)
	{
		return filter.text in this.keywordByFilter;
	},
	getKeywordForFilter: function(filter)
	{
		if (filter.text in this.keywordByFilter)
		{
			return this.keywordByFilter[filter.text];
		}
		else
		{
			return null;
		}
	},
	_checkEntryMatch: function(keyword, location, contentType, docDomain, thirdParty, sitekey)
	{
		var list = this.filterByKeyword[keyword];
		for (var i = 0; i < list.length; i++)
		{
			var filter = list[i];
			if (filter.matches(location, contentType, docDomain, thirdParty, sitekey))
			{
				return filter;
			}
		}
		return null;
	},
	matchesAny: function(location, contentType, docDomain, thirdParty, sitekey)
	{
		var candidates = location.toLowerCase().match(/[a-z0-9%]{3,}/g);
		if (candidates === null)
		{
			candidates = [];
		}
		candidates.push("");
		for (var i = 0, l = candidates.length; i < l; i++)
		{
			var substr = candidates[i];
			if (substr in this.filterByKeyword)
			{
				var result = this._checkEntryMatch(substr, location, contentType, docDomain, thirdParty, sitekey);
				if (result)
				{
					return result;
				}
			}
		}
		return null;
	}
};

function CombinedMatcher()
{
	this.blacklist = new Matcher();
	this.whitelist = new Matcher();
	this.resultCache = Object.create(null);
}
CombinedMatcher.maxCacheEntries = 1000;
CombinedMatcher.prototype = {
	blacklist: null,
	whitelist: null,
	resultCache: null,
	cacheEntries: 0,
	clear: function()
	{
		this.blacklist.clear();
		this.whitelist.clear();
		this.resultCache = Object.create(null);
		this.cacheEntries = 0;
	},
	add: function(filter)
	{
		if (filter instanceof WhitelistFilter)
		{
			this.whitelist.add(filter);
		}
		else
		{
			this.blacklist.add(filter);
		}
		if (this.cacheEntries > 0)
		{
			this.resultCache = Object.create(null);
			this.cacheEntries = 0;
		}
	},
	remove: function(filter)
	{
		if (filter instanceof WhitelistFilter)
		{
			this.whitelist.remove(filter);
		}
		else
		{
			this.blacklist.remove(filter);
		}
		if (this.cacheEntries > 0)
		{
			this.resultCache = Object.create(null);
			this.cacheEntries = 0;
		}
	},
	findKeyword: function(filter)
	{
		if (filter instanceof WhitelistFilter)
		{
			return this.whitelist.findKeyword(filter);
		}
		else
		{
			return this.blacklist.findKeyword(filter);
		}
	},
	hasFilter: function(filter)
	{
		if (filter instanceof WhitelistFilter)
		{
			return this.whitelist.hasFilter(filter);
		}
		else
		{
			return this.blacklist.hasFilter(filter);
		}
	},
	getKeywordForFilter: function(filter)
	{
		if (filter instanceof WhitelistFilter)
		{
			return this.whitelist.getKeywordForFilter(filter);
		}
		else
		{
			return this.blacklist.getKeywordForFilter(filter);
		}
	},
	isSlowFilter: function(filter)
	{
		var matcher = filter instanceof WhitelistFilter ? this.whitelist : this.blacklist;
		if (matcher.hasFilter(filter))
		{
			return !matcher.getKeywordForFilter(filter);
		}
		else
		{
			return !matcher.findKeyword(filter);
		}
	},
	matchesAnyInternal: function(location, contentType, docDomain, thirdParty, sitekey)
	{
		var candidates = location.toLowerCase().match(/[a-z0-9%]{3,}/g);
		if (candidates === null)
		{
			candidates = [];
		}
		candidates.push("");
		var blacklistHit = null;
		for (var i = 0, l = candidates.length; i < l; i++)
		{
			var substr = candidates[i];
			if (substr in this.whitelist.filterByKeyword)
			{
				var result = this.whitelist._checkEntryMatch(substr, location, contentType, docDomain, thirdParty, sitekey);
				if (result)
				{
					return result;
				}
			}
			if (substr in this.blacklist.filterByKeyword && blacklistHit === null)
			{
				blacklistHit = this.blacklist._checkEntryMatch(substr, location, contentType, docDomain, thirdParty, sitekey);
			}
		}
		return blacklistHit;
	},
	matchesAny: function(location, docDomain)
	{
		var key = location + " " + docDomain + " ";
		if (key in this.resultCache)
		{
			return this.resultCache[key];
		}
		var result = this.matchesAnyInternal(location, 0, docDomain, null, null);
		if (this.cacheEntries >= CombinedMatcher.maxCacheEntries)
		{
			this.resultCache = Object.create(null);
			this.cacheEntries = 0;
		}
		this.resultCache[key] = result;
		this.cacheEntries++;
		return result;
	}
};
var defaultMatcher = new CombinedMatcher();

function FindProxyForURL(url, host) {
	if ( isPlainHostName(host) === true ) {
		return direct;
	}
	if ( check_ipv4(host) === true ) {
		return getProxyFromIP(host);
	}
	if ( isInDomains(white_domains, host) === true ) {
		return nowall_proxy;
	}
	if ( defaultMatcher.matchesAny(url, host) instanceof BlockingFilter ) {
		return wall_proxy;
	}

	var strIp = dnsResolve(host);
	if (!strIp) {
		return wall_proxy;
	}
	return getProxyFromIP(strIp);
}

