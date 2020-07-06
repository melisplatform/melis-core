/*!
 * jquery.fancytree.js
 * Tree view control with support for lazy loading and much more.
 * https://github.com/mar10/fancytree/
 *
 * Copyright (c) 2008-2019, Martin Wendt (https://wwWendt.de)
 * Released under the MIT license
 * https://github.com/mar10/fancytree/wiki/LicenseInfo
 *
 * @version 2.31.0
 * @date 2019-05-31T11:32:38Z
 */

/** Core Fancytree module.
 */

// UMD wrapper for the Fancytree core module
(function(factory) {
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define(["jquery", "./jquery.fancytree.ui-deps"], factory);
	} else if (typeof module === "object" && module.exports) {
		// Node/CommonJS
		require("./jquery.fancytree.ui-deps");
		module.exports = factory(require("jquery"));
	} else {
		// Browser globals
		factory(jQuery);
	}
})(function($) {
	"use strict";

	// prevent duplicate loading
	if ($.ui && $.ui.fancytree) {
		$.ui.fancytree.warn("Fancytree: ignored duplicate include");
		return;
	}

	/******************************************************************************
	 * Private functions and variables
	 */

	var i,
		attr,
		FT = null, // initialized below
		TEST_IMG = new RegExp(/\.|\//), // strings are considered image urls if they contain '.' or '/'
		REX_HTML = /[&<>"'/]/g, // Escape those characters
		REX_TOOLTIP = /[<>"'/]/g, // Don't escape `&` in tooltips
		RECURSIVE_REQUEST_ERROR = "$recursive_request",
		ENTITY_MAP = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
			"/": "&#x2F;",
		},
		IGNORE_KEYCODES = { 16: true, 17: true, 18: true },
		SPECIAL_KEYCODES = {
			8: "backspace",
			9: "tab",
			10: "return",
			13: "return",
			// 16: null, 17: null, 18: null,  // ignore shift, ctrl, alt
			19: "pause",
			20: "capslock",
			27: "esc",
			32: "space",
			33: "pageup",
			34: "pagedown",
			35: "end",
			36: "home",
			37: "left",
			38: "up",
			39: "right",
			40: "down",
			45: "insert",
			46: "del",
			59: ";",
			61: "=",
			// 91: null, 93: null,  // ignore left and right meta
			96: "0",
			97: "1",
			98: "2",
			99: "3",
			100: "4",
			101: "5",
			102: "6",
			103: "7",
			104: "8",
			105: "9",
			106: "*",
			107: "+",
			109: "-",
			110: ".",
			111: "/",
			112: "f1",
			113: "f2",
			114: "f3",
			115: "f4",
			116: "f5",
			117: "f6",
			118: "f7",
			119: "f8",
			120: "f9",
			121: "f10",
			122: "f11",
			123: "f12",
			144: "numlock",
			145: "scroll",
			173: "-",
			186: ";",
			187: "=",
			188: ",",
			189: "-",
			190: ".",
			191: "/",
			192: "`",
			219: "[",
			220: "\\",
			221: "]",
			222: "'",
		},
		MODIFIERS = {
			16: "shift",
			17: "ctrl",
			18: "alt",
			91: "meta",
			93: "meta",
		},
		MOUSE_BUTTONS = { 0: "", 1: "left", 2: "middle", 3: "right" },
		// Boolean attributes that can be set with equivalent class names in the LI tags
		// Note: v2.23: checkbox and hideCheckbox are *not* in this list
		CLASS_ATTRS = "active expanded focus folder lazy radiogroup selected unselectable unselectableIgnore".split(
			" "
		),
		CLASS_ATTR_MAP = {},
		// Top-level Fancytree attributes, that can be set by dict
		TREE_ATTRS = "columns types".split(" "),
		// TREE_ATTR_MAP = {},
		// Top-level FancytreeNode attributes, that can be set by dict
		NODE_ATTRS = "checkbox expanded extraClasses folder icon iconTooltip key lazy partsel radiogroup refKey selected statusNodeType title tooltip type unselectable unselectableIgnore unselectableStatus".split(
			" "
		),
		NODE_ATTR_MAP = {},
		// Mapping of lowercase -> real name (because HTML5 data-... attribute only supports lowercase)
		NODE_ATTR_LOWERCASE_MAP = {},
		// Attribute names that should NOT be added to node.data
		NONE_NODE_DATA_MAP = {
			active: true,
			children: true,
			data: true,
			focus: true,
		};

	for (i = 0; i < CLASS_ATTRS.length; i++) {
		CLASS_ATTR_MAP[CLASS_ATTRS[i]] = true;
	}
	for (i = 0; i < NODE_ATTRS.length; i++) {
		attr = NODE_ATTRS[i];
		NODE_ATTR_MAP[attr] = true;
		if (attr !== attr.toLowerCase()) {
			NODE_ATTR_LOWERCASE_MAP[attr.toLowerCase()] = attr;
		}
	}
	// for(i=0; i<TREE_ATTRS.length; i++) {
	// 	TREE_ATTR_MAP[TREE_ATTRS[i]] = true;
	// }

	function _assert(cond, msg) {
		// TODO: see qunit.js extractStacktrace()
		if (!cond) {
			msg = msg ? ": " + msg : "";
			// consoleApply("assert", [!!cond, msg]);
			$.error("Fancytree assertion failed" + msg);
		}
	}

	_assert($.ui, "Fancytree requires jQuery UI (http://jqueryui.com)");

	function consoleApply(method, args) {
		var i,
			s,
			fn = window.console ? window.console[method] : null;

		if (fn) {
			try {
				fn.apply(window.console, args);
			} catch (e) {
				// IE 8?
				s = "";
				for (i = 0; i < args.length; i++) {
					s += args[i];
				}
				fn(s);
			}
		}
	}

	/* support: IE8 Polyfil for Date.now() */
	if (!Date.now) {
		Date.now = function now() {
			return new Date().getTime();
		};
	}

	/*Return true if x is a FancytreeNode.*/
	function _isNode(x) {
		return !!(x.tree && x.statusNodeType !== undefined);
	}

	/** Return true if dotted version string is equal or higher than requested version.
	 *
	 * See http://jsfiddle.net/mar10/FjSAN/
	 */
	function isVersionAtLeast(dottedVersion, major, minor, patch) {
		var i,
			v,
			t,
			verParts = $.map($.trim(dottedVersion).split("."), function(e) {
				return parseInt(e, 10);
			}),
			testParts = $.map(
				Array.prototype.slice.call(arguments, 1),
				function(e) {
					return parseInt(e, 10);
				}
			);

		for (i = 0; i < testParts.length; i++) {
			v = verParts[i] || 0;
			t = testParts[i] || 0;
			if (v !== t) {
				return v > t;
			}
		}
		return true;
	}

	/**
	 * Deep-merge a list of objects (but replace array-type options).
	 *
	 * jQuery's $.extend(true, ...) method does a deep merge, that also merges Arrays.
	 * This variant is used to merge extension defaults with user options, and should
	 * merge objects, but override arrays (for example the `triggerStart: [...]` option
	 * of ext-edit). Also `null` values are copied over and not skipped.
	 *
	 * See issue #876
	 *
	 * Example:
	 * _simpleDeepMerge({}, o1, o2);
	 */
	function _simpleDeepMerge() {
		var options,
			name,
			src,
			copy,
			clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length;

		// Handle case when target is a string or something (possible in deep copy)
		if (typeof target !== "object" && !$.isFunction(target)) {
			target = {};
		}
		if (i === length) {
			throw Error("need at least two args");
		}
		for (; i < length; i++) {
			// Only deal with non-null/undefined values
			if ((options = arguments[i]) != null) {
				// Extend the base object
				for (name in options) {
					if (options.hasOwnProperty(name)) {
						src = target[name];
						copy = options[name];
						// Prevent never-ending loop
						if (target === copy) {
							continue;
						}
						// Recurse if we're merging plain objects
						// (NOTE: unlike $.extend, we don't merge arrays, but replace them)
						if (copy && $.isPlainObject(copy)) {
							clone = src && $.isPlainObject(src) ? src : {};
							// Never move original objects, clone them
							target[name] = _simpleDeepMerge(clone, copy);
							// Don't bring in undefined values
						} else if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}
			}
		}
		// Return the modified object
		return target;
	}

	/** Return a wrapper that calls sub.methodName() and exposes
	 *  this             : tree
	 *  this._local      : tree.ext.EXTNAME
	 *  this._super      : base.methodName.call()
	 *  this._superApply : base.methodName.apply()
	 */
	function _makeVirtualFunction(methodName, tree, base, extension, extName) {
		// $.ui.fancytree.debug("_makeVirtualFunction", methodName, tree, base, extension, extName);
		// if(rexTestSuper && !rexTestSuper.test(func)){
		//     // extension.methodName() doesn't call _super(), so no wrapper required
		//     return func;
		// }
		// Use an immediate function as closure
		var proxy = (function() {
			var prevFunc = tree[methodName], // org. tree method or prev. proxy
				baseFunc = extension[methodName], //
				_local = tree.ext[extName],
				_super = function() {
					return prevFunc.apply(tree, arguments);
				},
				_superApply = function(args) {
					return prevFunc.apply(tree, args);
				};

			// Return the wrapper function
			return function() {
				var prevLocal = tree._local,
					prevSuper = tree._super,
					prevSuperApply = tree._superApply;

				try {
					tree._local = _local;
					tree._super = _super;
					tree._superApply = _superApply;
					return baseFunc.apply(tree, arguments);
				} finally {
					tree._local = prevLocal;
					tree._super = prevSuper;
					tree._superApply = prevSuperApply;
				}
			};
		})(); // end of Immediate Function
		return proxy;
	}

	/**
	 * Subclass `base` by creating proxy functions
	 */
	function _subclassObject(tree, base, extension, extName) {
		// $.ui.fancytree.debug("_subclassObject", tree, base, extension, extName);
		for (var attrName in extension) {
			if (typeof extension[attrName] === "function") {
				if (typeof tree[attrName] === "function") {
					// override existing method
					tree[attrName] = _makeVirtualFunction(
						attrName,
						tree,
						base,
						extension,
						extName
					);
				} else if (attrName.charAt(0) === "_") {
					// Create private methods in tree.ext.EXTENSION namespace
					tree.ext[extName][attrName] = _makeVirtualFunction(
						attrName,
						tree,
						base,
						extension,
						extName
					);
				} else {
					$.error(
						"Could not override tree." +
							attrName +
							". Use prefix '_' to create tree." +
							extName +
							"._" +
							attrName
					);
				}
			} else {
				// Create member variables in tree.ext.EXTENSION namespace
				if (attrName !== "options") {
					tree.ext[extName][attrName] = extension[attrName];
				}
			}
		}
	}

	function _getResolvedPromise(context, argArray) {
		if (context === undefined) {
			return $.Deferred(function() {
				this.resolve();
			}).promise();
		}
		return $.Deferred(function() {
			this.resolveWith(context, argArray);
		}).promise();
	}

	function _getRejectedPromise(context, argArray) {
		if (context === undefined) {
			return $.Deferred(function() {
				this.reject();
			}).promise();
		}
		return $.Deferred(function() {
			this.rejectWith(context, argArray);
		}).promise();
	}

	function _makeResolveFunc(deferred, context) {
		return function() {
			deferred.resolveWith(context);
		};
	}

	function _getElementDataAsDict($el) {
		// Evaluate 'data-NAME' attributes with special treatment for 'data-json'.
		var d = $.extend({}, $el.data()),
			json = d.json;

		delete d.fancytree; // added to container by widget factory (old jQuery UI)
		delete d.uiFancytree; // added to container by widget factory

		if (json) {
			delete d.json;
			// <li data-json='...'> is already returned as object (http://api.jquery.com/data/#data-html5)
			d = $.extend(d, json);
		}
		return d;
	}

	function _escapeTooltip(s) {
		return ("" + s).replace(REX_TOOLTIP, function(s) {
			return ENTITY_MAP[s];
		});
	}

	// TODO: use currying
	function _makeNodeTitleMatcher(s) {
		s = s.toLowerCase();
		return function(node) {
			return node.title.toLowerCase().indexOf(s) >= 0;
		};
	}

	function _makeNodeTitleStartMatcher(s) {
		var reMatch = new RegExp("^" + s, "i");
		return function(node) {
			return reMatch.test(node.title);
		};
	}

	/******************************************************************************
	 * FancytreeNode
	 */

	/**
	 * Creates a new FancytreeNode
	 *
	 * @class FancytreeNode
	 * @classdesc A FancytreeNode represents the hierarchical data model and operations.
	 *
	 * @param {FancytreeNode} parent
	 * @param {NodeData} obj
	 *
	 * @property {Fancytree} tree The tree instance
	 * @property {FancytreeNode} parent The parent node
	 * @property {string} key Node id (must be unique inside the tree)
	 * @property {string} title Display name (may contain HTML)
	 * @property {object} data Contains all extra data that was passed on node creation
	 * @property {FancytreeNode[] | null | undefined} children Array of child nodes.<br>
	 *     For lazy nodes, null or undefined means 'not yet loaded'. Use an empty array
	 *     to define a node that has no children.
	 * @property {boolean} expanded Use isExpanded(), setExpanded() to access this property.
	 * @property {string} extraClasses Additional CSS classes, added to the node's `&lt;span>`.<br>
	 *     Note: use `node.add/remove/toggleClass()` to modify.
	 * @property {boolean} folder Folder nodes have different default icons and click behavior.<br>
	 *     Note: Also non-folders may have children.
	 * @property {string} statusNodeType null for standard nodes. Otherwise type of special system node: 'error', 'loading', 'nodata', or 'paging'.
	 * @property {boolean} lazy True if this node is loaded on demand, i.e. on first expansion.
	 * @property {boolean} selected Use isSelected(), setSelected() to access this property.
	 * @property {string} tooltip Alternative description used as hover popup
	 * @property {string} iconTooltip Description used as hover popup for icon. @since 2.27
	 * @property {string} type Node type, used with tree.types map. @since 2.27
	 */
	function FancytreeNode(parent, obj) {
		var i, l, name, cl;

		this.parent = parent;
		this.tree = parent.tree;
		this.ul = null;
		this.li = null; // <li id='key' ftnode=this> tag
		this.statusNodeType = null; // if this is a temp. node to display the status of its parent
		this._isLoading = false; // if this node itself is loading
		this._error = null; // {message: '...'} if a load error occurred
		this.data = {};

		// TODO: merge this code with node.toDict()
		// copy attributes from obj object
		for (i = 0, l = NODE_ATTRS.length; i < l; i++) {
			name = NODE_ATTRS[i];
			this[name] = obj[name];
		}
		// unselectableIgnore and unselectableStatus imply unselectable
		if (
			this.unselectableIgnore != null ||
			this.unselectableStatus != null
		) {
			this.unselectable = true;
		}
		if (obj.hideCheckbox) {
			$.error(
				"'hideCheckbox' node option was removed in v2.23.0: use 'checkbox: false'"
			);
		}
		// node.data += obj.data
		if (obj.data) {
			$.extend(this.data, obj.data);
		}
		// Copy all other attributes to this.data.NAME
		for (name in obj) {
			if (
				!NODE_ATTR_MAP[name] &&
				!$.isFunction(obj[name]) &&
				!NONE_NODE_DATA_MAP[name]
			) {
				// node.data.NAME = obj.NAME
				this.data[name] = obj[name];
			}
		}

		// Fix missing key
		if (this.key == null) {
			// test for null OR undefined
			if (this.tree.options.defaultKey) {
				this.key = this.tree.options.defaultKey(this);
				_assert(this.key, "defaultKey() must return a unique key");
			} else {
				this.key = "_" + FT._nextNodeKey++;
			}
		} else {
			this.key = "" + this.key; // Convert to string (#217)
		}

		// Fix tree.activeNode
		// TODO: not elegant: we use obj.active as marker to set tree.activeNode
		// when loading from a dictionary.
		if (obj.active) {
			_assert(
				this.tree.activeNode === null,
				"only one active node allowed"
			);
			this.tree.activeNode = this;
		}
		if (obj.selected) {
			// #186
			this.tree.lastSelectedNode = this;
		}
		// TODO: handle obj.focus = true

		// Create child nodes
		cl = obj.children;
		if (cl) {
			if (cl.length) {
				this._setChildren(cl);
			} else {
				// if an empty array was passed for a lazy node, keep it, in order to mark it 'loaded'
				this.children = this.lazy ? [] : null;
			}
		} else {
			this.children = null;
		}
		// Add to key/ref map (except for root node)
		//	if( parent ) {
		this.tree._callHook("treeRegisterNode", this.tree, true, this);
		//	}
	}

	FancytreeNode.prototype = /** @lends FancytreeNode# */ {
		/* Return the direct child FancytreeNode with a given key, index. */
		_findDirectChild: function(ptr) {
			var i,
				l,
				cl = this.children;

			if (cl) {
				if (typeof ptr === "string") {
					for (i = 0, l = cl.length; i < l; i++) {
						if (cl[i].key === ptr) {
							return cl[i];
						}
					}
				} else if (typeof ptr === "number") {
					return this.children[ptr];
				} else if (ptr.parent === this) {
					return ptr;
				}
			}
			return null;
		},
		// TODO: activate()
		// TODO: activateSilently()
		/* Internal helper called in recursive addChildren sequence.*/
		_setChildren: function(children) {
			_assert(
				children && (!this.children || this.children.length === 0),
				"only init supported"
			);
			this.children = [];
			for (var i = 0, l = children.length; i < l; i++) {
				this.children.push(new FancytreeNode(this, children[i]));
			}
			this.tree._callHook(
				"treeStructureChanged",
				this.tree,
				"setChildren"
			);
		},
		/**
		 * Append (or insert) a list of child nodes.
		 *
		 * @param {NodeData[]} children array of child node definitions (also single child accepted)
		 * @param {FancytreeNode | string | Integer} [insertBefore] child node (or key or index of such).
		 *     If omitted, the new children are appended.
		 * @returns {FancytreeNode} first child added
		 *
		 * @see FancytreeNode#applyPatch
		 */
		addChildren: function(children, insertBefore) {
			var i,
				l,
				pos,
				origFirstChild = this.getFirstChild(),
				origLastChild = this.getLastChild(),
				firstNode = null,
				nodeList = [];

			if ($.isPlainObject(children)) {
				children = [children];
			}
			if (!this.children) {
				this.children = [];
			}
			for (i = 0, l = children.length; i < l; i++) {
				nodeList.push(new FancytreeNode(this, children[i]));
			}
			firstNode = nodeList[0];
			if (insertBefore == null) {
				this.children = this.children.concat(nodeList);
			} else {
				// Returns null if insertBefore is not a direct child:
				insertBefore = this._findDirectChild(insertBefore);
				pos = $.inArray(insertBefore, this.children);
				_assert(pos >= 0, "insertBefore must be an existing child");
				// insert nodeList after children[pos]
				this.children.splice.apply(
					this.children,
					[pos, 0].concat(nodeList)
				);
			}
			if (origFirstChild && !insertBefore) {
				// #708: Fast path -- don't render every child of root, just the new ones!
				// #723, #729: but only if it's appended to an existing child list
				for (i = 0, l = nodeList.length; i < l; i++) {
					nodeList[i].render(); // New nodes were never rendered before
				}
				// Adjust classes where status may have changed
				// Has a first child
				if (origFirstChild !== this.getFirstChild()) {
					// Different first child -- recompute classes
					origFirstChild.renderStatus();
				}
				if (origLastChild !== this.getLastChild()) {
					// Different last child -- recompute classes
					origLastChild.renderStatus();
				}
			} else if (!this.parent || this.parent.ul || this.tr) {
				// render if the parent was rendered (or this is a root node)
				this.render();
			}
			if (this.tree.options.selectMode === 3) {
				this.fixSelection3FromEndNodes();
			}
			this.triggerModifyChild(
				"add",
				nodeList.length === 1 ? nodeList[0] : null
			);
			return firstNode;
		},
		/**
		 * Add class to node's span tag and to .extraClasses.
		 *
		 * @param {string} className class name
		 *
		 * @since 2.17
		 */
		addClass: function(className) {
			return this.toggleClass(className, true);
		},
		/**
		 * Append or prepend a node, or append a child node.
		 *
		 * This a convenience function that calls addChildren()
		 *
		 * @param {NodeData} node node definition
		 * @param {string} [mode=child] 'before', 'after', 'firstChild', or 'child' ('over' is a synonym for 'child')
		 * @returns {FancytreeNode} new node
		 */
		addNode: function(node, mode) {
			if (mode === undefined || mode === "over") {
				mode = "child";
			}
			switch (mode) {
				case "after":
					return this.getParent().addChildren(
						node,
						this.getNextSibling()
					);
				case "before":
					return this.getParent().addChildren(node, this);
				case "firstChild":
					// Insert before the first child if any
					var insertBefore = this.children ? this.children[0] : null;
					return this.addChildren(node, insertBefore);
				case "child":
				case "over":
					return this.addChildren(node);
			}
			_assert(false, "Invalid mode: " + mode);
		},
		/**Add child status nodes that indicate 'More...', etc.
		 *
		 * This also maintains the node's `partload` property.
		 * @param {boolean|object} node optional node definition. Pass `false` to remove all paging nodes.
		 * @param {string} [mode='child'] 'child'|firstChild'
		 * @since 2.15
		 */
		addPagingNode: function(node, mode) {
			var i, n;

			mode = mode || "child";
			if (node === false) {
				for (i = this.children.length - 1; i >= 0; i--) {
					n = this.children[i];
					if (n.statusNodeType === "paging") {
						this.removeChild(n);
					}
				}
				this.partload = false;
				return;
			}
			node = $.extend(
				{
					title: this.tree.options.strings.moreData,
					statusNodeType: "paging",
					icon: false,
				},
				node
			);
			this.partload = true;
			return this.addNode(node, mode);
		},
		/**
		 * Append new node after this.
		 *
		 * This a convenience function that calls addNode(node, 'after')
		 *
		 * @param {NodeData} node node definition
		 * @returns {FancytreeNode} new node
		 */
		appendSibling: function(node) {
			return this.addNode(node, "after");
		},
		/**
		 * Modify existing child nodes.
		 *
		 * @param {NodePatch} patch
		 * @returns {$.Promise}
		 * @see FancytreeNode#addChildren
		 */
		applyPatch: function(patch) {
			// patch [key, null] means 'remove'
			if (patch === null) {
				this.remove();
				return _getResolvedPromise(this);
			}
			// TODO: make sure that root node is not collapsed or modified
			// copy (most) attributes to node.ATTR or node.data.ATTR
			var name,
				promise,
				v,
				IGNORE_MAP = { children: true, expanded: true, parent: true }; // TODO: should be global

			for (name in patch) {
				if (patch.hasOwnProperty(name)) {
					v = patch[name];
					if (!IGNORE_MAP[name] && !$.isFunction(v)) {
						if (NODE_ATTR_MAP[name]) {
							this[name] = v;
						} else {
							this.data[name] = v;
						}
					}
				}
			}
			// Remove and/or create children
			if (patch.hasOwnProperty("children")) {
				this.removeChildren();
				if (patch.children) {
					// only if not null and not empty list
					// TODO: addChildren instead?
					this._setChildren(patch.children);
				}
				// TODO: how can we APPEND or INSERT child nodes?
			}
			if (this.isVisible()) {
				this.renderTitle();
				this.renderStatus();
			}
			// Expand collapse (final step, since this may be async)
			if (patch.hasOwnProperty("expanded")) {
				promise = this.setExpanded(patch.expanded);
			} else {
				promise = _getResolvedPromise(this);
			}
			return promise;
		},
		/** Collapse all sibling nodes.
		 * @returns {$.Promise}
		 */
		collapseSiblings: function() {
			return this.tree._callHook("nodeCollapseSiblings", this);
		},
		/** Copy this node as sibling or child of `node`.
		 *
		 * @param {FancytreeNode} node source node
		 * @param {string} [mode=child] 'before' | 'after' | 'child'
		 * @param {Function} [map] callback function(NodeData) that could modify the new node
		 * @returns {FancytreeNode} new
		 */
		copyTo: function(node, mode, map) {
			return node.addNode(this.toDict(true, map), mode);
		},
		/** Count direct and indirect children.
		 *
		 * @param {boolean} [deep=true] pass 'false' to only count direct children
		 * @returns {int} number of child nodes
		 */
		countChildren: function(deep) {
			var cl = this.children,
				i,
				l,
				n;
			if (!cl) {
				return 0;
			}
			n = cl.length;
			if (deep !== false) {
				for (i = 0, l = n; i < l; i++) {
					n += cl[i].countChildren();
				}
			}
			return n;
		},
		// TODO: deactivate()
		/** Write to browser console if debugLevel >= 4 (prepending node info)
		 *
		 * @param {*} msg string or object or array of such
		 */
		debug: function(msg) {
			if (this.tree.options.debugLevel >= 4) {
				Array.prototype.unshift.call(arguments, this.toString());
				consoleApply("log", arguments);
			}
		},
		/** Deprecated.
		 * @deprecated since 2014-02-16. Use resetLazy() instead.
		 */
		discard: function() {
			this.warn(
				"FancytreeNode.discard() is deprecated since 2014-02-16. Use .resetLazy() instead."
			);
			return this.resetLazy();
		},
		/** Remove DOM elements for all descendents. May be called on .collapse event
		 * to keep the DOM small.
		 * @param {boolean} [includeSelf=false]
		 */
		discardMarkup: function(includeSelf) {
			var fn = includeSelf ? "nodeRemoveMarkup" : "nodeRemoveChildMarkup";
			this.tree._callHook(fn, this);
		},
		/** Write error to browser console if debugLevel >= 1 (prepending tree info)
		 *
		 * @param {*} msg string or object or array of such
		 */
		error: function(msg) {
			if (this.tree.options.debugLevel >= 1) {
				Array.prototype.unshift.call(arguments, this.toString());
				consoleApply("error", arguments);
			}
		},
		/**Find all nodes that match condition (excluding self).
		 *
		 * @param {string | function(node)} match title string to search for, or a
		 *     callback function that returns `true` if a node is matched.
		 * @returns {FancytreeNode[]} array of nodes (may be empty)
		 */
		findAll: function(match) {
			match = $.isFunction(match) ? match : _makeNodeTitleMatcher(match);
			var res = [];
			this.visit(function(n) {
				if (match(n)) {
					res.push(n);
				}
			});
			return res;
		},
		/**Find first node that matches condition (excluding self).
		 *
		 * @param {string | function(node)} match title string to search for, or a
		 *     callback function that returns `true` if a node is matched.
		 * @returns {FancytreeNode} matching node or null
		 * @see FancytreeNode#findAll
		 */
		findFirst: function(match) {
			match = $.isFunction(match) ? match : _makeNodeTitleMatcher(match);
			var res = null;
			this.visit(function(n) {
				if (match(n)) {
					res = n;
					return false;
				}
			});
			return res;
		},
		/** Find a node relative to self.
		 *
		 * @param {number|string} where The keyCode that would normally trigger this move,
		 *		or a keyword ('down', 'first', 'last', 'left', 'parent', 'right', 'up').
		 * @returns {FancytreeNode}
		 * @since v2.31
		 */
		findRelatedNode: function(where, includeHidden) {
			return this.tree.findRelatedNode(this, where, includeHidden);
		},
		/* Apply selection state (internal use only) */
		_changeSelectStatusAttrs: function(state) {
			var changed = false,
				opts = this.tree.options,
				unselectable = FT.evalOption(
					"unselectable",
					this,
					this,
					opts,
					false
				),
				unselectableStatus = FT.evalOption(
					"unselectableStatus",
					this,
					this,
					opts,
					undefined
				);

			if (unselectable && unselectableStatus != null) {
				state = unselectableStatus;
			}
			switch (state) {
				case false:
					changed = this.selected || this.partsel;
					this.selected = false;
					this.partsel = false;
					break;
				case true:
					changed = !this.selected || !this.partsel;
					this.selected = true;
					this.partsel = true;
					break;
				case undefined:
					changed = this.selected || !this.partsel;
					this.selected = false;
					this.partsel = true;
					break;
				default:
					_assert(false, "invalid state: " + state);
			}
			// this.debug("fixSelection3AfterLoad() _changeSelectStatusAttrs()", state, changed);
			if (changed) {
				this.renderStatus();
			}
			return changed;
		},
		/**
		 * Fix selection status, after this node was (de)selected in multi-hier mode.
		 * This includes (de)selecting all children.
		 */
		fixSelection3AfterClick: function(callOpts) {
			var flag = this.isSelected();

			//		this.debug("fixSelection3AfterClick()");

			this.visit(function(node) {
				node._changeSelectStatusAttrs(flag);
				if (node.radiogroup) {
					// #931: don't (de)select this branch
					return "skip";
				}
			});
			this.fixSelection3FromEndNodes(callOpts);
		},
		/**
		 * Fix selection status for multi-hier mode.
		 * Only end-nodes are considered to update the descendants branch and parents.
		 * Should be called after this node has loaded new children or after
		 * children have been modified using the API.
		 */
		fixSelection3FromEndNodes: function(callOpts) {
			var opts = this.tree.options;

			//		this.debug("fixSelection3FromEndNodes()");
			_assert(opts.selectMode === 3, "expected selectMode 3");

			// Visit all end nodes and adjust their parent's `selected` and `partsel`
			// attributes. Return selection state true, false, or undefined.
			function _walk(node) {
				var i,
					l,
					child,
					s,
					state,
					allSelected,
					someSelected,
					unselIgnore,
					unselState,
					children = node.children;

				if (children && children.length) {
					// check all children recursively
					allSelected = true;
					someSelected = false;

					for (i = 0, l = children.length; i < l; i++) {
						child = children[i];
						// the selection state of a node is not relevant; we need the end-nodes
						s = _walk(child);
						// if( !child.unselectableIgnore ) {
						unselIgnore = FT.evalOption(
							"unselectableIgnore",
							child,
							child,
							opts,
							false
						);
						if (!unselIgnore) {
							if (s !== false) {
								someSelected = true;
							}
							if (s !== true) {
								allSelected = false;
							}
						}
					}
					// eslint-disable-next-line no-nested-ternary
					state = allSelected
						? true
						: someSelected
						? undefined
						: false;
				} else {
					// This is an end-node: simply report the status
					unselState = FT.evalOption(
						"unselectableStatus",
						node,
						node,
						opts,
						undefined
					);
					state = unselState == null ? !!node.selected : !!unselState;
				}
				// #939: Keep a `partsel` flag that was explicitly set on a lazy node
				if (
					node.partsel &&
					!node.selected &&
					node.lazy &&
					node.children == null
				) {
					state = undefined;
				}
				node._changeSelectStatusAttrs(state);
				return state;
			}
			_walk(this);

			// Update parent's state
			this.visitParents(function(node) {
				var i,
					l,
					child,
					state,
					unselIgnore,
					unselState,
					children = node.children,
					allSelected = true,
					someSelected = false;

				for (i = 0, l = children.length; i < l; i++) {
					child = children[i];
					unselIgnore = FT.evalOption(
						"unselectableIgnore",
						child,
						child,
						opts,
						false
					);
					if (!unselIgnore) {
						unselState = FT.evalOption(
							"unselectableStatus",
							child,
							child,
							opts,
							undefined
						);
						state =
							unselState == null
								? !!child.selected
								: !!unselState;
						// When fixing the parents, we trust the sibling status (i.e.
						// we don't recurse)
						if (state || child.partsel) {
							someSelected = true;
						}
						if (!state) {
							allSelected = false;
						}
					}
				}
				// eslint-disable-next-line no-nested-ternary
				state = allSelected ? true : someSelected ? undefined : false;
				node._changeSelectStatusAttrs(state);
			});
		},
		// TODO: focus()
		/**
		 * Update node data. If dict contains 'children', then also replace
		 * the hole sub tree.
		 * @param {NodeData} dict
		 *
		 * @see FancytreeNode#addChildren
		 * @see FancytreeNode#applyPatch
		 */
		fromDict: function(dict) {
			// copy all other attributes to this.data.xxx
			for (var name in dict) {
				if (NODE_ATTR_MAP[name]) {
					// node.NAME = dict.NAME
					this[name] = dict[name];
				} else if (name === "data") {
					// node.data += dict.data
					$.extend(this.data, dict.data);
				} else if (
					!$.isFunction(dict[name]) &&
					!NONE_NODE_DATA_MAP[name]
				) {
					// node.data.NAME = dict.NAME
					this.data[name] = dict[name];
				}
			}
			if (dict.children) {
				// recursively set children and render
				this.removeChildren();
				this.addChildren(dict.children);
			}
			this.renderTitle();
			/*
			var children = dict.children;
			if(children === undefined){
				this.data = $.extend(this.data, dict);
				this.render();
				return;
			}
			dict = $.extend({}, dict);
			dict.children = undefined;
			this.data = $.extend(this.data, dict);
			this.removeChildren();
			this.addChild(children);
			*/
		},
		/** Return the list of child nodes (undefined for unexpanded lazy nodes).
		 * @returns {FancytreeNode[] | undefined}
		 */
		getChildren: function() {
			if (this.hasChildren() === undefined) {
				// TODO: only required for lazy nodes?
				return undefined; // Lazy node: unloaded, currently loading, or load error
			}
			return this.children;
		},
		/** Return the first child node or null.
		 * @returns {FancytreeNode | null}
		 */
		getFirstChild: function() {
			return this.children ? this.children[0] : null;
		},
		/** Return the 0-based child index.
		 * @returns {int}
		 */
		getIndex: function() {
			//		return this.parent.children.indexOf(this);
			return $.inArray(this, this.parent.children); // indexOf doesn't work in IE7
		},
		/** Return the hierarchical child index (1-based, e.g. '3.2.4').
		 * @param {string} [separator="."]
		 * @param {int} [digits=1]
		 * @returns {string}
		 */
		getIndexHier: function(separator, digits) {
			separator = separator || ".";
			var s,
				res = [];
			$.each(this.getParentList(false, true), function(i, o) {
				s = "" + (o.getIndex() + 1);
				if (digits) {
					// prepend leading zeroes
					s = ("0000000" + s).substr(-digits);
				}
				res.push(s);
			});
			return res.join(separator);
		},
		/** Return the parent keys separated by options.keyPathSeparator, e.g. "/id_1/id_17/id_32".
		 *
		 * (Unlike `node.getPath()`, this method prepends a "/" and inverts the first argument.)
		 *
		 * @see FancytreeNode#getPath
		 * @param {boolean} [excludeSelf=false]
		 * @returns {string}
		 */
		getKeyPath: function(excludeSelf) {
			var sep = this.tree.options.keyPathSeparator;

			return sep + this.getPath(!excludeSelf, "key", sep);
		},
		/** Return the last child of this node or null.
		 * @returns {FancytreeNode | null}
		 */
		getLastChild: function() {
			return this.children
				? this.children[this.children.length - 1]
				: null;
		},
		/** Return node depth. 0: System root node, 1: visible top-level node, 2: first sub-level, ... .
		 * @returns {int}
		 */
		getLevel: function() {
			var level = 0,
				dtn = this.parent;
			while (dtn) {
				level++;
				dtn = dtn.parent;
			}
			return level;
		},
		/** Return the successor node (under the same parent) or null.
		 * @returns {FancytreeNode | null}
		 */
		getNextSibling: function() {
			// TODO: use indexOf, if available: (not in IE6)
			if (this.parent) {
				var i,
					l,
					ac = this.parent.children;

				for (i = 0, l = ac.length - 1; i < l; i++) {
					// up to length-2, so next(last) = null
					if (ac[i] === this) {
						return ac[i + 1];
					}
				}
			}
			return null;
		},
		/** Return the parent node (null for the system root node).
		 * @returns {FancytreeNode | null}
		 */
		getParent: function() {
			// TODO: return null for top-level nodes?
			return this.parent;
		},
		/** Return an array of all parent nodes (top-down).
		 * @param {boolean} [includeRoot=false] Include the invisible system root node.
		 * @param {boolean} [includeSelf=false] Include the node itself.
		 * @returns {FancytreeNode[]}
		 */
		getParentList: function(includeRoot, includeSelf) {
			var l = [],
				dtn = includeSelf ? this : this.parent;
			while (dtn) {
				if (includeRoot || dtn.parent) {
					l.unshift(dtn);
				}
				dtn = dtn.parent;
			}
			return l;
		},
		/** Return a string representing the hierachical node path, e.g. "a/b/c".
		 * @param {boolean} [includeSelf=true]
		 * @param {string | function} [part="title"] node property name or callback
		 * @param {string} [separator="/"]
		 * @returns {string}
		 * @since v2.31
		 */
		getPath: function(includeSelf, part, separator) {
			includeSelf = includeSelf !== false;
			part = part || "title";
			separator = separator || "/";

			var val,
				path = [],
				isFunc = $.isFunction(part);

			this.visitParents(function(n) {
				if (n.parent) {
					val = isFunc ? part(n) : n[part];
					path.unshift(val);
				}
			}, includeSelf);
			return path.join(separator);
		},
		/** Return the predecessor node (under the same parent) or null.
		 * @returns {FancytreeNode | null}
		 */
		getPrevSibling: function() {
			if (this.parent) {
				var i,
					l,
					ac = this.parent.children;

				for (i = 1, l = ac.length; i < l; i++) {
					// start with 1, so prev(first) = null
					if (ac[i] === this) {
						return ac[i - 1];
					}
				}
			}
			return null;
		},
		/**
		 * Return an array of selected descendant nodes.
		 * @param {boolean} [stopOnParents=false] only return the topmost selected
		 *     node (useful with selectMode 3)
		 * @returns {FancytreeNode[]}
		 */
		getSelectedNodes: function(stopOnParents) {
			var nodeList = [];
			this.visit(function(node) {
				if (node.selected) {
					nodeList.push(node);
					if (stopOnParents === true) {
						return "skip"; // stop processing this branch
					}
				}
			});
			return nodeList;
		},
		/** Return true if node has children. Return undefined if not sure, i.e. the node is lazy and not yet loaded).
		 * @returns {boolean | undefined}
		 */
		hasChildren: function() {
			if (this.lazy) {
				if (this.children == null) {
					// null or undefined: Not yet loaded
					return undefined;
				} else if (this.children.length === 0) {
					// Loaded, but response was empty
					return false;
				} else if (
					this.children.length === 1 &&
					this.children[0].isStatusNode()
				) {
					// Currently loading or load error
					return undefined;
				}
				return true;
			}
			return !!(this.children && this.children.length);
		},
		/** Return true if node has keyboard focus.
		 * @returns {boolean}
		 */
		hasFocus: function() {
			return this.tree.hasFocus() && this.tree.focusNode === this;
		},
		/** Write to browser console if debugLevel >= 3 (prepending node info)
		 *
		 * @param {*} msg string or object or array of such
		 */
		info: function(msg) {
			if (this.tree.options.debugLevel >= 3) {
				Array.prototype.unshift.call(arguments, this.toString());
				consoleApply("info", arguments);
			}
		},
		/** Return true if node is active (see also FancytreeNode#isSelected).
		 * @returns {boolean}
		 */
		isActive: function() {
			return this.tree.activeNode === this;
		},
		/** Return true if node is vertically below `otherNode`, i.e. rendered in a subsequent row.
		 * @param {FancytreeNode} otherNode
		 * @returns {boolean}
		 * @since 2.28
		 */
		isBelowOf: function(otherNode) {
			return this.getIndexHier(".", 5) > otherNode.getIndexHier(".", 5);
		},
		/** Return true if node is a direct child of otherNode.
		 * @param {FancytreeNode} otherNode
		 * @returns {boolean}
		 */
		isChildOf: function(otherNode) {
			return this.parent && this.parent === otherNode;
		},
		/** Return true, if node is a direct or indirect sub node of otherNode.
		 * @param {FancytreeNode} otherNode
		 * @returns {boolean}
		 */
		isDescendantOf: function(otherNode) {
			if (!otherNode || otherNode.tree !== this.tree) {
				return false;
			}
			var p = this.parent;
			while (p) {
				if (p === otherNode) {
					return true;
				}
				if (p === p.parent) {
					$.error("Recursive parent link: " + p);
				}
				p = p.parent;
			}
			return false;
		},
		/** Return true if node is expanded.
		 * @returns {boolean}
		 */
		isExpanded: function() {
			return !!this.expanded;
		},
		/** Return true if node is the first node of its parent's children.
		 * @returns {boolean}
		 */
		isFirstSibling: function() {
			var p = this.parent;
			return !p || p.children[0] === this;
		},
		/** Return true if node is a folder, i.e. has the node.folder attribute set.
		 * @returns {boolean}
		 */
		isFolder: function() {
			return !!this.folder;
		},
		/** Return true if node is the last node of its parent's children.
		 * @returns {boolean}
		 */
		isLastSibling: function() {
			var p = this.parent;
			return !p || p.children[p.children.length - 1] === this;
		},
		/** Return true if node is lazy (even if data was already loaded)
		 * @returns {boolean}
		 */
		isLazy: function() {
			return !!this.lazy;
		},
		/** Return true if node is lazy and loaded. For non-lazy nodes always return true.
		 * @returns {boolean}
		 */
		isLoaded: function() {
			return !this.lazy || this.hasChildren() !== undefined; // Also checks if the only child is a status node
		},
		/** Return true if children are currently beeing loaded, i.e. a Ajax request is pending.
		 * @returns {boolean}
		 */
		isLoading: function() {
			return !!this._isLoading;
		},
		/*
		 * @deprecated since v2.4.0:  Use isRootNode() instead
		 */
		isRoot: function() {
			return this.isRootNode();
		},
		/** Return true if node is partially selected (tri-state).
		 * @returns {boolean}
		 * @since 2.23
		 */
		isPartsel: function() {
			return !this.selected && !!this.partsel;
		},
		/** (experimental) Return true if this is partially loaded.
		 * @returns {boolean}
		 * @since 2.15
		 */
		isPartload: function() {
			return !!this.partload;
		},
		/** Return true if this is the (invisible) system root node.
		 * @returns {boolean}
		 * @since 2.4
		 */
		isRootNode: function() {
			return this.tree.rootNode === this;
		},
		/** Return true if node is selected, i.e. has a checkmark set (see also FancytreeNode#isActive).
		 * @returns {boolean}
		 */
		isSelected: function() {
			return !!this.selected;
		},
		/** Return true if this node is a temporarily generated system node like
		 * 'loading', 'paging', or 'error' (node.statusNodeType contains the type).
		 * @returns {boolean}
		 */
		isStatusNode: function() {
			return !!this.statusNodeType;
		},
		/** Return true if this node is a status node of type 'paging'.
		 * @returns {boolean}
		 * @since 2.15
		 */
		isPagingNode: function() {
			return this.statusNodeType === "paging";
		},
		/** Return true if this a top level node, i.e. a direct child of the (invisible) system root node.
		 * @returns {boolean}
		 * @since 2.4
		 */
		isTopLevel: function() {
			return this.tree.rootNode === this.parent;
		},
		/** Return true if node is lazy and not yet loaded. For non-lazy nodes always return false.
		 * @returns {boolean}
		 */
		isUndefined: function() {
			return this.hasChildren() === undefined; // also checks if the only child is a status node
		},
		/** Return true if all parent nodes are expanded. Note: this does not check
		 * whether the node is scrolled into the visible part of the screen.
		 * @returns {boolean}
		 */
		isVisible: function() {
			var i,
				l,
				n,
				hasFilter = this.tree.enableFilter,
				parents = this.getParentList(false, false);

			// TODO: check $(n.span).is(":visible")
			// i.e. return false for nodes (but not parents) that are hidden
			// by a filter
			if (hasFilter && !this.match && !this.subMatchCount) {
				this.debug(
					"isVisible: HIDDEN (" +
						hasFilter +
						", " +
						this.match +
						", " +
						this.match +
						")"
				);
				return false;
			}

			for (i = 0, l = parents.length; i < l; i++) {
				n = parents[i];

				if (!n.expanded) {
					this.debug("isVisible: HIDDEN (parent collapsed)");
					return false;
				}
				// if (hasFilter && !n.match && !n.subMatchCount) {
				// 	this.debug("isVisible: HIDDEN (" + hasFilter + ", " + this.match + ", " + this.match + ")");
				// 	return false;
				// }
			}
			this.debug("isVisible: VISIBLE");
			return true;
		},
		/** Deprecated.
		 * @deprecated since 2014-02-16: use load() instead.
		 */
		lazyLoad: function(discard) {
			this.warn(
				"FancytreeNode.lazyLoad() is deprecated since 2014-02-16. Use .load() instead."
			);
			return this.load(discard);
		},
		/**
		 * Load all children of a lazy node if neccessary. The <i>expanded</i> state is maintained.
		 * @param {boolean} [forceReload=false] Pass true to discard any existing nodes before. Otherwise this method does nothing if the node was already loaded.
		 * @returns {$.Promise}
		 */
		load: function(forceReload) {
			var res,
				source,
				self = this,
				wasExpanded = this.isExpanded();

			_assert(this.isLazy(), "load() requires a lazy node");
			// _assert( forceReload || this.isUndefined(), "Pass forceReload=true to re-load a lazy node" );
			if (!forceReload && !this.isUndefined()) {
				return _getResolvedPromise(this);
			}
			if (this.isLoaded()) {
				this.resetLazy(); // also collapses
			}
			// This method is also called by setExpanded() and loadKeyPath(), so we
			// have to avoid recursion.
			source = this.tree._triggerNodeEvent("lazyLoad", this);
			if (source === false) {
				// #69
				return _getResolvedPromise(this);
			}
			_assert(
				typeof source !== "boolean",
				"lazyLoad event must return source in data.result"
			);
			res = this.tree._callHook("nodeLoadChildren", this, source);
			if (wasExpanded) {
				this.expanded = true;
				res.always(function() {
					self.render();
				});
			} else {
				res.always(function() {
					self.renderStatus(); // fix expander icon to 'loaded'
				});
			}
			return res;
		},
		/** Expand all parents and optionally scroll into visible area as neccessary.
		 * Promise is resolved, when lazy loading and animations are done.
		 * @param {object} [opts] passed to `setExpanded()`.
		 *     Defaults to {noAnimation: false, noEvents: false, scrollIntoView: true}
		 * @returns {$.Promise}
		 */
		makeVisible: function(opts) {
			var i,
				self = this,
				deferreds = [],
				dfd = new $.Deferred(),
				parents = this.getParentList(false, false),
				len = parents.length,
				effects = !(opts && opts.noAnimation === true),
				scroll = !(opts && opts.scrollIntoView === false);

			// Expand bottom-up, so only the top node is animated
			for (i = len - 1; i >= 0; i--) {
				// self.debug("pushexpand" + parents[i]);
				deferreds.push(parents[i].setExpanded(true, opts));
			}
			$.when.apply($, deferreds).done(function() {
				// All expands have finished
				// self.debug("expand DONE", scroll);
				if (scroll) {
					self.scrollIntoView(effects).done(function() {
						// self.debug("scroll DONE");
						dfd.resolve();
					});
				} else {
					dfd.resolve();
				}
			});
			return dfd.promise();
		},
		/** Move this node to targetNode.
		 *  @param {FancytreeNode} targetNode
		 *  @param {string} mode <pre>
		 *      'child': append this node as last child of targetNode.
		 *               This is the default. To be compatble with the D'n'd
		 *               hitMode, we also accept 'over'.
		 *      'firstChild': add this node as first child of targetNode.
		 *      'before': add this node as sibling before targetNode.
		 *      'after': add this node as sibling after targetNode.</pre>
		 *  @param {function} [map] optional callback(FancytreeNode) to allow modifcations
		 */
		moveTo: function(targetNode, mode, map) {
			if (mode === undefined || mode === "over") {
				mode = "child";
			} else if (mode === "firstChild") {
				if (targetNode.children && targetNode.children.length) {
					mode = "before";
					targetNode = targetNode.children[0];
				} else {
					mode = "child";
				}
			}
			var pos,
				tree = this.tree,
				prevParent = this.parent,
				targetParent =
					mode === "child" ? targetNode : targetNode.parent;

			if (this === targetNode) {
				return;
			} else if (!this.parent) {
				$.error("Cannot move system root");
			} else if (targetParent.isDescendantOf(this)) {
				$.error("Cannot move a node to its own descendant");
			}
			if (targetParent !== prevParent) {
				prevParent.triggerModifyChild("remove", this);
			}
			// Unlink this node from current parent
			if (this.parent.children.length === 1) {
				if (this.parent === targetParent) {
					return; // #258
				}
				this.parent.children = this.parent.lazy ? [] : null;
				this.parent.expanded = false;
			} else {
				pos = $.inArray(this, this.parent.children);
				_assert(pos >= 0, "invalid source parent");
				this.parent.children.splice(pos, 1);
			}
			// Remove from source DOM parent
			// if(this.parent.ul){
			// 	this.parent.ul.removeChild(this.li);
			// }

			// Insert this node to target parent's child list
			this.parent = targetParent;
			if (targetParent.hasChildren()) {
				switch (mode) {
					case "child":
						// Append to existing target children
						targetParent.children.push(this);
						break;
					case "before":
						// Insert this node before target node
						pos = $.inArray(targetNode, targetParent.children);
						_assert(pos >= 0, "invalid target parent");
						targetParent.children.splice(pos, 0, this);
						break;
					case "after":
						// Insert this node after target node
						pos = $.inArray(targetNode, targetParent.children);
						_assert(pos >= 0, "invalid target parent");
						targetParent.children.splice(pos + 1, 0, this);
						break;
					default:
						$.error("Invalid mode " + mode);
				}
			} else {
				targetParent.children = [this];
			}
			// Parent has no <ul> tag yet:
			// if( !targetParent.ul ) {
			// 	// This is the parent's first child: create UL tag
			// 	// (Hidden, because it will be
			// 	targetParent.ul = document.createElement("ul");
			// 	targetParent.ul.style.display = "none";
			// 	targetParent.li.appendChild(targetParent.ul);
			// }
			// // Issue 319: Add to target DOM parent (only if node was already rendered(expanded))
			// if(this.li){
			// 	targetParent.ul.appendChild(this.li);
			// }

			// Let caller modify the nodes
			if (map) {
				targetNode.visit(map, true);
			}
			if (targetParent === prevParent) {
				targetParent.triggerModifyChild("move", this);
			} else {
				// prevParent.triggerModifyChild("remove", this);
				targetParent.triggerModifyChild("add", this);
			}
			// Handle cross-tree moves
			if (tree !== targetNode.tree) {
				// Fix node.tree for all source nodes
				//			_assert(false, "Cross-tree move is not yet implemented.");
				this.warn("Cross-tree moveTo is experimental!");
				this.visit(function(n) {
					// TODO: fix selection state and activation, ...
					n.tree = targetNode.tree;
				}, true);
			}

			// A collaposed node won't re-render children, so we have to remove it manually
			// if( !targetParent.expanded ){
			//   prevParent.ul.removeChild(this.li);
			// }
			tree._callHook("treeStructureChanged", tree, "moveTo");

			// Update HTML markup
			if (!prevParent.isDescendantOf(targetParent)) {
				prevParent.render();
			}
			if (
				!targetParent.isDescendantOf(prevParent) &&
				targetParent !== prevParent
			) {
				targetParent.render();
			}
			// TODO: fix selection state
			// TODO: fix active state

			/*
			var tree = this.tree;
			var opts = tree.options;
			var pers = tree.persistence;

			// Always expand, if it's below minExpandLevel
			// tree.logDebug ("%s._addChildNode(%o), l=%o", this, ftnode, ftnode.getLevel());
			if ( opts.minExpandLevel >= ftnode.getLevel() ) {
				// tree.logDebug ("Force expand for %o", ftnode);
				this.bExpanded = true;
			}

			// In multi-hier mode, update the parents selection state
			// DT issue #82: only if not initializing, because the children may not exist yet
			// if( !ftnode.data.isStatusNode() && opts.selectMode==3 && !isInitializing )
			// 	ftnode._fixSelectionState();

			// In multi-hier mode, update the parents selection state
			if( ftnode.bSelected && opts.selectMode==3 ) {
				var p = this;
				while( p ) {
					if( !p.hasSubSel )
						p._setSubSel(true);
					p = p.parent;
				}
			}
			// render this node and the new child
			if ( tree.bEnableUpdate )
				this.render();
			return ftnode;
			*/
		},
		/** Set focus relative to this node and optionally activate.
		 *
		 * @param {number} where The keyCode that would normally trigger this move,
		 *		e.g. `$.ui.keyCode.LEFT` would collapse the node if it
		 *      is expanded or move to the parent oterwise.
		 * @param {boolean} [activate=true]
		 * @returns {$.Promise}
		 */
		navigate: function(where, activate) {
			var node,
				KC = $.ui.keyCode;

			// Handle optional expand/collapse action for LEFT/RIGHT
			switch (where) {
				case "left":
				case KC.LEFT:
					if (this.expanded) {
						return this.setExpanded(false);
					}
					break;
				case "right":
				case KC.RIGHT:
					if (!this.expanded && (this.children || this.lazy)) {
						return this.setExpanded();
					}
					break;
			}
			// Otherwise activate or focus the related node
			node = this.findRelatedNode(where);
			if (node) {
				// setFocus/setActive will scroll later (if autoScroll is specified)
				try {
					node.makeVisible({ scrollIntoView: false });
				} catch (e) {} // #272
				if (activate === false) {
					return node.setFocus();
				}
				return node.setActive();
			}
			this.warn("Could not find related node '" + where + "'.");
			return _getResolvedPromise();
		},
		/**
		 * Remove this node (not allowed for system root).
		 */
		remove: function() {
			return this.parent.removeChild(this);
		},
		/**
		 * Remove childNode from list of direct children.
		 * @param {FancytreeNode} childNode
		 */
		removeChild: function(childNode) {
			return this.tree._callHook("nodeRemoveChild", this, childNode);
		},
		/**
		 * Remove all child nodes and descendents. This converts the node into a leaf.<br>
		 * If this was a lazy node, it is still considered 'loaded'; call node.resetLazy()
		 * in order to trigger lazyLoad on next expand.
		 */
		removeChildren: function() {
			return this.tree._callHook("nodeRemoveChildren", this);
		},
		/**
		 * Remove class from node's span tag and .extraClasses.
		 *
		 * @param {string} className class name
		 *
		 * @since 2.17
		 */
		removeClass: function(className) {
			return this.toggleClass(className, false);
		},
		/**
		 * This method renders and updates all HTML markup that is required
		 * to display this node in its current state.<br>
		 * Note:
		 * <ul>
		 * <li>It should only be neccessary to call this method after the node object
		 *     was modified by direct access to its properties, because the common
		 *     API methods (node.setTitle(), moveTo(), addChildren(), remove(), ...)
		 *     already handle this.
		 * <li> {@link FancytreeNode#renderTitle} and {@link FancytreeNode#renderStatus}
		 *     are implied. If changes are more local, calling only renderTitle() or
		 *     renderStatus() may be sufficient and faster.
		 * </ul>
		 *
		 * @param {boolean} [force=false] re-render, even if html markup was already created
		 * @param {boolean} [deep=false] also render all descendants, even if parent is collapsed
		 */
		render: function(force, deep) {
			return this.tree._callHook("nodeRender", this, force, deep);
		},
		/** Create HTML markup for the node's outer &lt;span> (expander, checkbox, icon, and title).
		 * Implies {@link FancytreeNode#renderStatus}.
		 * @see Fancytree_Hooks#nodeRenderTitle
		 */
		renderTitle: function() {
			return this.tree._callHook("nodeRenderTitle", this);
		},
		/** Update element's CSS classes according to node state.
		 * @see Fancytree_Hooks#nodeRenderStatus
		 */
		renderStatus: function() {
			return this.tree._callHook("nodeRenderStatus", this);
		},
		/**
		 * (experimental) Replace this node with `source`.
		 * (Currently only available for paging nodes.)
		 * @param {NodeData[]} source List of child node definitions
		 * @since 2.15
		 */
		replaceWith: function(source) {
			var res,
				parent = this.parent,
				pos = $.inArray(this, parent.children),
				self = this;

			_assert(
				this.isPagingNode(),
				"replaceWith() currently requires a paging status node"
			);

			res = this.tree._callHook("nodeLoadChildren", this, source);
			res.done(function(data) {
				// New nodes are currently children of `this`.
				var children = self.children;
				// Prepend newly loaded child nodes to `this`
				// Move new children after self
				for (i = 0; i < children.length; i++) {
					children[i].parent = parent;
				}
				parent.children.splice.apply(
					parent.children,
					[pos + 1, 0].concat(children)
				);

				// Remove self
				self.children = null;
				self.remove();
				// Redraw new nodes
				parent.render();
				// TODO: set node.partload = false if this was tha last paging node?
				// parent.addPagingNode(false);
			}).fail(function() {
				self.setExpanded();
			});
			return res;
			// $.error("Not implemented: replaceWith()");
		},
		/**
		 * Remove all children, collapse, and set the lazy-flag, so that the lazyLoad
		 * event is triggered on next expand.
		 */
		resetLazy: function() {
			this.removeChildren();
			this.expanded = false;
			this.lazy = true;
			this.children = undefined;
			this.renderStatus();
		},
		/** Schedule activity for delayed execution (cancel any pending request).
		 *  scheduleAction('cancel') will only cancel a pending request (if any).
		 * @param {string} mode
		 * @param {number} ms
		 */
		scheduleAction: function(mode, ms) {
			if (this.tree.timer) {
				clearTimeout(this.tree.timer);
				this.tree.debug("clearTimeout(%o)", this.tree.timer);
			}
			this.tree.timer = null;
			var self = this; // required for closures
			switch (mode) {
				case "cancel":
					// Simply made sure that timer was cleared
					break;
				case "expand":
					this.tree.timer = setTimeout(function() {
						self.tree.debug("setTimeout: trigger expand");
						self.setExpanded(true);
					}, ms);
					break;
				case "activate":
					this.tree.timer = setTimeout(function() {
						self.tree.debug("setTimeout: trigger activate");
						self.setActive(true);
					}, ms);
					break;
				default:
					$.error("Invalid mode " + mode);
			}
			// this.tree.debug("setTimeout(%s, %s): %s", mode, ms, this.tree.timer);
		},
		/**
		 *
		 * @param {boolean | PlainObject} [effects=false] animation options.
		 * @param {object} [options=null] {topNode: null, effects: ..., parent: ...} this node will remain visible in
		 *     any case, even if `this` is outside the scroll pane.
		 * @returns {$.Promise}
		 */
		scrollIntoView: function(effects, options) {
			if (options !== undefined && _isNode(options)) {
				throw Error(
					"scrollIntoView() with 'topNode' option is deprecated since 2014-05-08. Use 'options.topNode' instead."
				);
			}
			// The scroll parent is typically the plain tree's <UL> container.
			// For ext-table, we choose the nearest parent that has `position: relative`
			// and `overflow` set.
			// (This default can be overridden by the local or global `scrollParent` option.)
			var opts = $.extend(
					{
						effects:
							effects === true
								? { duration: 200, queue: false }
								: effects,
						scrollOfs: this.tree.options.scrollOfs,
						scrollParent: this.tree.options.scrollParent,
						topNode: null,
					},
					options
				),
				$scrollParent = opts.scrollParent,
				$container = this.tree.$container,
				overflowY = $container.css("overflow-y");

			if (!$scrollParent) {
				if (this.tree.tbody) {
					$scrollParent = $container.scrollParent();
				} else if (overflowY === "scroll" || overflowY === "auto") {
					$scrollParent = $container;
				} else {
					// #922 plain tree in a non-fixed-sized UL scrolls inside its parent
					$scrollParent = $container.scrollParent();
				}
			} else if (!$scrollParent.jquery) {
				// Make sure we have a jQuery object
				$scrollParent = $($scrollParent);
			}
			if (
				$scrollParent[0] === document ||
				$scrollParent[0] === document.body
			) {
				// `document` may be returned by $().scrollParent(), if nothing is found,
				// but would not work: (see #894)
				this.debug(
					"scrollIntoView(): normalizing scrollParent to 'window':",
					$scrollParent[0]
				);
				$scrollParent = $(window);
			}
			// eslint-disable-next-line one-var
			var topNodeY,
				nodeY,
				horzScrollbarHeight,
				containerOffsetTop,
				dfd = new $.Deferred(),
				self = this,
				nodeHeight = $(this.span).height(),
				topOfs = opts.scrollOfs.top || 0,
				bottomOfs = opts.scrollOfs.bottom || 0,
				containerHeight = $scrollParent.height(),
				scrollTop = $scrollParent.scrollTop(),
				$animateTarget = $scrollParent,
				isParentWindow = $scrollParent[0] === window,
				topNode = opts.topNode || null,
				newScrollTop = null;

			// this.debug("scrollIntoView(), scrollTop=" + scrollTop, opts.scrollOfs);
			//		_assert($(this.span).is(":visible"), "scrollIntoView node is invisible"); // otherwise we cannot calc offsets
			if (!this.isVisible()) {
				// We cannot calc offsets for hidden elements
				this.warn("scrollIntoView(): node is invisible.");
				return _getResolvedPromise();
			}
			if (isParentWindow) {
				nodeY = $(this.span).offset().top;
				topNodeY =
					topNode && topNode.span ? $(topNode.span).offset().top : 0;
				$animateTarget = $("html,body");
			} else {
				_assert(
					$scrollParent[0] !== document &&
						$scrollParent[0] !== document.body,
					"scrollParent should be a simple element or `window`, not document or body."
				);

				containerOffsetTop = $scrollParent.offset().top;
				nodeY =
					$(this.span).offset().top - containerOffsetTop + scrollTop; // relative to scroll parent
				topNodeY = topNode
					? $(topNode.span).offset().top -
					  containerOffsetTop +
					  scrollTop
					: 0;
				horzScrollbarHeight = Math.max(
					0,
					$scrollParent.innerHeight() - $scrollParent[0].clientHeight
				);
				containerHeight -= horzScrollbarHeight;
			}

			// this.debug("    scrollIntoView(), nodeY=" + nodeY + ", containerHeight=" + containerHeight);
			if (nodeY < scrollTop + topOfs) {
				// Node is above visible container area
				newScrollTop = nodeY - topOfs;
				// this.debug("    scrollIntoView(), UPPER newScrollTop=" + newScrollTop);
			} else if (
				nodeY + nodeHeight >
				scrollTop + containerHeight - bottomOfs
			) {
				newScrollTop = nodeY + nodeHeight - containerHeight + bottomOfs;
				// this.debug("    scrollIntoView(), LOWER newScrollTop=" + newScrollTop);
				// If a topNode was passed, make sure that it is never scrolled
				// outside the upper border
				if (topNode) {
					_assert(
						topNode.isRootNode() || topNode.isVisible(),
						"topNode must be visible"
					);
					if (topNodeY < newScrollTop) {
						newScrollTop = topNodeY - topOfs;
						// this.debug("    scrollIntoView(), TOP newScrollTop=" + newScrollTop);
					}
				}
			}

			if (newScrollTop === null) {
				dfd.resolveWith(this);
			} else {
				// this.debug("    scrollIntoView(), SET newScrollTop=" + newScrollTop);
				if (opts.effects) {
					opts.effects.complete = function() {
						dfd.resolveWith(self);
					};
					$animateTarget.stop(true).animate(
						{
							scrollTop: newScrollTop,
						},
						opts.effects
					);
				} else {
					$animateTarget[0].scrollTop = newScrollTop;
					dfd.resolveWith(this);
				}
			}
			return dfd.promise();
		},

		/**Activate this node.
		 *
		 * The `cell` option requires the ext-table and ext-ariagrid extensions.
		 *
		 * @param {boolean} [flag=true] pass false to deactivate
		 * @param {object} [opts] additional options. Defaults to {noEvents: false, noFocus: false, cell: null}
		 * @returns {$.Promise}
		 */
		setActive: function(flag, opts) {
			return this.tree._callHook("nodeSetActive", this, flag, opts);
		},
		/**Expand or collapse this node. Promise is resolved, when lazy loading and animations are done.
		 * @param {boolean} [flag=true] pass false to collapse
		 * @param {object} [opts] additional options. Defaults to {noAnimation: false, noEvents: false}
		 * @returns {$.Promise}
		 */
		setExpanded: function(flag, opts) {
			return this.tree._callHook("nodeSetExpanded", this, flag, opts);
		},
		/**Set keyboard focus to this node.
		 * @param {boolean} [flag=true] pass false to blur
		 * @see Fancytree#setFocus
		 */
		setFocus: function(flag) {
			return this.tree._callHook("nodeSetFocus", this, flag);
		},
		/**Select this node, i.e. check the checkbox.
		 * @param {boolean} [flag=true] pass false to deselect
		 * @param {object} [opts] additional options. Defaults to {noEvents: false, p
		 *     propagateDown: null, propagateUp: null, callback: null }
		 */
		setSelected: function(flag, opts) {
			return this.tree._callHook("nodeSetSelected", this, flag, opts);
		},
		/**Mark a lazy node as 'error', 'loading', 'nodata', or 'ok'.
		 * @param {string} status 'error'|'empty'|'ok'
		 * @param {string} [message]
		 * @param {string} [details]
		 */
		setStatus: function(status, message, details) {
			return this.tree._callHook(
				"nodeSetStatus",
				this,
				status,
				message,
				details
			);
		},
		/**Rename this node.
		 * @param {string} title
		 */
		setTitle: function(title) {
			this.title = title;
			this.renderTitle();
			this.triggerModify("rename");
		},
		/**Sort child list by title.
		 * @param {function} [cmp] custom compare function(a, b) that returns -1, 0, or 1 (defaults to sort by title).
		 * @param {boolean} [deep=false] pass true to sort all descendant nodes
		 */
		sortChildren: function(cmp, deep) {
			var i,
				l,
				cl = this.children;

			if (!cl) {
				return;
			}
			cmp =
				cmp ||
				function(a, b) {
					var x = a.title.toLowerCase(),
						y = b.title.toLowerCase();

					// eslint-disable-next-line no-nested-ternary
					return x === y ? 0 : x > y ? 1 : -1;
				};
			cl.sort(cmp);
			if (deep) {
				for (i = 0, l = cl.length; i < l; i++) {
					if (cl[i].children) {
						cl[i].sortChildren(cmp, "$norender$");
					}
				}
			}
			if (deep !== "$norender$") {
				this.render();
			}
			this.triggerModifyChild("sort");
		},
		/** Convert node (or whole branch) into a plain object.
		 *
		 * The result is compatible with node.addChildren().
		 *
		 * @param {boolean} [recursive=false] include child nodes
		 * @param {function} [callback] callback(dict, node) is called for every node, in order to allow modifications
		 * @returns {NodeData}
		 */
		toDict: function(recursive, callback) {
			var i,
				l,
				node,
				dict = {},
				self = this;

			$.each(NODE_ATTRS, function(i, a) {
				if (self[a] || self[a] === false) {
					dict[a] = self[a];
				}
			});
			if (!$.isEmptyObject(this.data)) {
				dict.data = $.extend({}, this.data);
				if ($.isEmptyObject(dict.data)) {
					delete dict.data;
				}
			}
			if (callback) {
				callback(dict, self);
			}
			if (recursive) {
				if (this.hasChildren()) {
					dict.children = [];
					for (i = 0, l = this.children.length; i < l; i++) {
						node = this.children[i];
						if (!node.isStatusNode()) {
							dict.children.push(node.toDict(true, callback));
						}
					}
				} else {
					// dict.children = null;
				}
			}
			return dict;
		},
		/**
		 * Set, clear, or toggle class of node's span tag and .extraClasses.
		 *
		 * @param {string} className class name (separate multiple classes by space)
		 * @param {boolean} [flag] true/false to add/remove class. If omitted, class is toggled.
		 * @returns {boolean} true if a class was added
		 *
		 * @since 2.17
		 */
		toggleClass: function(value, flag) {
			var className,
				hasClass,
				rnotwhite = /\S+/g,
				classNames = value.match(rnotwhite) || [],
				i = 0,
				wasAdded = false,
				statusElem = this[this.tree.statusClassPropName],
				curClasses = " " + (this.extraClasses || "") + " ";

			// this.info("toggleClass('" + value + "', " + flag + ")", curClasses);
			// Modify DOM element directly if it already exists
			if (statusElem) {
				$(statusElem).toggleClass(value, flag);
			}
			// Modify node.extraClasses to make this change persistent
			// Toggle if flag was not passed
			while ((className = classNames[i++])) {
				hasClass = curClasses.indexOf(" " + className + " ") >= 0;
				flag = flag === undefined ? !hasClass : !!flag;
				if (flag) {
					if (!hasClass) {
						curClasses += className + " ";
						wasAdded = true;
					}
				} else {
					while (curClasses.indexOf(" " + className + " ") > -1) {
						curClasses = curClasses.replace(
							" " + className + " ",
							" "
						);
					}
				}
			}
			this.extraClasses = $.trim(curClasses);
			// this.info("-> toggleClass('" + value + "', " + flag + "): '" + this.extraClasses + "'");
			return wasAdded;
		},
		/** Flip expanded status. */
		toggleExpanded: function() {
			return this.tree._callHook("nodeToggleExpanded", this);
		},
		/** Flip selection status. */
		toggleSelected: function() {
			return this.tree._callHook("nodeToggleSelected", this);
		},
		toString: function() {
			return "FancytreeNode@" + this.key + "[title='" + this.title + "']";
			// return "<FancytreeNode(#" + this.key + ", '" + this.title + "')>";
		},
		/**
		 * Trigger `modifyChild` event on a parent to signal that a child was modified.
		 * @param {string} operation Type of change: 'add', 'remove', 'rename', 'move', 'data', ...
		 * @param {FancytreeNode} [childNode]
		 * @param {object} [extra]
		 */
		triggerModifyChild: function(operation, childNode, extra) {
			var data,
				modifyChild = this.tree.options.modifyChild;

			if (modifyChild) {
				if (childNode && childNode.parent !== this) {
					$.error(
						"childNode " + childNode + " is not a child of " + this
					);
				}
				data = {
					node: this,
					tree: this.tree,
					operation: operation,
					childNode: childNode || null,
				};
				if (extra) {
					$.extend(data, extra);
				}
				modifyChild({ type: "modifyChild" }, data);
			}
		},
		/**
		 * Trigger `modifyChild` event on node.parent(!).
		 * @param {string} operation Type of change: 'add', 'remove', 'rename', 'move', 'data', ...
		 * @param {object} [extra]
		 */
		triggerModify: function(operation, extra) {
			this.parent.triggerModifyChild(operation, this, extra);
		},
		/** Call fn(node) for all child nodes in hierarchical order (depth-first).<br>
		 * Stop iteration, if fn() returns false. Skip current branch, if fn() returns "skip".<br>
		 * Return false if iteration was stopped.
		 *
		 * @param {function} fn the callback function.
		 *     Return false to stop iteration, return "skip" to skip this node and
		 *     its children only.
		 * @param {boolean} [includeSelf=false]
		 * @returns {boolean}
		 */
		visit: function(fn, includeSelf) {
			var i,
				l,
				res = true,
				children = this.children;

			if (includeSelf === true) {
				res = fn(this);
				if (res === false || res === "skip") {
					return res;
				}
			}
			if (children) {
				for (i = 0, l = children.length; i < l; i++) {
					res = children[i].visit(fn, true);
					if (res === false) {
						break;
					}
				}
			}
			return res;
		},
		/** Call fn(node) for all child nodes and recursively load lazy children.<br>
		 * <b>Note:</b> If you need this method, you probably should consider to review
		 * your architecture! Recursivley loading nodes is a perfect way for lazy
		 * programmers to flood the server with requests ;-)
		 *
		 * @param {function} [fn] optional callback function.
		 *     Return false to stop iteration, return "skip" to skip this node and
		 *     its children only.
		 * @param {boolean} [includeSelf=false]
		 * @returns {$.Promise}
		 * @since 2.4
		 */
		visitAndLoad: function(fn, includeSelf, _recursion) {
			var dfd,
				res,
				loaders,
				node = this;

			// node.debug("visitAndLoad");
			if (fn && includeSelf === true) {
				res = fn(node);
				if (res === false || res === "skip") {
					return _recursion ? res : _getResolvedPromise();
				}
			}
			if (!node.children && !node.lazy) {
				return _getResolvedPromise();
			}
			dfd = new $.Deferred();
			loaders = [];
			// node.debug("load()...");
			node.load().done(function() {
				// node.debug("load()... done.");
				for (var i = 0, l = node.children.length; i < l; i++) {
					res = node.children[i].visitAndLoad(fn, true, true);
					if (res === false) {
						dfd.reject();
						break;
					} else if (res !== "skip") {
						loaders.push(res); // Add promise to the list
					}
				}
				$.when.apply(this, loaders).then(function() {
					dfd.resolve();
				});
			});
			return dfd.promise();
		},
		/** Call fn(node) for all parent nodes, bottom-up, including invisible system root.<br>
		 * Stop iteration, if fn() returns false.<br>
		 * Return false if iteration was stopped.
		 *
		 * @param {function} fn the callback function.
		 *     Return false to stop iteration, return "skip" to skip this node and children only.
		 * @param {boolean} [includeSelf=false]
		 * @returns {boolean}
		 */
		visitParents: function(fn, includeSelf) {
			// Visit parent nodes (bottom up)
			if (includeSelf && fn(this) === false) {
				return false;
			}
			var p = this.parent;
			while (p) {
				if (fn(p) === false) {
					return false;
				}
				p = p.parent;
			}
			return true;
		},
		/** Call fn(node) for all sibling nodes.<br>
		 * Stop iteration, if fn() returns false.<br>
		 * Return false if iteration was stopped.
		 *
		 * @param {function} fn the callback function.
		 *     Return false to stop iteration.
		 * @param {boolean} [includeSelf=false]
		 * @returns {boolean}
		 */
		visitSiblings: function(fn, includeSelf) {
			var i,
				l,
				n,
				ac = this.parent.children;

			for (i = 0, l = ac.length; i < l; i++) {
				n = ac[i];
				if (includeSelf || n !== this) {
					if (fn(n) === false) {
						return false;
					}
				}
			}
			return true;
		},
		/** Write warning to browser console if debugLevel >= 2 (prepending node info)
		 *
		 * @param {*} msg string or object or array of such
		 */
		warn: function(msg) {
			if (this.tree.options.debugLevel >= 2) {
				Array.prototype.unshift.call(arguments, this.toString());
				consoleApply("warn", arguments);
			}
		},
	};

	/******************************************************************************
	 * Fancytree
	 */
	/**
	 * Construct a new tree object.
	 *
	 * @class Fancytree
	 * @classdesc The controller behind a fancytree.
	 * This class also contains 'hook methods': see {@link Fancytree_Hooks}.
	 *
	 * @param {Widget} widget
	 *
	 * @property {string} _id Automatically generated unique tree instance ID, e.g. "1".
	 * @property {string} _ns Automatically generated unique tree namespace, e.g. ".fancytree-1".
	 * @property {FancytreeNode} activeNode Currently active node or null.
	 * @property {string} ariaPropName Property name of FancytreeNode that contains the element which will receive the aria attributes.
	 *     Typically "li", but "tr" for table extension.
	 * @property {jQueryObject} $container Outer &lt;ul> element (or &lt;table> element for ext-table).
	 * @property {jQueryObject} $div A jQuery object containing the element used to instantiate the tree widget (`widget.element`)
	 * @property {object|array} columns Recommended place to store shared column meta data. @since 2.27
	 * @property {object} data Metadata, i.e. properties that may be passed to `source` in addition to a children array.
	 * @property {object} ext Hash of all active plugin instances.
	 * @property {FancytreeNode} focusNode Currently focused node or null.
	 * @property {FancytreeNode} lastSelectedNode Used to implement selectMode 1 (single select)
	 * @property {string} nodeContainerAttrName Property name of FancytreeNode that contains the outer element of single nodes.
	 *     Typically "li", but "tr" for table extension.
	 * @property {FancytreeOptions} options Current options, i.e. default options + options passed to constructor.
	 * @property {FancytreeNode} rootNode Invisible system root node.
	 * @property {string} statusClassPropName Property name of FancytreeNode that contains the element which will receive the status classes.
	 *     Typically "span", but "tr" for table extension.
	 * @property {object} types Map for shared type specific meta data, used with node.type attribute. @since 2.27
	 * @property {object} viewport See ext-vieport. @since v2.31
	 * @property {object} widget Base widget instance.
	 */
	function Fancytree(widget) {
		this.widget = widget;
		this.$div = widget.element;
		this.options = widget.options;
		if (this.options) {
			if (this.options.lazyload !== undefined) {
				$.error(
					"The 'lazyload' event is deprecated since 2014-02-25. Use 'lazyLoad' (with uppercase L) instead."
				);
			}
			if (this.options.loaderror !== undefined) {
				$.error(
					"The 'loaderror' event was renamed since 2014-07-03. Use 'loadError' (with uppercase E) instead."
				);
			}
			if (this.options.fx !== undefined) {
				$.error(
					"The 'fx' option was replaced by 'toggleEffect' since 2014-11-30."
				);
			}
			if (this.options.removeNode !== undefined) {
				$.error(
					"The 'removeNode' event was replaced by 'modifyChild' since 2.20 (2016-09-10)."
				);
			}
		}
		this.ext = {}; // Active extension instances
		this.types = {};
		this.columns = {};
		// allow to init tree.data.foo from <div data-foo=''>
		this.data = _getElementDataAsDict(this.$div);
		// TODO: use widget.uuid instead?
		this._id = "" + (this.options.treeId || $.ui.fancytree._nextId++);
		// TODO: use widget.eventNamespace instead?
		this._ns = ".fancytree-" + this._id; // append for namespaced events
		this.activeNode = null;
		this.focusNode = null;
		this._hasFocus = null;
		this._tempCache = {};
		this._lastMousedownNode = null;
		this._enableUpdate = true;
		this.lastSelectedNode = null;
		this.systemFocusElement = null;
		this.lastQuicksearchTerm = "";
		this.lastQuicksearchTime = 0;
		this.viewport = null; // ext-grid

		this.statusClassPropName = "span";
		this.ariaPropName = "li";
		this.nodeContainerAttrName = "li";

		// Remove previous markup if any
		this.$div.find(">ul.fancytree-container").remove();

		// Create a node without parent.
		var fakeParent = { tree: this },
			$ul;
		this.rootNode = new FancytreeNode(fakeParent, {
			title: "root",
			key: "root_" + this._id,
			children: null,
			expanded: true,
		});
		this.rootNode.parent = null;

		// Create root markup
		$ul = $("<ul>", {
			id: "ft-id-" + this._id,
			class: "ui-fancytree fancytree-container fancytree-plain",
		}).appendTo(this.$div);
		this.$container = $ul;
		this.rootNode.ul = $ul[0];

		if (this.options.debugLevel == null) {
			this.options.debugLevel = FT.debugLevel;
		}
		// // Add container to the TAB chain
		// // See http://www.w3.org/TR/wai-aria-practices/#focus_activedescendant
		// // #577: Allow to set tabindex to "0", "-1" and ""
		// this.$container.attr("tabindex", this.options.tabindex);

		// if( this.options.rtl ) {
		// 	this.$container.attr("DIR", "RTL").addClass("fancytree-rtl");
		// // }else{
		// //	this.$container.attr("DIR", null).removeClass("fancytree-rtl");
		// }
		// if(this.options.aria){
		// 	this.$container.attr("role", "tree");
		// 	if( this.options.selectMode !== 1 ) {
		// 		this.$container.attr("aria-multiselectable", true);
		// 	}
		// }
	}

	Fancytree.prototype = /** @lends Fancytree# */ {
		/* Return a context object that can be re-used for _callHook().
		 * @param {Fancytree | FancytreeNode | EventData} obj
		 * @param {Event} originalEvent
		 * @param {Object} extra
		 * @returns {EventData}
		 */
		_makeHookContext: function(obj, originalEvent, extra) {
			var ctx, tree;
			if (obj.node !== undefined) {
				// obj is already a context object
				if (originalEvent && obj.originalEvent !== originalEvent) {
					$.error("invalid args");
				}
				ctx = obj;
			} else if (obj.tree) {
				// obj is a FancytreeNode
				tree = obj.tree;
				ctx = {
					node: obj,
					tree: tree,
					widget: tree.widget,
					options: tree.widget.options,
					originalEvent: originalEvent,
					typeInfo: tree.types[obj.type] || {},
				};
			} else if (obj.widget) {
				// obj is a Fancytree
				ctx = {
					node: null,
					tree: obj,
					widget: obj.widget,
					options: obj.widget.options,
					originalEvent: originalEvent,
				};
			} else {
				$.error("invalid args");
			}
			if (extra) {
				$.extend(ctx, extra);
			}
			return ctx;
		},
		/* Trigger a hook function: funcName(ctx, [...]).
		 *
		 * @param {string} funcName
		 * @param {Fancytree|FancytreeNode|EventData} contextObject
		 * @param {any}  [_extraArgs] optional additional arguments
		 * @returns {any}
		 */
		_callHook: function(funcName, contextObject, _extraArgs) {
			var ctx = this._makeHookContext(contextObject),
				fn = this[funcName],
				args = Array.prototype.slice.call(arguments, 2);
			if (!$.isFunction(fn)) {
				$.error("_callHook('" + funcName + "') is not a function");
			}
			args.unshift(ctx);
			// this.debug("_hook", funcName, ctx.node && ctx.node.toString() || ctx.tree.toString(), args);
			return fn.apply(this, args);
		},
		_setExpiringValue: function(key, value, ms) {
			this._tempCache[key] = {
				value: value,
				expire: Date.now() + (+ms || 50),
			};
		},
		_getExpiringValue: function(key) {
			var entry = this._tempCache[key];
			if (entry && entry.expire > Date.now()) {
				return entry.value;
			}
			delete this._tempCache[key];
			return null;
		},
		/* Check if current extensions dependencies are met and throw an error if not.
		 *
		 * This method may be called inside the `treeInit` hook for custom extensions.
		 *
		 * @param {string} extension name of the required extension
		 * @param {boolean} [required=true] pass `false` if the extension is optional, but we want to check for order if it is present
		 * @param {boolean} [before] `true` if `name` must be included before this, `false` otherwise (use `null` if order doesn't matter)
		 * @param {string} [message] optional error message (defaults to a descriptve error message)
		 */
		_requireExtension: function(name, required, before, message) {
			if (before != null) {
				before = !!before;
			}
			var thisName = this._local.name,
				extList = this.options.extensions,
				isBefore =
					$.inArray(name, extList) < $.inArray(thisName, extList),
				isMissing = required && this.ext[name] == null,
				badOrder = !isMissing && before != null && before !== isBefore;

			_assert(
				thisName && thisName !== name,
				"invalid or same name '" + thisName + "' (require yourself?)"
			);

			if (isMissing || badOrder) {
				if (!message) {
					if (isMissing || required) {
						message =
							"'" +
							thisName +
							"' extension requires '" +
							name +
							"'";
						if (badOrder) {
							message +=
								" to be registered " +
								(before ? "before" : "after") +
								" itself";
						}
					} else {
						message =
							"If used together, `" +
							name +
							"` must be registered " +
							(before ? "before" : "after") +
							" `" +
							thisName +
							"`";
					}
				}
				$.error(message);
				return false;
			}
			return true;
		},
		/** Activate node with a given key and fire focus and activate events.
		 *
		 * A previously activated node will be deactivated.
		 * If activeVisible option is set, all parents will be expanded as necessary.
		 * Pass key = false, to deactivate the current node only.
		 * @param {string} key
		 * @param {object} [opts] additional options. Defaults to {noEvents: false, noFocus: false}
		 * @returns {FancytreeNode} activated node (null, if not found)
		 */
		activateKey: function(key, opts) {
			var node = this.getNodeByKey(key);
			if (node) {
				node.setActive(true, opts);
			} else if (this.activeNode) {
				this.activeNode.setActive(false, opts);
			}
			return node;
		},
		/** (experimental) Add child status nodes that indicate 'More...', ....
		 * @param {boolean|object} node optional node definition. Pass `false` to remove all paging nodes.
		 * @param {string} [mode='append'] 'child'|firstChild'
		 * @since 2.15
		 */
		addPagingNode: function(node, mode) {
			return this.rootNode.addPagingNode(node, mode);
		},
		/** (experimental) Modify existing data model.
		 *
		 * @param {Array} patchList array of [key, NodePatch] arrays
		 * @returns {$.Promise} resolved, when all patches have been applied
		 * @see TreePatch
		 */
		applyPatch: function(patchList) {
			var dfd,
				i,
				p2,
				key,
				patch,
				node,
				patchCount = patchList.length,
				deferredList = [];

			for (i = 0; i < patchCount; i++) {
				p2 = patchList[i];
				_assert(
					p2.length === 2,
					"patchList must be an array of length-2-arrays"
				);
				key = p2[0];
				patch = p2[1];
				node = key === null ? this.rootNode : this.getNodeByKey(key);
				if (node) {
					dfd = new $.Deferred();
					deferredList.push(dfd);
					node.applyPatch(patch).always(_makeResolveFunc(dfd, node));
				} else {
					this.warn("could not find node with key '" + key + "'");
				}
			}
			// Return a promise that is resolved, when ALL patches were applied
			return $.when.apply($, deferredList).promise();
		},
		/* TODO: implement in dnd extension
		cancelDrag: function() {
				var dd = $.ui.ddmanager.current;
				if(dd){
					dd.cancel();
				}
			},
		*/
		/** Remove all nodes.
		 * @since 2.14
		 */
		clear: function(source) {
			this._callHook("treeClear", this);
		},
		/** Return the number of nodes.
		 * @returns {integer}
		 */
		count: function() {
			return this.rootNode.countChildren();
		},
		/** Write to browser console if debugLevel >= 4 (prepending tree name)
		 *
		 * @param {*} msg string or object or array of such
		 */
		debug: function(msg) {
			if (this.options.debugLevel >= 4) {
				Array.prototype.unshift.call(arguments, this.toString());
				consoleApply("log", arguments);
			}
		},
		/** Enable (or disable) the tree control.
		 *
		 * @param {boolean} [flag=true] pass false to disable
		 * @since 2.30
		 */
		enable: function(flag) {
			if (flag === false) {
				this.widget.disable();
			} else {
				this.widget.enable();
			}
		},
		/** Temporarily suppress rendering to improve performance on bulk-updates.
		 *
		 * @param {boolean} flag
		 * @returns {boolean} previous status
		 * @since 2.19
		 */
		enableUpdate: function(flag) {
			flag = flag !== false;
			if (!!this._enableUpdate === !!flag) {
				return flag;
			}
			this._enableUpdate = flag;
			if (flag) {
				this.debug("enableUpdate(true): redraw "); //, this._dirtyRoots);
				this._callHook("treeStructureChanged", this, "enableUpdate");
				this.render();
			} else {
				// 	this._dirtyRoots = null;
				this.debug("enableUpdate(false)...");
			}
			return !flag; // return previous value
		},
		/** Write error to browser console if debugLevel >= 1 (prepending tree info)
		 *
		 * @param {*} msg string or object or array of such
		 */
		error: function(msg) {
			if (this.options.debugLevel >= 1) {
				Array.prototype.unshift.call(arguments, this.toString());
				consoleApply("error", arguments);
			}
		},
		/** Expand (or collapse) all parent nodes.
		 *
		 * This convenience method uses `tree.visit()` and `tree.setExpanded()`
		 * internally.
		 *
		 * @param {boolean} [flag=true] pass false to collapse
		 * @param {object} [opts] passed to setExpanded()
		 * @since 2.30
		 */
		expandAll: function(flag, opts) {
			var prev = this.enableUpdate(false);

			flag = flag !== false;
			this.visit(function(node) {
				if (
					node.hasChildren() !== false &&
					node.isExpanded() !== flag
				) {
					node.setExpanded(flag, opts);
				}
			});
			this.enableUpdate(prev);
		},
		/**Find all nodes that matches condition.
		 *
		 * @param {string | function(node)} match title string to search for, or a
		 *     callback function that returns `true` if a node is matched.
		 * @returns {FancytreeNode[]} array of nodes (may be empty)
		 * @see FancytreeNode#findAll
		 * @since 2.12
		 */
		findAll: function(match) {
			return this.rootNode.findAll(match);
		},
		/**Find first node that matches condition.
		 *
		 * @param {string | function(node)} match title string to search for, or a
		 *     callback function that returns `true` if a node is matched.
		 * @returns {FancytreeNode} matching node or null
		 * @see FancytreeNode#findFirst
		 * @since 2.12
		 */
		findFirst: function(match) {
			return this.rootNode.findFirst(match);
		},
		/** Find the next visible node that starts with `match`, starting at `startNode`
		 * and wrap-around at the end.
		 *
		 * @param {string|function} match
		 * @param {FancytreeNode} [startNode] defaults to first node
		 * @returns {FancytreeNode} matching node or null
		 */
		findNextNode: function(match, startNode) {
			//, visibleOnly) {
			var res = null,
				firstNode = this.getFirstChild();

			match =
				typeof match === "string"
					? _makeNodeTitleStartMatcher(match)
					: match;
			startNode = startNode || firstNode;

			function _checkNode(n) {
				// console.log("_check " + n)
				if (match(n)) {
					res = n;
				}
				if (res || n === startNode) {
					return false;
				}
			}
			this.visitRows(_checkNode, {
				start: startNode,
				includeSelf: false,
			});
			// Wrap around search
			if (!res && startNode !== firstNode) {
				this.visitRows(_checkNode, {
					start: firstNode,
					includeSelf: true,
				});
			}
			return res;
		},
		/** Find a node relative to another node.
		 *
		 * @param {FancytreeNode} node
		 * @param {number|string} where The keyCode that would normally trigger this move,
		 *		or a keyword ('down', 'first', 'last', 'left', 'parent', 'right', 'up').
		 * @param {boolean} [includeHidden=false] Not yet implemented
		 * @returns {FancytreeNode|null}
		 * @since v2.31
		 */
		findRelatedNode: function(node, where, includeHidden) {
			var res = null,
				KC = $.ui.keyCode;

			switch (where) {
				case "parent":
				case KC.BACKSPACE:
					if (node.parent && node.parent.parent) {
						res = node.parent;
					}
					break;
				case "first":
				case KC.HOME:
					// First visible node
					this.visit(function(n) {
						if (n.isVisible()) {
							res = n;
							return false;
						}
					});
					break;
				case "last":
				case KC.END:
					this.visit(function(n) {
						// last visible node
						if (n.isVisible()) {
							res = n;
						}
					});
					break;
				case "left":
				case KC.LEFT:
					if (node.expanded) {
						node.setExpanded(false);
					} else if (node.parent && node.parent.parent) {
						res = node.parent;
					}
					break;
				case "right":
				case KC.RIGHT:
					if (!node.expanded && (node.children || node.lazy)) {
						node.setExpanded();
						res = node;
					} else if (node.children && node.children.length) {
						res = node.children[0];
					}
					break;
				case "up":
				case KC.UP:
					this.visitRows(
						function(n) {
							res = n;
							return false;
						},
						{ start: node, reverse: true, includeSelf: false }
					);
					break;
				case "down":
				case KC.DOWN:
					this.visitRows(
						function(n) {
							res = n;
							return false;
						},
						{ start: node, includeSelf: false }
					);
					break;
				default:
					this.tree.warn("Unknown relation '" + where + "'.");
			}
			return res;
		},
		// TODO: fromDict
		/**
		 * Generate INPUT elements that can be submitted with html forms.
		 *
		 * In selectMode 3 only the topmost selected nodes are considered, unless
		 * `opts.stopOnParents: false` is passed.
		 *
		 * @example
		 * // Generate input elements for active and selected nodes
		 * tree.generateFormElements();
		 * // Generate input elements selected nodes, using a custom `name` attribute
		 * tree.generateFormElements("cust_sel", false);
		 * // Generate input elements using a custom filter
		 * tree.generateFormElements(true, true, { filter: function(node) {
		 *     return node.isSelected() && node.data.yes;
		 * }});
		 *
		 * @param {boolean | string} [selected=true] Pass false to disable, pass a string to override the field name (default: 'ft_ID[]')
		 * @param {boolean | string} [active=true] Pass false to disable, pass a string to override the field name (default: 'ft_ID_active')
		 * @param {object} [opts] default { filter: null, stopOnParents: true }
		 */
		generateFormElements: function(selected, active, opts) {
			opts = opts || {};

			var nodeList,
				selectedName =
					typeof selected === "string"
						? selected
						: "ft_" + this._id + "[]",
				activeName =
					typeof active === "string"
						? active
						: "ft_" + this._id + "_active",
				id = "fancytree_result_" + this._id,
				$result = $("#" + id),
				stopOnParents =
					this.options.selectMode === 3 &&
					opts.stopOnParents !== false;

			if ($result.length) {
				$result.empty();
			} else {
				$result = $("<div>", {
					id: id,
				})
					.hide()
					.insertAfter(this.$container);
			}
			if (active !== false && this.activeNode) {
				$result.append(
					$("<input>", {
						type: "radio",
						name: activeName,
						value: this.activeNode.key,
						checked: true,
					})
				);
			}
			function _appender(node) {
				$result.append(
					$("<input>", {
						type: "checkbox",
						name: selectedName,
						value: node.key,
						checked: true,
					})
				);
			}
			if (opts.filter) {
				this.visit(function(node) {
					var res = opts.filter(node);
					if (res === "skip") {
						return res;
					}
					if (res !== false) {
						_appender(node);
					}
				});
			} else if (selected !== false) {
				nodeList = this.getSelectedNodes(stopOnParents);
				$.each(nodeList, function(idx, node) {
					_appender(node);
				});
			}
		},
		/**
		 * Return the currently active node or null.
		 * @returns {FancytreeNode}
		 */
		getActiveNode: function() {
			return this.activeNode;
		},
		/** Return the first top level node if any (not the invisible root node).
		 * @returns {FancytreeNode | null}
		 */
		getFirstChild: function() {
			return this.rootNode.getFirstChild();
		},
		/**
		 * Return node that has keyboard focus or null.
		 * @returns {FancytreeNode}
		 */
		getFocusNode: function() {
			return this.focusNode;
		},
		/**
		 * Return current option value.
		 * (Note: this is the preferred variant of `$().fancytree("option", "KEY")`)
		 *
		 * @param {string} name option name (may contain '.')
		 * @returns {any}
		 */
		getOption: function(optionName) {
			return this.widget.option(optionName);
		},
		/**
		 * Return node with a given key or null if not found.
		 *
		 * @param {string} key
		 * @param {FancytreeNode} [searchRoot] only search below this node
		 * @returns {FancytreeNode | null}
		 */
		getNodeByKey: function(key, searchRoot) {
			// Search the DOM by element ID (assuming this is faster than traversing all nodes).
			var el, match;
			// TODO: use tree.keyMap if available
			// TODO: check opts.generateIds === true
			if (!searchRoot) {
				el = document.getElementById(this.options.idPrefix + key);
				if (el) {
					return el.ftnode ? el.ftnode : null;
				}
			}
			// Not found in the DOM, but still may be in an unrendered part of tree
			searchRoot = searchRoot || this.rootNode;
			match = null;
			searchRoot.visit(function(node) {
				if (node.key === key) {
					match = node;
					return false; // Stop iteration
				}
			}, true);
			return match;
		},
		/** Return the invisible system root node.
		 * @returns {FancytreeNode}
		 */
		getRootNode: function() {
			return this.rootNode;
		},
		/**
		 * Return an array of selected nodes.
		 * @param {boolean} [stopOnParents=false] only return the topmost selected
		 *     node (useful with selectMode 3)
		 * @returns {FancytreeNode[]}
		 */
		getSelectedNodes: function(stopOnParents) {
			return this.rootNode.getSelectedNodes(stopOnParents);
		},
		/** Return true if the tree control has keyboard focus
		 * @returns {boolean}
		 */
		hasFocus: function() {
			return !!this._hasFocus;
		},
		/** Write to browser console if debugLevel >= 3 (prepending tree name)
		 * @param {*} msg string or object or array of such
		 */
		info: function(msg) {
			if (this.options.debugLevel >= 3) {
				Array.prototype.unshift.call(arguments, this.toString());
				consoleApply("info", arguments);
			}
		},
		/*
		TODO: isInitializing: function() {
			return ( this.phase=="init" || this.phase=="postInit" );
		},
		TODO: isReloading: function() {
			return ( this.phase=="init" || this.phase=="postInit" ) && this.options.persist && this.persistence.cookiesFound;
		},
		TODO: isUserEvent: function() {
			return ( this.phase=="userEvent" );
		},
		*/

		/**
		 * Make sure that a node with a given ID is loaded, by traversing - and
		 * loading - its parents. This method is meant for lazy hierarchies.
		 * A callback is executed for every node as we go.
		 * @example
		 * // Resolve using node.key:
		 * tree.loadKeyPath("/_3/_23/_26/_27", function(node, status){
		 *   if(status === "loaded") {
		 *     console.log("loaded intermediate node " + node);
		 *   }else if(status === "ok") {
		 *     node.activate();
		 *   }
		 * });
		 * // Use deferred promise:
		 * tree.loadKeyPath("/_3/_23/_26/_27").progress(function(data){
		 *   if(data.status === "loaded") {
		 *     console.log("loaded intermediate node " + data.node);
		 *   }else if(data.status === "ok") {
		 *     node.activate();
		 *   }
		 * }).done(function(){
		 *    ...
		 * });
		 * // Custom path segment resolver:
		 * tree.loadKeyPath("/321/431/21/2", {
		 *   matchKey: function(node, key){
		 *     return node.data.refKey === key;
		 *   },
		 *   callback: function(node, status){
		 *     if(status === "loaded") {
		 *       console.log("loaded intermediate node " + node);
		 *     }else if(status === "ok") {
		 *       node.activate();
		 *     }
		 *   }
		 * });
		 * @param {string | string[]} keyPathList one or more key paths (e.g. '/3/2_1/7')
		 * @param {function | object} optsOrCallback callback(node, status) is called for every visited node ('loading', 'loaded', 'ok', 'error').
		 *     Pass an object to define custom key matchers for the path segments: {callback: function, matchKey: function}.
		 * @returns {$.Promise}
		 */
		loadKeyPath: function(keyPathList, optsOrCallback) {
			var callback,
				i,
				path,
				self = this,
				dfd = new $.Deferred(),
				parent = this.getRootNode(),
				sep = this.options.keyPathSeparator,
				pathSegList = [],
				opts = $.extend({}, optsOrCallback);

			// Prepare options
			if (typeof optsOrCallback === "function") {
				callback = optsOrCallback;
			} else if (optsOrCallback && optsOrCallback.callback) {
				callback = optsOrCallback.callback;
			}
			opts.callback = function(ctx, node, status) {
				if (callback) {
					callback.call(ctx, node, status);
				}
				dfd.notifyWith(ctx, [{ node: node, status: status }]);
			};
			if (opts.matchKey == null) {
				opts.matchKey = function(node, key) {
					return node.key === key;
				};
			}
			// Convert array of path strings to array of segment arrays
			if (!$.isArray(keyPathList)) {
				keyPathList = [keyPathList];
			}
			for (i = 0; i < keyPathList.length; i++) {
				path = keyPathList[i];
				// strip leading slash
				if (path.charAt(0) === sep) {
					path = path.substr(1);
				}
				// segListMap[path] = { parent: parent, segList: path.split(sep) };
				pathSegList.push(path.split(sep));
				// targetList.push({ parent: parent, segList: path.split(sep)/* , path: path*/});
			}
			// The timeout forces async behavior always (even if nodes are all loaded)
			// This way a potential progress() event will fire.
			setTimeout(function() {
				self._loadKeyPathImpl(dfd, opts, parent, pathSegList).done(
					function() {
						dfd.resolve();
					}
				);
			}, 0);
			return dfd.promise();
		},
		/*
		 * Resolve a list of paths, relative to one parent node.
		 */
		_loadKeyPathImpl: function(dfd, opts, parent, pathSegList) {
			var deferredList,
				i,
				key,
				node,
				nodeKey,
				remain,
				remainMap,
				tmpParent,
				segList,
				subDfd,
				self = this;

			function __findChild(parent, key) {
				// console.log("__findChild", key, parent);
				var i,
					l,
					cl = parent.children;

				if (cl) {
					for (i = 0, l = cl.length; i < l; i++) {
						if (opts.matchKey(cl[i], key)) {
							return cl[i];
						}
					}
				}
				return null;
			}

			// console.log("_loadKeyPathImpl, parent=", parent, ", pathSegList=", pathSegList);

			// Pass 1:
			// Handle all path segments for nodes that are already loaded.
			// Collect distinct top-most lazy nodes in a map.
			// Note that we can use node.key to de-dupe entries, even if a custom matcher would
			// look for other node attributes.
			// map[node.key] => {node: node, pathList: [list of remaining rest-paths]}
			remainMap = {};

			for (i = 0; i < pathSegList.length; i++) {
				segList = pathSegList[i];
				// target = targetList[i];

				// Traverse and pop path segments (i.e. keys), until we hit a lazy, unloaded node
				tmpParent = parent;
				while (segList.length) {
					key = segList.shift();
					node = __findChild(tmpParent, key);
					if (!node) {
						this.warn(
							"loadKeyPath: key not found: " +
								key +
								" (parent: " +
								tmpParent +
								")"
						);
						opts.callback(this, key, "error");
						break;
					} else if (segList.length === 0) {
						opts.callback(this, node, "ok");
						break;
					} else if (!node.lazy || node.hasChildren() !== undefined) {
						opts.callback(this, node, "loaded");
						tmpParent = node;
					} else {
						opts.callback(this, node, "loaded");
						key = node.key; //target.segList.join(sep);
						if (remainMap[key]) {
							remainMap[key].pathSegList.push(segList);
						} else {
							remainMap[key] = {
								parent: node,
								pathSegList: [segList],
							};
						}
						break;
					}
				}
			}
			// console.log("_loadKeyPathImpl AFTER pass 1, remainMap=", remainMap);

			// Now load all lazy nodes and continue iteration for remaining paths
			deferredList = [];

			// Avoid jshint warning 'Don't make functions within a loop.':
			function __lazyload(dfd, parent, pathSegList) {
				// console.log("__lazyload", parent, "pathSegList=", pathSegList);
				opts.callback(self, parent, "loading");
				parent
					.load()
					.done(function() {
						self._loadKeyPathImpl
							.call(self, dfd, opts, parent, pathSegList)
							.always(_makeResolveFunc(dfd, self));
					})
					.fail(function(errMsg) {
						self.warn("loadKeyPath: error loading lazy " + parent);
						opts.callback(self, node, "error");
						dfd.rejectWith(self);
					});
			}
			// remainMap contains parent nodes, each with a list of relative sub-paths.
			// We start loading all of them now, and pass the the list to each loader.
			for (nodeKey in remainMap) {
				if (remainMap.hasOwnProperty(nodeKey)) {
					remain = remainMap[nodeKey];
					// console.log("for(): remain=", remain, "remainMap=", remainMap);
					// key = remain.segList.shift();
					// node = __findChild(remain.parent, key);
					// if (node == null) {  // #576
					// 	// Issue #576, refactored for v2.27:
					// 	// The root cause was, that sometimes the wrong parent was used here
					// 	// to find the next segment.
					// 	// Falling back to getNodeByKey() was a hack that no longer works if a custom
					// 	// matcher is used, because we cannot assume that a single segment-key is unique
					// 	// throughout the tree.
					// 	self.error("loadKeyPath: error loading child by key '" + key + "' (parent: " + target.parent + ")", target);
					// 	// 	node = self.getNodeByKey(key);
					// 	continue;
					// }
					subDfd = new $.Deferred();
					deferredList.push(subDfd);
					__lazyload(subDfd, remain.parent, remain.pathSegList);
				}
			}
			// Return a promise that is resolved, when ALL paths were loaded
			return $.when.apply($, deferredList).promise();
		},
		/** Re-fire beforeActivate, activate, and (optional) focus events.
		 * Calling this method in the `init` event, will activate the node that
		 * was marked 'active' in the source data, and optionally set the keyboard
		 * focus.
		 * @param [setFocus=false]
		 */
		reactivate: function(setFocus) {
			var res,
				node = this.activeNode;

			if (!node) {
				return _getResolvedPromise();
			}
			this.activeNode = null; // Force re-activating
			res = node.setActive(true, { noFocus: true });
			if (setFocus) {
				node.setFocus();
			}
			return res;
		},
		/** Reload tree from source and return a promise.
		 * @param [source] optional new source (defaults to initial source data)
		 * @returns {$.Promise}
		 */
		reload: function(source) {
			this._callHook("treeClear", this);
			return this._callHook("treeLoad", this, source);
		},
		/**Render tree (i.e. create DOM elements for all top-level nodes).
		 * @param {boolean} [force=false] create DOM elemnts, even if parent is collapsed
		 * @param {boolean} [deep=false]
		 */
		render: function(force, deep) {
			return this.rootNode.render(force, deep);
		},
		/**(De)select all nodes.
		 * @param {boolean} [flag=true]
		 * @since 2.28
		 */
		selectAll: function(flag) {
			this.visit(function(node) {
				node.setSelected(flag);
			});
		},
		// TODO: selectKey: function(key, select)
		// TODO: serializeArray: function(stopOnParents)
		/**
		 * @param {boolean} [flag=true]
		 */
		setFocus: function(flag) {
			return this._callHook("treeSetFocus", this, flag);
		},
		/**
		 * Set current option value.
		 * (Note: this is the preferred variant of `$().fancytree("option", "KEY", VALUE)`)
		 * @param {string} name option name (may contain '.')
		 * @param {any} new value
		 */
		setOption: function(optionName, value) {
			return this.widget.option(optionName, value);
		},
		/**
		 * Return all nodes as nested list of {@link NodeData}.
		 *
		 * @param {boolean} [includeRoot=false] Returns the hidden system root node (and its children)
		 * @param {function} [callback] callback(dict, node) is called for every node, in order to allow modifications
		 * @returns {Array | object}
		 * @see FancytreeNode#toDict
		 */
		toDict: function(includeRoot, callback) {
			var res = this.rootNode.toDict(true, callback);
			return includeRoot ? res : res.children;
		},
		/* Implicitly called for string conversions.
		 * @returns {string}
		 */
		toString: function() {
			return "Fancytree@" + this._id;
			// return "<Fancytree(#" + this._id + ")>";
		},
		/* _trigger a widget event with additional node ctx.
		 * @see EventData
		 */
		_triggerNodeEvent: function(type, node, originalEvent, extra) {
			//		this.debug("_trigger(" + type + "): '" + ctx.node.title + "'", ctx);
			var ctx = this._makeHookContext(node, originalEvent, extra),
				res = this.widget._trigger(type, originalEvent, ctx);
			if (res !== false && ctx.result !== undefined) {
				return ctx.result;
			}
			return res;
		},
		/* _trigger a widget event with additional tree data. */
		_triggerTreeEvent: function(type, originalEvent, extra) {
			//		this.debug("_trigger(" + type + ")", ctx);
			var ctx = this._makeHookContext(this, originalEvent, extra),
				res = this.widget._trigger(type, originalEvent, ctx);

			if (res !== false && ctx.result !== undefined) {
				return ctx.result;
			}
			return res;
		},
		/** Call fn(node) for all nodes in hierarchical order (depth-first).
		 *
		 * @param {function} fn the callback function.
		 *     Return false to stop iteration, return "skip" to skip this node and children only.
		 * @returns {boolean} false, if the iterator was stopped.
		 */
		visit: function(fn) {
			return this.rootNode.visit(fn, false);
		},
		/** Call fn(node) for all nodes in vertical order, top down (or bottom up).<br>
		 * Stop iteration, if fn() returns false.<br>
		 * Return false if iteration was stopped.
		 *
		 * @param {function} fn the callback function.
		 *     Return false to stop iteration, return "skip" to skip this node and children only.
		 * @param {object} [options]
		 *     Defaults:
		 *     {start: First top node, reverse: false, includeSelf: true, includeHidden: false}
		 * @returns {boolean} false if iteration was cancelled
		 * @since 2.28
		 */
		visitRows: function(fn, opts) {
			if (!this.rootNode.children) {
				return false;
			}
			if (opts && opts.reverse) {
				delete opts.reverse;
				return this._visitRowsUp(fn, opts);
			}
			opts = opts || {};

			var i,
				nextIdx,
				parent,
				res,
				siblings,
				siblingOfs = 0,
				skipFirstNode = opts.includeSelf === false,
				includeHidden = !!opts.includeHidden,
				checkFilter = !includeHidden && this.enableFilter,
				node = opts.start || this.rootNode.children[0];

			parent = node.parent;
			while (parent) {
				// visit siblings
				siblings = parent.children;
				nextIdx = siblings.indexOf(node) + siblingOfs;

				for (i = nextIdx; i < siblings.length; i++) {
					node = siblings[i];
					if (checkFilter && !node.match && !node.subMatchCount) {
						continue;
					}
					if (!skipFirstNode && fn(node) === false) {
						return false;
					}
					skipFirstNode = false;
					// Dive into node's child nodes
					if (
						node.children &&
						node.children.length &&
						(includeHidden || node.expanded)
					) {
						// Disable warning: Functions declared within loops referencing an outer
						// scoped variable may lead to confusing semantics:
						/*jshint -W083 */
						res = node.visit(function(n) {
							if (checkFilter && !n.match && !n.subMatchCount) {
								return "skip";
							}
							if (fn(n) === false) {
								return false;
							}
							if (!includeHidden && n.children && !n.expanded) {
								return "skip";
							}
						}, false);
						/*jshint +W083 */
						if (res === false) {
							return false;
						}
					}
				}
				// Visit parent nodes (bottom up)
				node = parent;
				parent = parent.parent;
				siblingOfs = 1; //
			}
			return true;
		},
		/* Call fn(node) for all nodes in vertical order, bottom up.
		 */
		_visitRowsUp: function(fn, opts) {
			var children,
				idx,
				parent,
				includeHidden = !!opts.includeHidden,
				node = opts.start || this.rootNode.children[0];

			while (true) {
				parent = node.parent;
				children = parent.children;

				if (children[0] === node) {
					// If this is already the first sibling, goto parent
					node = parent;
					if (!node.parent) {
						break; // first node of the tree
					}
					children = parent.children;
				} else {
					// Otherwise, goto prev. sibling
					idx = children.indexOf(node);
					node = children[idx - 1];
					// If the prev. sibling has children, follow down to last descendant
					while (
						// See: https://github.com/eslint/eslint/issues/11302
						// eslint-disable-next-line no-unmodified-loop-condition
						(includeHidden || node.expanded) &&
						node.children &&
						node.children.length
					) {
						children = node.children;
						parent = node;
						node = children[children.length - 1];
					}
				}
				// Skip invisible
				if (!includeHidden && !node.isVisible()) {
					continue;
				}
				if (fn(node) === false) {
					return false;
				}
			}
		},
		/** Write warning to browser console if debugLevel >= 2 (prepending tree info)
		 *
		 * @param {*} msg string or object or array of such
		 */
		warn: function(msg) {
			if (this.options.debugLevel >= 2) {
				Array.prototype.unshift.call(arguments, this.toString());
				consoleApply("warn", arguments);
			}
		},
	};

	/**
	 * These additional methods of the {@link Fancytree} class are 'hook functions'
	 * that can be used and overloaded by extensions.
	 * (See <a href="https://github.com/mar10/fancytree/wiki/TutorialExtensions">writing extensions</a>.)
	 * @mixin Fancytree_Hooks
	 */
	$.extend(
		Fancytree.prototype,
		/** @lends Fancytree_Hooks# */
		{
			/** Default handling for mouse click events.
			 *
			 * @param {EventData} ctx
			 */
			nodeClick: function(ctx) {
				var activate,
					expand,
					// event = ctx.originalEvent,
					targetType = ctx.targetType,
					node = ctx.node;

				// this.debug("ftnode.onClick(" + event.type + "): ftnode:" + this + ", button:" + event.button + ", which: " + event.which, ctx);
				// TODO: use switch
				// TODO: make sure clicks on embedded <input> doesn't steal focus (see table sample)
				if (targetType === "expander") {
					if (node.isLoading()) {
						// #495: we probably got a click event while a lazy load is pending.
						// The 'expanded' state is not yet set, so 'toggle' would expand
						// and trigger lazyLoad again.
						// It would be better to allow to collapse/expand the status node
						// while loading (instead of ignoring), but that would require some
						// more work.
						node.debug("Got 2nd click while loading: ignored");
						return;
					}
					// Clicking the expander icon always expands/collapses
					this._callHook("nodeToggleExpanded", ctx);
				} else if (targetType === "checkbox") {
					// Clicking the checkbox always (de)selects
					this._callHook("nodeToggleSelected", ctx);
					if (ctx.options.focusOnSelect) {
						// #358
						this._callHook("nodeSetFocus", ctx, true);
					}
				} else {
					// Honor `clickFolderMode` for
					expand = false;
					activate = true;
					if (node.folder) {
						switch (ctx.options.clickFolderMode) {
							case 2: // expand only
								expand = true;
								activate = false;
								break;
							case 3: // expand and activate
								activate = true;
								expand = true; //!node.isExpanded();
								break;
							// else 1 or 4: just activate
						}
					}
					if (activate) {
						this.nodeSetFocus(ctx);
						this._callHook("nodeSetActive", ctx, true);
					}
					if (expand) {
						if (!activate) {
							// this._callHook("nodeSetFocus", ctx);
						}
						// this._callHook("nodeSetExpanded", ctx, true);
						this._callHook("nodeToggleExpanded", ctx);
					}
				}
				// Make sure that clicks stop, otherwise <a href='#'> jumps to the top
				// if(event.target.localName === "a" && event.target.className === "fancytree-title"){
				// 	event.preventDefault();
				// }
				// TODO: return promise?
			},
			/** Collapse all other  children of same parent.
			 *
			 * @param {EventData} ctx
			 * @param {object} callOpts
			 */
			nodeCollapseSiblings: function(ctx, callOpts) {
				// TODO: return promise?
				var ac,
					i,
					l,
					node = ctx.node;

				if (node.parent) {
					ac = node.parent.children;
					for (i = 0, l = ac.length; i < l; i++) {
						if (ac[i] !== node && ac[i].expanded) {
							this._callHook(
								"nodeSetExpanded",
								ac[i],
								false,
								callOpts
							);
						}
					}
				}
			},
			/** Default handling for mouse douleclick events.
			 * @param {EventData} ctx
			 */
			nodeDblclick: function(ctx) {
				// TODO: return promise?
				if (
					ctx.targetType === "title" &&
					ctx.options.clickFolderMode === 4
				) {
					// this.nodeSetFocus(ctx);
					// this._callHook("nodeSetActive", ctx, true);
					this._callHook("nodeToggleExpanded", ctx);
				}
				// TODO: prevent text selection on dblclicks
				if (ctx.targetType === "title") {
					ctx.originalEvent.preventDefault();
				}
			},
			/** Default handling for mouse keydown events.
			 *
			 * NOTE: this may be called with node == null if tree (but no node) has focus.
			 * @param {EventData} ctx
			 */
			nodeKeydown: function(ctx) {
				// TODO: return promise?
				var matchNode,
					stamp,
					_res,
					focusNode,
					event = ctx.originalEvent,
					node = ctx.node,
					tree = ctx.tree,
					opts = ctx.options,
					which = event.which,
					// #909: Use event.key, to get unicode characters.
					// We can't use `/\w/.test(key)`, because that would
					// only detect plain ascii alpha-numerics. But we still need
					// to ignore modifier-only, whitespace, cursor-keys, etc.
					key = event.key || String.fromCharCode(which),
					specialModifiers = !!(
						event.altKey ||
						event.ctrlKey ||
						event.metaKey
					),
					isAlnum =
						!MODIFIERS[which] &&
						!SPECIAL_KEYCODES[which] &&
						!specialModifiers,
					$target = $(event.target),
					handled = true,
					activate = !(event.ctrlKey || !opts.autoActivate);

				// (node || FT).debug("ftnode.nodeKeydown(" + event.type + "): ftnode:" + this + ", charCode:" + event.charCode + ", keyCode: " + event.keyCode + ", which: " + event.which);
				// FT.debug( "eventToString(): " + FT.eventToString(event) + ", key='" + key + "', isAlnum: " + isAlnum );

				// Set focus to active (or first node) if no other node has the focus yet
				if (!node) {
					focusNode = this.getActiveNode() || this.getFirstChild();
					if (focusNode) {
						focusNode.setFocus();
						node = ctx.node = this.focusNode;
						node.debug("Keydown force focus on active node");
					}
				}

				if (
					opts.quicksearch &&
					isAlnum &&
					!$target.is(":input:enabled")
				) {
					// Allow to search for longer streaks if typed in quickly
					stamp = Date.now();
					if (stamp - tree.lastQuicksearchTime > 500) {
						tree.lastQuicksearchTerm = "";
					}
					tree.lastQuicksearchTime = stamp;
					tree.lastQuicksearchTerm += key;
					// tree.debug("quicksearch find", tree.lastQuicksearchTerm);
					matchNode = tree.findNextNode(
						tree.lastQuicksearchTerm,
						tree.getActiveNode()
					);
					if (matchNode) {
						matchNode.setActive();
					}
					event.preventDefault();
					return;
				}
				switch (FT.eventToString(event)) {
					case "+":
					case "=": // 187: '+' @ Chrome, Safari
						tree.nodeSetExpanded(ctx, true);
						break;
					case "-":
						tree.nodeSetExpanded(ctx, false);
						break;
					case "space":
						if (node.isPagingNode()) {
							tree._triggerNodeEvent("clickPaging", ctx, event);
						} else if (
							FT.evalOption("checkbox", node, node, opts, false)
						) {
							// #768
							tree.nodeToggleSelected(ctx);
						} else {
							tree.nodeSetActive(ctx, true);
						}
						break;
					case "return":
						tree.nodeSetActive(ctx, true);
						break;
					case "home":
					case "end":
					case "backspace":
					case "left":
					case "right":
					case "up":
					case "down":
						_res = node.navigate(event.which, activate);
						break;
					default:
						handled = false;
				}
				if (handled) {
					event.preventDefault();
				}
			},

			// /** Default handling for mouse keypress events. */
			// nodeKeypress: function(ctx) {
			//     var event = ctx.originalEvent;
			// },

			// /** Trigger lazyLoad event (async). */
			// nodeLazyLoad: function(ctx) {
			//     var node = ctx.node;
			//     if(this._triggerNodeEvent())
			// },
			/** Load child nodes (async).
			 *
			 * @param {EventData} ctx
			 * @param {object[]|object|string|$.Promise|function} source
			 * @returns {$.Promise} The deferred will be resolved as soon as the (ajax)
			 *     data was rendered.
			 */
			nodeLoadChildren: function(ctx, source) {
				var ajax,
					delay,
					dfd,
					res,
					tree = ctx.tree,
					node = ctx.node,
					requestId = Date.now();

				if ($.isFunction(source)) {
					source = source.call(tree, { type: "source" }, ctx);
					_assert(
						!$.isFunction(source),
						"source callback must not return another function"
					);
				}
				if (source.url) {
					if (node._requestId) {
						node.warn(
							"Recursive load request #" +
								requestId +
								" while #" +
								node._requestId +
								" is pending."
						);
						// } else {
						// 	node.debug("Send load request #" + requestId);
					}
					// `source` is an Ajax options object
					ajax = $.extend({}, ctx.options.ajax, source);
					node._requestId = requestId;
					if (ajax.debugDelay) {
						// simulate a slow server
						delay = ajax.debugDelay;
						delete ajax.debugDelay; // remove debug option
						if ($.isArray(delay)) {
							// random delay range [min..max]
							delay =
								delay[0] +
								Math.random() * (delay[1] - delay[0]);
						}
						node.warn(
							"nodeLoadChildren waiting debugDelay " +
								Math.round(delay) +
								" ms ..."
						);
						dfd = $.Deferred(function(dfd) {
							setTimeout(function() {
								$.ajax(ajax)
									.done(function() {
										dfd.resolveWith(this, arguments);
									})
									.fail(function() {
										dfd.rejectWith(this, arguments);
									});
							}, delay);
						});
					} else {
						dfd = $.ajax(ajax);
					}

					// Defer the deferred: we want to be able to reject, even if ajax
					// resolved ok.
					source = new $.Deferred();
					dfd.done(function(data, textStatus, jqXHR) {
						var errorObj, res;

						if (
							(this.dataType === "json" ||
								this.dataType === "jsonp") &&
							typeof data === "string"
						) {
							$.error(
								"Ajax request returned a string (did you get the JSON dataType wrong?)."
							);
						}
						if (node._requestId && node._requestId > requestId) {
							// The expected request time stamp is later than `requestId`
							// (which was kept as as closure variable to this handler function)
							// node.warn("Ignored load response for obsolete request #" + requestId + " (expected #" + node._requestId + ")");
							source.rejectWith(this, [RECURSIVE_REQUEST_ERROR]);
							return;
							// } else {
							// 	node.debug("Response returned for load request #" + requestId);
						}
						// postProcess is similar to the standard ajax dataFilter hook,
						// but it is also called for JSONP
						if (ctx.options.postProcess) {
							try {
								// The handler may either
								//   - modify `ctx.response` in-place (and leave `ctx.result` undefined)
								//     => res = undefined
								//   - return a replacement in `ctx.result`
								//     => res = <new data>
								// If res contains an `error` property, an error status is displayed
								res = tree._triggerNodeEvent(
									"postProcess",
									ctx,
									ctx.originalEvent,
									{
										response: data,
										error: null,
										dataType: this.dataType,
									}
								);
							} catch (e) {
								res = {
									error: e,
									message: "" + e,
									details: "postProcess failed",
								};
							}
							if (res.error) {
								errorObj = $.isPlainObject(res.error)
									? res.error
									: { message: res.error };
								errorObj = tree._makeHookContext(
									node,
									null,
									errorObj
								);
								source.rejectWith(this, [errorObj]);
								return;
							}
							if (
								$.isArray(res) ||
								($.isPlainObject(res) &&
									$.isArray(res.children))
							) {
								// Use `ctx.result` if valid
								// (otherwise use existing data, which may have been modified in-place)
								data = res;
							}
						} else if (
							data &&
							data.hasOwnProperty("d") &&
							ctx.options.enableAspx
						) {
							// Process ASPX WebMethod JSON object inside "d" property
							data =
								typeof data.d === "string"
									? $.parseJSON(data.d)
									: data.d;
						}
						source.resolveWith(this, [data]);
					}).fail(function(jqXHR, textStatus, errorThrown) {
						var errorObj = tree._makeHookContext(node, null, {
							error: jqXHR,
							args: Array.prototype.slice.call(arguments),
							message: errorThrown,
							details: jqXHR.status + ": " + errorThrown,
						});
						source.rejectWith(this, [errorObj]);
					});
				}
				// #383: accept and convert ECMAScript 6 Promise
				if ($.isFunction(source.then) && $.isFunction(source.catch)) {
					dfd = source;
					source = new $.Deferred();
					dfd.then(
						function(value) {
							source.resolve(value);
						},
						function(reason) {
							source.reject(reason);
						}
					);
				}
				if ($.isFunction(source.promise)) {
					// `source` is a deferred, i.e. ajax request
					// _assert(!node.isLoading(), "recursive load");
					tree.nodeSetStatus(ctx, "loading");

					source
						.done(function(children) {
							tree.nodeSetStatus(ctx, "ok");
							node._requestId = null;
						})
						.fail(function(error) {
							var ctxErr;

							if (error === RECURSIVE_REQUEST_ERROR) {
								node.warn(
									"Ignored response for obsolete load request #" +
										requestId +
										" (expected #" +
										node._requestId +
										")"
								);
								return;
							} else if (
								error.node &&
								error.error &&
								error.message
							) {
								// error is already a context object
								ctxErr = error;
							} else {
								ctxErr = tree._makeHookContext(node, null, {
									error: error, // it can be jqXHR or any custom error
									args: Array.prototype.slice.call(arguments),
									message: error
										? error.message || error.toString()
										: "",
								});
								if (ctxErr.message === "[object Object]") {
									ctxErr.message = "";
								}
							}
							node.warn(
								"Load children failed (" + ctxErr.message + ")",
								ctxErr
							);
							if (
								tree._triggerNodeEvent(
									"loadError",
									ctxErr,
									null
								) !== false
							) {
								tree.nodeSetStatus(
									ctx,
									"error",
									ctxErr.message,
									ctxErr.details
								);
							}
						});
				} else {
					if (ctx.options.postProcess) {
						// #792: Call postProcess for non-deferred source
						res = tree._triggerNodeEvent(
							"postProcess",
							ctx,
							ctx.originalEvent,
							{
								response: source,
								error: null,
								dataType: typeof source,
							}
						);

						if (
							$.isArray(res) ||
							($.isPlainObject(res) && $.isArray(res.children))
						) {
							// Use `ctx.result` if valid
							// (otherwise use existing data, which may have been modified in-place)
							source = res;
						}
					}
				}
				// $.when(source) resolves also for non-deferreds
				return $.when(source).done(function(children) {
					var metaData, noDataRes;

					if ($.isPlainObject(children)) {
						// We got {foo: 'abc', children: [...]}
						// Copy extra properties to tree.data.foo
						_assert(
							node.isRootNode(),
							"source may only be an object for root nodes (expecting an array of child objects otherwise)"
						);
						_assert(
							$.isArray(children.children),
							"if an object is passed as source, it must contain a 'children' array (all other properties are added to 'tree.data')"
						);
						metaData = children;
						children = children.children;
						delete metaData.children;
						// Copy some attributes to tree.data
						$.each(TREE_ATTRS, function(i, attr) {
							if (metaData[attr] !== undefined) {
								tree[attr] = metaData[attr];
								delete metaData[attr];
							}
						});
						// Copy all other attributes to tree.data.NAME
						$.extend(tree.data, metaData);
					}
					_assert($.isArray(children), "expected array of children");
					node._setChildren(children);

					if (tree.options.nodata && children.length === 0) {
						if ($.isFunction(tree.options.nodata)) {
							noDataRes = tree.options.nodata.call(
								tree,
								{ type: "nodata" },
								ctx
							);
						} else if (
							tree.options.nodata === true &&
							node.isRootNode()
						) {
							noDataRes = tree.options.strings.nodata;
						} else if (
							typeof tree.options.nodata === "string" &&
							node.isRootNode()
						) {
							noDataRes = tree.options.nodata;
						}
						if (noDataRes) {
							node.setStatus("nodata", noDataRes);
						}
					}
					// trigger fancytreeloadchildren
					tree._triggerNodeEvent("loadChildren", node);
				});
			},
			/** [Not Implemented]  */
			nodeLoadKeyPath: function(ctx, keyPathList) {
				// TODO: implement and improve
				// http://code.google.com/p/dynatree/issues/detail?id=222
			},
			/**
			 * Remove a single direct child of ctx.node.
			 * @param {EventData} ctx
			 * @param {FancytreeNode} childNode dircect child of ctx.node
			 */
			nodeRemoveChild: function(ctx, childNode) {
				var idx,
					node = ctx.node,
					// opts = ctx.options,
					subCtx = $.extend({}, ctx, { node: childNode }),
					children = node.children;

				// FT.debug("nodeRemoveChild()", node.toString(), childNode.toString());

				if (children.length === 1) {
					_assert(childNode === children[0], "invalid single child");
					return this.nodeRemoveChildren(ctx);
				}
				if (
					this.activeNode &&
					(childNode === this.activeNode ||
						this.activeNode.isDescendantOf(childNode))
				) {
					this.activeNode.setActive(false); // TODO: don't fire events
				}
				if (
					this.focusNode &&
					(childNode === this.focusNode ||
						this.focusNode.isDescendantOf(childNode))
				) {
					this.focusNode = null;
				}
				// TODO: persist must take care to clear select and expand cookies
				this.nodeRemoveMarkup(subCtx);
				this.nodeRemoveChildren(subCtx);
				idx = $.inArray(childNode, children);
				_assert(idx >= 0, "invalid child");
				// Notify listeners
				node.triggerModifyChild("remove", childNode);
				// Unlink to support GC
				childNode.visit(function(n) {
					n.parent = null;
				}, true);
				this._callHook("treeRegisterNode", this, false, childNode);
				// remove from child list
				children.splice(idx, 1);
			},
			/**Remove HTML markup for all descendents of ctx.node.
			 * @param {EventData} ctx
			 */
			nodeRemoveChildMarkup: function(ctx) {
				var node = ctx.node;

				// FT.debug("nodeRemoveChildMarkup()", node.toString());
				// TODO: Unlink attr.ftnode to support GC
				if (node.ul) {
					if (node.isRootNode()) {
						$(node.ul).empty();
					} else {
						$(node.ul).remove();
						node.ul = null;
					}
					node.visit(function(n) {
						n.li = n.ul = null;
					});
				}
			},
			/**Remove all descendants of ctx.node.
			 * @param {EventData} ctx
			 */
			nodeRemoveChildren: function(ctx) {
				var //subCtx,
					tree = ctx.tree,
					node = ctx.node,
					children = node.children;
				// opts = ctx.options;

				// FT.debug("nodeRemoveChildren()", node.toString());
				if (!children) {
					return;
				}
				if (this.activeNode && this.activeNode.isDescendantOf(node)) {
					this.activeNode.setActive(false); // TODO: don't fire events
				}
				if (this.focusNode && this.focusNode.isDescendantOf(node)) {
					this.focusNode = null;
				}
				// TODO: persist must take care to clear select and expand cookies
				this.nodeRemoveChildMarkup(ctx);
				// Unlink children to support GC
				// TODO: also delete this.children (not possible using visit())
				// subCtx = $.extend({}, ctx);
				node.triggerModifyChild("remove", null);
				node.visit(function(n) {
					n.parent = null;
					tree._callHook("treeRegisterNode", tree, false, n);
				});
				if (node.lazy) {
					// 'undefined' would be interpreted as 'not yet loaded' for lazy nodes
					node.children = [];
				} else {
					node.children = null;
				}
				if (!node.isRootNode()) {
					node.expanded = false; // #449, #459
				}
				this.nodeRenderStatus(ctx);
			},
			/**Remove HTML markup for ctx.node and all its descendents.
			 * @param {EventData} ctx
			 */
			nodeRemoveMarkup: function(ctx) {
				var node = ctx.node;
				// FT.debug("nodeRemoveMarkup()", node.toString());
				// TODO: Unlink attr.ftnode to support GC
				if (node.li) {
					$(node.li).remove();
					node.li = null;
				}
				this.nodeRemoveChildMarkup(ctx);
			},
			/**
			 * Create `&lt;li>&lt;span>..&lt;/span> .. &lt;/li>` tags for this node.
			 *
			 * This method takes care that all HTML markup is created that is required
			 * to display this node in its current state.
			 *
			 * Call this method to create new nodes, or after the strucuture
			 * was changed (e.g. after moving this node or adding/removing children)
			 * nodeRenderTitle() and nodeRenderStatus() are implied.
			 *
			 * &lt;code>
			 * &lt;li id='KEY' ftnode=NODE>
			 *     &lt;span class='fancytree-node fancytree-expanded fancytree-has-children fancytree-lastsib fancytree-exp-el fancytree-ico-e'>
			 *         &lt;span class="fancytree-expander">&lt;/span>
			 *         &lt;span class="fancytree-checkbox">&lt;/span> // only present in checkbox mode
			 *         &lt;span class="fancytree-icon">&lt;/span>
			 *         &lt;a href="#" class="fancytree-title"> Node 1 &lt;/a>
			 *     &lt;/span>
			 *     &lt;ul> // only present if node has children
			 *         &lt;li id='KEY' ftnode=NODE> child1 ... &lt;/li>
			 *         &lt;li id='KEY' ftnode=NODE> child2 ... &lt;/li>
			 *     &lt;/ul>
			 * &lt;/li>
			 * &lt;/code>
			 *
			 * @param {EventData} ctx
			 * @param {boolean} [force=false] re-render, even if html markup was already created
			 * @param {boolean} [deep=false] also render all descendants, even if parent is collapsed
			 * @param {boolean} [collapsed=false] force root node to be collapsed, so we can apply animated expand later
			 */
			nodeRender: function(ctx, force, deep, collapsed, _recursive) {
				/* This method must take care of all cases where the current data mode
				 * (i.e. node hierarchy) does not match the current markup.
				 *
				 * - node was not yet rendered:
				 *   create markup
				 * - node was rendered: exit fast
				 * - children have been added
				 * - children have been removed
				 */
				var childLI,
					childNode1,
					childNode2,
					i,
					l,
					next,
					subCtx,
					node = ctx.node,
					tree = ctx.tree,
					opts = ctx.options,
					aria = opts.aria,
					firstTime = false,
					parent = node.parent,
					isRootNode = !parent,
					children = node.children,
					successorLi = null;
				// FT.debug("nodeRender(" + !!force + ", " + !!deep + ")", node.toString());

				if (tree._enableUpdate === false) {
					// tree.debug("no render", tree._enableUpdate);
					return;
				}
				if (!isRootNode && !parent.ul) {
					// Calling node.collapse on a deep, unrendered node
					return;
				}
				_assert(isRootNode || parent.ul, "parent UL must exist");

				// Render the node
				if (!isRootNode) {
					// Discard markup on force-mode, or if it is not linked to parent <ul>
					if (
						node.li &&
						(force || node.li.parentNode !== node.parent.ul)
					) {
						if (node.li.parentNode === node.parent.ul) {
							// #486: store following node, so we can insert the new markup there later
							successorLi = node.li.nextSibling;
						} else {
							// May happen, when a top-level node was dropped over another
							this.debug(
								"Unlinking " +
									node +
									" (must be child of " +
									node.parent +
									")"
							);
						}
						//	            this.debug("nodeRemoveMarkup...");
						this.nodeRemoveMarkup(ctx);
					}
					// Create <li><span /> </li>
					// node.debug("render...");
					if (node.li) {
						// this.nodeRenderTitle(ctx);
						this.nodeRenderStatus(ctx);
					} else {
						// node.debug("render... really");
						firstTime = true;
						node.li = document.createElement("li");
						node.li.ftnode = node;

						if (node.key && opts.generateIds) {
							node.li.id = opts.idPrefix + node.key;
						}
						node.span = document.createElement("span");
						node.span.className = "fancytree-node";
						if (aria && !node.tr) {
							$(node.li).attr("role", "treeitem");
						}
						node.li.appendChild(node.span);

						// Create inner HTML for the <span> (expander, checkbox, icon, and title)
						this.nodeRenderTitle(ctx);

						// Allow tweaking and binding, after node was created for the first time
						if (opts.createNode) {
							opts.createNode.call(
								tree,
								{ type: "createNode" },
								ctx
							);
						}
					}
					// Allow tweaking after node state was rendered
					if (opts.renderNode) {
						opts.renderNode.call(tree, { type: "renderNode" }, ctx);
					}
				}

				// Visit child nodes
				if (children) {
					if (isRootNode || node.expanded || deep === true) {
						// Create a UL to hold the children
						if (!node.ul) {
							node.ul = document.createElement("ul");
							if (
								(collapsed === true && !_recursive) ||
								!node.expanded
							) {
								// hide top UL, so we can use an animation to show it later
								node.ul.style.display = "none";
							}
							if (aria) {
								$(node.ul).attr("role", "group");
							}
							if (node.li) {
								// issue #67
								node.li.appendChild(node.ul);
							} else {
								node.tree.$div.append(node.ul);
							}
						}
						// Add child markup
						for (i = 0, l = children.length; i < l; i++) {
							subCtx = $.extend({}, ctx, { node: children[i] });
							this.nodeRender(subCtx, force, deep, false, true);
						}
						// Remove <li> if nodes have moved to another parent
						childLI = node.ul.firstChild;
						while (childLI) {
							childNode2 = childLI.ftnode;
							if (childNode2 && childNode2.parent !== node) {
								node.debug(
									"_fixParent: remove missing " + childNode2,
									childLI
								);
								next = childLI.nextSibling;
								childLI.parentNode.removeChild(childLI);
								childLI = next;
							} else {
								childLI = childLI.nextSibling;
							}
						}
						// Make sure, that <li> order matches node.children order.
						childLI = node.ul.firstChild;
						for (i = 0, l = children.length - 1; i < l; i++) {
							childNode1 = children[i];
							childNode2 = childLI.ftnode;
							if (childNode1 === childNode2) {
								childLI = childLI.nextSibling;
							} else {
								// node.debug("_fixOrder: mismatch at index " + i + ": " + childNode1 + " != " + childNode2);
								node.ul.insertBefore(
									childNode1.li,
									childNode2.li
								);
							}
						}
					}
				} else {
					// No children: remove markup if any
					if (node.ul) {
						// alert("remove child markup for " + node);
						this.warn("remove child markup for " + node);
						this.nodeRemoveChildMarkup(ctx);
					}
				}
				if (!isRootNode) {
					// Update element classes according to node state
					// this.nodeRenderStatus(ctx);
					// Finally add the whole structure to the DOM, so the browser can render
					if (firstTime) {
						// #486: successorLi is set, if we re-rendered (i.e. discarded)
						// existing markup, which  we want to insert at the same position.
						// (null is equivalent to append)
						//				parent.ul.appendChild(node.li);
						parent.ul.insertBefore(node.li, successorLi);
					}
				}
			},
			/** Create HTML inside the node's outer &lt;span> (i.e. expander, checkbox,
			 * icon, and title).
			 *
			 * nodeRenderStatus() is implied.
			 * @param {EventData} ctx
			 * @param {string} [title] optinal new title
			 */
			nodeRenderTitle: function(ctx, title) {
				// set node connector images, links and text
				var checkbox,
					className,
					icon,
					nodeTitle,
					role,
					tabindex,
					tooltip,
					iconTooltip,
					node = ctx.node,
					tree = ctx.tree,
					opts = ctx.options,
					aria = opts.aria,
					level = node.getLevel(),
					ares = [];

				if (title !== undefined) {
					node.title = title;
				}
				if (!node.span || tree._enableUpdate === false) {
					// Silently bail out if node was not rendered yet, assuming
					// node.render() will be called as the node becomes visible
					return;
				}
				// Connector (expanded, expandable or simple)
				role =
					aria && node.hasChildren() !== false
						? " role='button'"
						: "";
				if (level < opts.minExpandLevel) {
					if (!node.lazy) {
						node.expanded = true;
					}
					if (level > 1) {
						ares.push(
							"<span " +
								role +
								" class='fancytree-expander fancytree-expander-fixed'></span>"
						);
					}
					// .. else (i.e. for root level) skip expander/connector alltogether
				} else {
					ares.push(
						"<span " + role + " class='fancytree-expander'></span>"
					);
				}
				// Checkbox mode
				checkbox = FT.evalOption("checkbox", node, node, opts, false);

				if (checkbox && !node.isStatusNode()) {
					role = aria ? " role='checkbox'" : "";
					className = "fancytree-checkbox";
					if (
						checkbox === "radio" ||
						(node.parent && node.parent.radiogroup)
					) {
						className += " fancytree-radio";
					}
					ares.push(
						"<span " + role + " class='" + className + "'></span>"
					);
				}
				// Folder or doctype icon
				if (node.data.iconClass !== undefined) {
					// 2015-11-16
					// Handle / warn about backward compatibility
					if (node.icon) {
						$.error(
							"'iconClass' node option is deprecated since v2.14.0: use 'icon' only instead"
						);
					} else {
						node.warn(
							"'iconClass' node option is deprecated since v2.14.0: use 'icon' instead"
						);
						node.icon = node.data.iconClass;
					}
				}
				// If opts.icon is a callback and returns something other than undefined, use that
				// else if node.icon is a boolean or string, use that
				// else if opts.icon is a boolean or string, use that
				// else show standard icon (which may be different for folders or documents)
				icon = FT.evalOption("icon", node, node, opts, true);
				// if( typeof icon !== "boolean" ) {
				// 	// icon is defined, but not true/false: must be a string
				// 	icon = "" + icon;
				// }
				if (icon !== false) {
					role = aria ? " role='presentation'" : "";

					iconTooltip = FT.evalOption(
						"iconTooltip",
						node,
						node,
						opts,
						null
					);
					iconTooltip = iconTooltip
						? " title='" + _escapeTooltip(iconTooltip) + "'"
						: "";

					if (typeof icon === "string") {
						if (TEST_IMG.test(icon)) {
							// node.icon is an image url. Prepend imagePath
							icon =
								icon.charAt(0) === "/"
									? icon
									: (opts.imagePath || "") + icon;
							ares.push(
								"<img src='" +
									icon +
									"' class='fancytree-icon'" +
									iconTooltip +
									" alt='' />"
							);
						} else {
							ares.push(
								"<span " +
									role +
									" class='fancytree-custom-icon " +
									icon +
									"'" +
									iconTooltip +
									"></span>"
							);
						}
					} else if (icon.text) {
						ares.push(
							"<span " +
								role +
								" class='fancytree-custom-icon " +
								(icon.addClass || "") +
								"'" +
								iconTooltip +
								">" +
								FT.escapeHtml(icon.text) +
								"</span>"
						);
					} else if (icon.html) {
						ares.push(
							"<span " +
								role +
								" class='fancytree-custom-icon " +
								(icon.addClass || "") +
								"'" +
								iconTooltip +
								">" +
								icon.html +
								"</span>"
						);
					} else {
						// standard icon: theme css will take care of this
						ares.push(
							"<span " +
								role +
								" class='fancytree-icon'" +
								iconTooltip +
								"></span>"
						);
					}
				}
				// Node title
				nodeTitle = "";
				if (opts.renderTitle) {
					nodeTitle =
						opts.renderTitle.call(
							tree,
							{ type: "renderTitle" },
							ctx
						) || "";
				}
				if (!nodeTitle) {
					tooltip = FT.evalOption("tooltip", node, node, opts, null);
					if (tooltip === true) {
						tooltip = node.title;
					}
					// if( node.tooltip ) {
					// 	tooltip = node.tooltip;
					// } else if ( opts.tooltip ) {
					// 	tooltip = opts.tooltip === true ? node.title : opts.tooltip.call(tree, node);
					// }
					tooltip = tooltip
						? " title='" + _escapeTooltip(tooltip) + "'"
						: "";
					tabindex = opts.titlesTabbable ? " tabindex='0'" : "";

					nodeTitle =
						"<span class='fancytree-title'" +
						tooltip +
						tabindex +
						">" +
						(opts.escapeTitles
							? FT.escapeHtml(node.title)
							: node.title) +
						"</span>";
				}
				ares.push(nodeTitle);
				// Note: this will trigger focusout, if node had the focus
				//$(node.span).html(ares.join("")); // it will cleanup the jQuery data currently associated with SPAN (if any), but it executes more slowly
				node.span.innerHTML = ares.join("");
				// Update CSS classes
				this.nodeRenderStatus(ctx);
				if (opts.enhanceTitle) {
					ctx.$title = $(">span.fancytree-title", node.span);
					nodeTitle =
						opts.enhanceTitle.call(
							tree,
							{ type: "enhanceTitle" },
							ctx
						) || "";
				}
			},
			/** Update element classes according to node state.
			 * @param {EventData} ctx
			 */
			nodeRenderStatus: function(ctx) {
				// Set classes for current status
				var $ariaElem,
					node = ctx.node,
					tree = ctx.tree,
					opts = ctx.options,
					//			nodeContainer = node[tree.nodeContainerAttrName],
					hasChildren = node.hasChildren(),
					isLastSib = node.isLastSibling(),
					aria = opts.aria,
					cn = opts._classNames,
					cnList = [],
					statusElem = node[tree.statusClassPropName];

				if (!statusElem || tree._enableUpdate === false) {
					// if this function is called for an unrendered node, ignore it (will be updated on nect render anyway)
					return;
				}
				if (aria) {
					$ariaElem = $(node.tr || node.li);
				}
				// Build a list of class names that we will add to the node <span>
				cnList.push(cn.node);
				if (tree.activeNode === node) {
					cnList.push(cn.active);
					// 		$(">span.fancytree-title", statusElem).attr("tabindex", "0");
					// 		tree.$container.removeAttr("tabindex");
					// }else{
					// 		$(">span.fancytree-title", statusElem).removeAttr("tabindex");
					// 		tree.$container.attr("tabindex", "0");
				}
				if (tree.focusNode === node) {
					cnList.push(cn.focused);
				}
				if (node.expanded) {
					cnList.push(cn.expanded);
				}
				if (aria) {
					if (hasChildren === false) {
						$ariaElem.removeAttr("aria-expanded");
					} else {
						$ariaElem.attr("aria-expanded", Boolean(node.expanded));
					}
				}
				if (node.folder) {
					cnList.push(cn.folder);
				}
				if (hasChildren !== false) {
					cnList.push(cn.hasChildren);
				}
				// TODO: required?
				if (isLastSib) {
					cnList.push(cn.lastsib);
				}
				if (node.lazy && node.children == null) {
					cnList.push(cn.lazy);
				}
				if (node.partload) {
					cnList.push(cn.partload);
				}
				if (node.partsel) {
					cnList.push(cn.partsel);
				}
				if (FT.evalOption("unselectable", node, node, opts, false)) {
					cnList.push(cn.unselectable);
				}
				if (node._isLoading) {
					cnList.push(cn.loading);
				}
				if (node._error) {
					cnList.push(cn.error);
				}
				if (node.statusNodeType) {
					cnList.push(cn.statusNodePrefix + node.statusNodeType);
				}
				if (node.selected) {
					cnList.push(cn.selected);
					if (aria) {
						$ariaElem.attr("aria-selected", true);
					}
				} else if (aria) {
					$ariaElem.attr("aria-selected", false);
				}
				if (node.extraClasses) {
					cnList.push(node.extraClasses);
				}
				// IE6 doesn't correctly evaluate multiple class names,
				// so we create combined class names that can be used in the CSS
				if (hasChildren === false) {
					cnList.push(
						cn.combinedExpanderPrefix + "n" + (isLastSib ? "l" : "")
					);
				} else {
					cnList.push(
						cn.combinedExpanderPrefix +
							(node.expanded ? "e" : "c") +
							(node.lazy && node.children == null ? "d" : "") +
							(isLastSib ? "l" : "")
					);
				}
				cnList.push(
					cn.combinedIconPrefix +
						(node.expanded ? "e" : "c") +
						(node.folder ? "f" : "")
				);
				// node.span.className = cnList.join(" ");
				statusElem.className = cnList.join(" ");

				// TODO: we should not set this in the <span> tag also, if we set it here:
				// Maybe most (all) of the classes should be set in LI instead of SPAN?
				if (node.li) {
					// #719: we have to consider that there may be already other classes:
					$(node.li).toggleClass(cn.lastsib, isLastSib);
				}
			},
			/** Activate node.
			 * flag defaults to true.
			 * If flag is true, the node is activated (must be a synchronous operation)
			 * If flag is false, the node is deactivated (must be a synchronous operation)
			 * @param {EventData} ctx
			 * @param {boolean} [flag=true]
			 * @param {object} [opts] additional options. Defaults to {noEvents: false, noFocus: false}
			 * @returns {$.Promise}
			 */
			nodeSetActive: function(ctx, flag, callOpts) {
				// Handle user click / [space] / [enter], according to clickFolderMode.
				callOpts = callOpts || {};
				var subCtx,
					node = ctx.node,
					tree = ctx.tree,
					opts = ctx.options,
					noEvents = callOpts.noEvents === true,
					noFocus = callOpts.noFocus === true,
					scroll = callOpts.scrollIntoView !== false,
					isActive = node === tree.activeNode;

				// flag defaults to true
				flag = flag !== false;
				// node.debug("nodeSetActive", flag);

				if (isActive === flag) {
					// Nothing to do
					return _getResolvedPromise(node);
				} else if (
					flag &&
					!noEvents &&
					this._triggerNodeEvent(
						"beforeActivate",
						node,
						ctx.originalEvent
					) === false
				) {
					// Callback returned false
					return _getRejectedPromise(node, ["rejected"]);
				}
				if (flag) {
					if (tree.activeNode) {
						_assert(
							tree.activeNode !== node,
							"node was active (inconsistency)"
						);
						subCtx = $.extend({}, ctx, { node: tree.activeNode });
						tree.nodeSetActive(subCtx, false);
						_assert(
							tree.activeNode === null,
							"deactivate was out of sync?"
						);
					}

					if (opts.activeVisible) {
						// If no focus is set (noFocus: true) and there is no focused node, this node is made visible.
						// scroll = noFocus && tree.focusNode == null;
						// #863: scroll by default (unless `scrollIntoView: false` was passed)
						node.makeVisible({ scrollIntoView: scroll });
					}
					tree.activeNode = node;
					tree.nodeRenderStatus(ctx);
					if (!noFocus) {
						tree.nodeSetFocus(ctx);
					}
					if (!noEvents) {
						tree._triggerNodeEvent(
							"activate",
							node,
							ctx.originalEvent
						);
					}
				} else {
					_assert(
						tree.activeNode === node,
						"node was not active (inconsistency)"
					);
					tree.activeNode = null;
					this.nodeRenderStatus(ctx);
					if (!noEvents) {
						ctx.tree._triggerNodeEvent(
							"deactivate",
							node,
							ctx.originalEvent
						);
					}
				}
				return _getResolvedPromise(node);
			},
			/** Expand or collapse node, return Deferred.promise.
			 *
			 * @param {EventData} ctx
			 * @param {boolean} [flag=true]
			 * @param {object} [opts] additional options. Defaults to {noAnimation: false, noEvents: false}
			 * @returns {$.Promise} The deferred will be resolved as soon as the (lazy)
			 *     data was retrieved, rendered, and the expand animation finshed.
			 */
			nodeSetExpanded: function(ctx, flag, callOpts) {
				callOpts = callOpts || {};
				var _afterLoad,
					dfd,
					i,
					l,
					parents,
					prevAC,
					node = ctx.node,
					tree = ctx.tree,
					opts = ctx.options,
					noAnimation = callOpts.noAnimation === true,
					noEvents = callOpts.noEvents === true;

				// flag defaults to true
				flag = flag !== false;

				// node.debug("nodeSetExpanded(" + flag + ")");

				if ((node.expanded && flag) || (!node.expanded && !flag)) {
					// Nothing to do
					// node.debug("nodeSetExpanded(" + flag + "): nothing to do");
					return _getResolvedPromise(node);
				} else if (flag && !node.lazy && !node.hasChildren()) {
					// Prevent expanding of empty nodes
					// return _getRejectedPromise(node, ["empty"]);
					return _getResolvedPromise(node);
				} else if (!flag && node.getLevel() < opts.minExpandLevel) {
					// Prevent collapsing locked levels
					return _getRejectedPromise(node, ["locked"]);
				} else if (
					!noEvents &&
					this._triggerNodeEvent(
						"beforeExpand",
						node,
						ctx.originalEvent
					) === false
				) {
					// Callback returned false
					return _getRejectedPromise(node, ["rejected"]);
				}
				// If this node inside a collpased node, no animation and scrolling is needed
				if (!noAnimation && !node.isVisible()) {
					noAnimation = callOpts.noAnimation = true;
				}

				dfd = new $.Deferred();

				// Auto-collapse mode: collapse all siblings
				if (flag && !node.expanded && opts.autoCollapse) {
					parents = node.getParentList(false, true);
					prevAC = opts.autoCollapse;
					try {
						opts.autoCollapse = false;
						for (i = 0, l = parents.length; i < l; i++) {
							// TODO: should return promise?
							this._callHook(
								"nodeCollapseSiblings",
								parents[i],
								callOpts
							);
						}
					} finally {
						opts.autoCollapse = prevAC;
					}
				}
				// Trigger expand/collapse after expanding
				dfd.done(function() {
					var lastChild = node.getLastChild();

					if (flag && opts.autoScroll && !noAnimation && lastChild) {
						// Scroll down to last child, but keep current node visible
						lastChild
							.scrollIntoView(true, { topNode: node })
							.always(function() {
								if (!noEvents) {
									ctx.tree._triggerNodeEvent(
										flag ? "expand" : "collapse",
										ctx
									);
								}
							});
					} else {
						if (!noEvents) {
							ctx.tree._triggerNodeEvent(
								flag ? "expand" : "collapse",
								ctx
							);
						}
					}
				});
				// vvv Code below is executed after loading finished:
				_afterLoad = function(callback) {
					var cn = opts._classNames,
						isVisible,
						isExpanded,
						effect = opts.toggleEffect;

					node.expanded = flag;
					tree._callHook(
						"treeStructureChanged",
						ctx,
						flag ? "expand" : "collapse"
					);
					// Create required markup, but make sure the top UL is hidden, so we
					// can animate later
					tree._callHook("nodeRender", ctx, false, false, true);

					// Hide children, if node is collapsed
					if (node.ul) {
						isVisible = node.ul.style.display !== "none";
						isExpanded = !!node.expanded;
						if (isVisible === isExpanded) {
							node.warn(
								"nodeSetExpanded: UL.style.display already set"
							);
						} else if (!effect || noAnimation) {
							node.ul.style.display =
								node.expanded || !parent ? "" : "none";
						} else {
							// The UI toggle() effect works with the ext-wide extension,
							// while jQuery.animate() has problems when the title span
							// has position: absolute.
							// Since jQuery UI 1.12, the blind effect requires the parent
							// element to have 'position: relative'.
							// See #716, #717
							$(node.li).addClass(cn.animating); // #717

							if ($.isFunction($(node.ul)[effect.effect])) {
								tree.debug(
									"use jquery." + effect.effect + " method"
								);
								$(node.ul)[effect.effect]({
									duration: effect.duration,
									always: function() {
										// node.debug("fancytree-animating end: " + node.li.className);
										$(this).removeClass(cn.animating); // #716
										$(node.li).removeClass(cn.animating); // #717
										callback();
									},
								});
							} else {
								// The UI toggle() effect works with the ext-wide extension,
								// while jQuery.animate() has problems when the title span
								// has positon: absolute.
								// Since jQuery UI 1.12, the blind effect requires the parent
								// element to have 'position: relative'.
								// See #716, #717
								// tree.debug("use specified effect (" + effect.effect + ") with the jqueryui.toggle method");

								// try to stop an animation that might be already in progress
								$(node.ul).stop(true, true); //< does not work after resetLazy has been called for a node whose animation wasn't complete and effect was "blind"

								// dirty fix to remove a defunct animation (effect: "blind") after resetLazy has been called
								$(node.ul)
									.parent()
									.find(".ui-effects-placeholder")
									.remove();

								$(node.ul).toggle(
									effect.effect,
									effect.options,
									effect.duration,
									function() {
										// node.debug("fancytree-animating end: " + node.li.className);
										$(this).removeClass(cn.animating); // #716
										$(node.li).removeClass(cn.animating); // #717
										callback();
									}
								);
							}
							return;
						}
					}
					callback();
				};
				// ^^^ Code above is executed after loading finshed.

				// Load lazy nodes, if any. Then continue with _afterLoad()
				if (flag && node.lazy && node.hasChildren() === undefined) {
					// node.debug("nodeSetExpanded: load start...");
					node.load()
						.done(function() {
							// node.debug("nodeSetExpanded: load done");
							if (dfd.notifyWith) {
								// requires jQuery 1.6+
								dfd.notifyWith(node, ["loaded"]);
							}
							_afterLoad(function() {
								dfd.resolveWith(node);
							});
						})
						.fail(function(errMsg) {
							_afterLoad(function() {
								dfd.rejectWith(node, [
									"load failed (" + errMsg + ")",
								]);
							});
						});
					/*
					var source = tree._triggerNodeEvent("lazyLoad", node, ctx.originalEvent);
					_assert(typeof source !== "boolean", "lazyLoad event must return source in data.result");
					node.debug("nodeSetExpanded: load start...");
					this._callHook("nodeLoadChildren", ctx, source).done(function(){
						node.debug("nodeSetExpanded: load done");
						if(dfd.notifyWith){ // requires jQuery 1.6+
							dfd.notifyWith(node, ["loaded"]);
						}
						_afterLoad.call(tree);
					}).fail(function(errMsg){
						dfd.rejectWith(node, ["load failed (" + errMsg + ")"]);
					});
					*/
				} else {
					_afterLoad(function() {
						dfd.resolveWith(node);
					});
				}
				// node.debug("nodeSetExpanded: returns");
				return dfd.promise();
			},
			/** Focus or blur this node.
			 * @param {EventData} ctx
			 * @param {boolean} [flag=true]
			 */
			nodeSetFocus: function(ctx, flag) {
				// ctx.node.debug("nodeSetFocus(" + flag + ")");
				var ctx2,
					tree = ctx.tree,
					node = ctx.node,
					opts = tree.options,
					// et = ctx.originalEvent && ctx.originalEvent.type,
					isInput = ctx.originalEvent
						? $(ctx.originalEvent.target).is(":input")
						: false;

				flag = flag !== false;

				// (node || tree).debug("nodeSetFocus(" + flag + "), event: " + et + ", isInput: "+ isInput);
				// Blur previous node if any
				if (tree.focusNode) {
					if (tree.focusNode === node && flag) {
						// node.debug("nodeSetFocus(" + flag + "): nothing to do");
						return;
					}
					ctx2 = $.extend({}, ctx, { node: tree.focusNode });
					tree.focusNode = null;
					this._triggerNodeEvent("blur", ctx2);
					this._callHook("nodeRenderStatus", ctx2);
				}
				// Set focus to container and node
				if (flag) {
					if (!this.hasFocus()) {
						node.debug("nodeSetFocus: forcing container focus");
						this._callHook("treeSetFocus", ctx, true, {
							calledByNode: true,
						});
					}
					node.makeVisible({ scrollIntoView: false });
					tree.focusNode = node;
					if (opts.titlesTabbable) {
						if (!isInput) {
							// #621
							$(node.span)
								.find(".fancytree-title")
								.focus();
						}
					}
					if (opts.aria) {
						// Set active descendant to node's span ID (create one, if needed)
						$(tree.$container).attr(
							"aria-activedescendant",
							$(node.tr || node.li)
								.uniqueId()
								.attr("id")
						);
						// "ftal_" + opts.idPrefix + node.key);
					}
					// $(node.span).find(".fancytree-title").focus();
					this._triggerNodeEvent("focus", ctx);

					// determine if we have focus on or inside tree container
					var hasFancytreeFocus =
						document.activeElement === tree.$container.get(0) ||
						$(document.activeElement, tree.$container).length >= 1;

					if (!hasFancytreeFocus) {
						// We cannot set KB focus to a node, so use the tree container
						// #563, #570: IE scrolls on every call to .focus(), if the container
						// is partially outside the viewport. So do it only, when absolutely
						// necessary.
						$(tree.$container).focus();
					}

					// if( opts.autoActivate ){
					// 	tree.nodeSetActive(ctx, true);
					// }
					if (opts.autoScroll) {
						node.scrollIntoView();
					}
					this._callHook("nodeRenderStatus", ctx);
				}
			},
			/** (De)Select node, return new status (sync).
			 *
			 * @param {EventData} ctx
			 * @param {boolean} [flag=true]
			 * @param {object} [opts] additional options. Defaults to {noEvents: false,
			 *     propagateDown: null, propagateUp: null,
			 *     callback: null,
			 *     }
			 * @returns {boolean} previous status
			 */
			nodeSetSelected: function(ctx, flag, callOpts) {
				callOpts = callOpts || {};
				var node = ctx.node,
					tree = ctx.tree,
					opts = ctx.options,
					noEvents = callOpts.noEvents === true,
					parent = node.parent;

				// flag defaults to true
				flag = flag !== false;

				// node.debug("nodeSetSelected(" + flag + ")", ctx);

				// Cannot (de)select unselectable nodes directly (only by propagation or
				// by setting the `.selected` property)
				if (FT.evalOption("unselectable", node, node, opts, false)) {
					return;
				}

				// Remember the user's intent, in case down -> up propagation prevents
				// applying it to node.selected
				node._lastSelectIntent = flag; // Confusing use of '!'

				// Nothing to do?
				if (!!node.selected === flag) {
					if (opts.selectMode === 3 && node.partsel && !flag) {
						// If propagation prevented selecting this node last time, we still
						// want to allow to apply setSelected(false) now
					} else {
						return flag;
					}
				}

				if (
					!noEvents &&
					this._triggerNodeEvent(
						"beforeSelect",
						node,
						ctx.originalEvent
					) === false
				) {
					return !!node.selected;
				}
				if (flag && opts.selectMode === 1) {
					// single selection mode (we don't uncheck all tree nodes, for performance reasons)
					if (tree.lastSelectedNode) {
						tree.lastSelectedNode.setSelected(false);
					}
					node.selected = flag;
				} else if (
					opts.selectMode === 3 &&
					parent &&
					!parent.radiogroup &&
					!node.radiogroup
				) {
					// multi-hierarchical selection mode
					node.selected = flag;
					node.fixSelection3AfterClick(callOpts);
				} else if (parent && parent.radiogroup) {
					node.visitSiblings(function(n) {
						n._changeSelectStatusAttrs(flag && n === node);
					}, true);
				} else {
					// default: selectMode: 2, multi selection mode
					node.selected = flag;
				}
				this.nodeRenderStatus(ctx);
				tree.lastSelectedNode = flag ? node : null;
				if (!noEvents) {
					tree._triggerNodeEvent("select", ctx);
				}
			},
			/** Show node status (ok, loading, error, nodata) using styles and a dummy child node.
			 *
			 * @param {EventData} ctx
			 * @param status
			 * @param message
			 * @param details
			 * @since 2.3
			 */
			nodeSetStatus: function(ctx, status, message, details) {
				var node = ctx.node,
					tree = ctx.tree;

				function _clearStatusNode() {
					// Remove dedicated dummy node, if any
					var firstChild = node.children ? node.children[0] : null;
					if (firstChild && firstChild.isStatusNode()) {
						try {
							// I've seen exceptions here with loadKeyPath...
							if (node.ul) {
								node.ul.removeChild(firstChild.li);
								firstChild.li = null; // avoid leaks (DT issue 215)
							}
						} catch (e) {}
						if (node.children.length === 1) {
							node.children = [];
						} else {
							node.children.shift();
						}
						tree._callHook(
							"treeStructureChanged",
							ctx,
							"clearStatusNode"
						);
					}
				}
				function _setStatusNode(data, type) {
					// Create/modify the dedicated dummy node for 'loading...' or
					// 'error!' status. (only called for direct child of the invisible
					// system root)
					var firstChild = node.children ? node.children[0] : null;
					if (firstChild && firstChild.isStatusNode()) {
						$.extend(firstChild, data);
						firstChild.statusNodeType = type;
						tree._callHook("nodeRenderTitle", firstChild);
					} else {
						node._setChildren([data]);
						tree._callHook(
							"treeStructureChanged",
							ctx,
							"setStatusNode"
						);
						node.children[0].statusNodeType = type;
						tree.render();
					}
					return node.children[0];
				}

				switch (status) {
					case "ok":
						_clearStatusNode();
						node._isLoading = false;
						node._error = null;
						node.renderStatus();
						break;
					case "loading":
						if (!node.parent) {
							_setStatusNode(
								{
									title:
										tree.options.strings.loading +
										(message ? " (" + message + ")" : ""),
									// icon: true,  // needed for 'loding' icon
									checkbox: false,
									tooltip: details,
								},
								status
							);
						}
						node._isLoading = true;
						node._error = null;
						node.renderStatus();
						break;
					case "error":
						_setStatusNode(
							{
								title:
									tree.options.strings.loadError +
									(message ? " (" + message + ")" : ""),
								// icon: false,
								checkbox: false,
								tooltip: details,
							},
							status
						);
						node._isLoading = false;
						node._error = { message: message, details: details };
						node.renderStatus();
						break;
					case "nodata":
						_setStatusNode(
							{
								title: message || tree.options.strings.noData,
								// icon: false,
								checkbox: false,
								tooltip: details,
							},
							status
						);
						node._isLoading = false;
						node._error = null;
						node.renderStatus();
						break;
					default:
						$.error("invalid node status " + status);
				}
			},
			/**
			 *
			 * @param {EventData} ctx
			 */
			nodeToggleExpanded: function(ctx) {
				return this.nodeSetExpanded(ctx, !ctx.node.expanded);
			},
			/**
			 * @param {EventData} ctx
			 */
			nodeToggleSelected: function(ctx) {
				var node = ctx.node,
					flag = !node.selected;

				// In selectMode: 3 this node may be unselected+partsel, even if
				// setSelected(true) was called before, due to `unselectable` children.
				// In this case, we now toggle as `setSelected(false)`
				if (
					node.partsel &&
					!node.selected &&
					node._lastSelectIntent === true
				) {
					flag = false;
					node.selected = true; // so it is not considered 'nothing to do'
				}
				node._lastSelectIntent = flag;
				return this.nodeSetSelected(ctx, flag);
			},
			/** Remove all nodes.
			 * @param {EventData} ctx
			 */
			treeClear: function(ctx) {
				var tree = ctx.tree;
				tree.activeNode = null;
				tree.focusNode = null;
				tree.$div.find(">ul.fancytree-container").empty();
				// TODO: call destructors and remove reference loops
				tree.rootNode.children = null;
				tree._callHook("treeStructureChanged", ctx, "clear");
			},
			/** Widget was created (called only once, even it re-initialized).
			 * @param {EventData} ctx
			 */
			treeCreate: function(ctx) {},
			/** Widget was destroyed.
			 * @param {EventData} ctx
			 */
			treeDestroy: function(ctx) {
				this.$div.find(">ul.fancytree-container").remove();
				if (this.$source) {
					this.$source.removeClass("fancytree-helper-hidden");
				}
			},
			/** Widget was (re-)initialized.
			 * @param {EventData} ctx
			 */
			treeInit: function(ctx) {
				var tree = ctx.tree,
					opts = tree.options;

				//this.debug("Fancytree.treeInit()");
				// Add container to the TAB chain
				// See http://www.w3.org/TR/wai-aria-practices/#focus_activedescendant
				// #577: Allow to set tabindex to "0", "-1" and ""
				tree.$container.attr("tabindex", opts.tabindex);

				// Copy some attributes to tree.data
				$.each(TREE_ATTRS, function(i, attr) {
					if (opts[attr] !== undefined) {
						tree.info("Move option " + attr + " to tree");
						tree[attr] = opts[attr];
						delete opts[attr];
					}
				});

				if (opts.checkboxAutoHide) {
					tree.$container.addClass("fancytree-checkbox-auto-hide");
				}
				if (opts.rtl) {
					tree.$container
						.attr("DIR", "RTL")
						.addClass("fancytree-rtl");
				} else {
					tree.$container
						.removeAttr("DIR")
						.removeClass("fancytree-rtl");
				}
				if (opts.aria) {
					tree.$container.attr("role", "tree");
					if (opts.selectMode !== 1) {
						tree.$container.attr("aria-multiselectable", true);
					}
				}
				this.treeLoad(ctx);
			},
			/** Parse Fancytree from source, as configured in the options.
			 * @param {EventData} ctx
			 * @param {object} [source] optional new source (use last data otherwise)
			 */
			treeLoad: function(ctx, source) {
				var metaData,
					type,
					$ul,
					tree = ctx.tree,
					$container = ctx.widget.element,
					dfd,
					// calling context for root node
					rootCtx = $.extend({}, ctx, { node: this.rootNode });

				if (tree.rootNode.children) {
					this.treeClear(ctx);
				}
				source = source || this.options.source;

				if (!source) {
					type = $container.data("type") || "html";
					switch (type) {
						case "html":
							$ul = $container.find(">ul").first();
							$ul.addClass(
								"ui-fancytree-source fancytree-helper-hidden"
							);
							source = $.ui.fancytree.parseHtml($ul);
							// allow to init tree.data.foo from <ul data-foo=''>
							this.data = $.extend(
								this.data,
								_getElementDataAsDict($ul)
							);
							break;
						case "json":
							source = $.parseJSON($container.text());
							// $container already contains the <ul>, but we remove the plain (json) text
							// $container.empty();
							$container
								.contents()
								.filter(function() {
									return this.nodeType === 3;
								})
								.remove();
							if ($.isPlainObject(source)) {
								// We got {foo: 'abc', children: [...]}
								_assert(
									$.isArray(source.children),
									"if an object is passed as source, it must contain a 'children' array (all other properties are added to 'tree.data')"
								);
								metaData = source;
								source = source.children;
								delete metaData.children;
								// Copy some attributes to tree.data
								$.each(TREE_ATTRS, function(i, attr) {
									if (metaData[attr] !== undefined) {
										tree[attr] = metaData[attr];
										delete metaData[attr];
									}
								});
								// Copy extra properties to tree.data.foo
								$.extend(tree.data, metaData);
							}
							break;
						default:
							$.error("Invalid data-type: " + type);
					}
				} else if (typeof source === "string") {
					// TODO: source is an element ID
					$.error("Not implemented");
				}

				// TODO: might be useful? Let's wait for a use case...
				// tree._triggerTreeEvent("beforeInitLoad", null);

				// Trigger fancytreeinit after nodes have been loaded
				dfd = this.nodeLoadChildren(rootCtx, source)
					.done(function() {
						tree._callHook(
							"treeStructureChanged",
							ctx,
							"loadChildren"
						);
						tree.render();
						if (ctx.options.selectMode === 3) {
							tree.rootNode.fixSelection3FromEndNodes();
						}
						if (tree.activeNode && tree.options.activeVisible) {
							tree.activeNode.makeVisible();
						}
						tree._triggerTreeEvent("init", null, { status: true });
					})
					.fail(function() {
						tree.render();
						tree._triggerTreeEvent("init", null, { status: false });
					});
				return dfd;
			},
			/** Node was inserted into or removed from the tree.
			 * @param {EventData} ctx
			 * @param {boolean} add
			 * @param {FancytreeNode} node
			 */
			treeRegisterNode: function(ctx, add, node) {
				ctx.tree._callHook(
					"treeStructureChanged",
					ctx,
					add ? "addNode" : "removeNode"
				);
			},
			/** Widget got focus.
			 * @param {EventData} ctx
			 * @param {boolean} [flag=true]
			 */
			treeSetFocus: function(ctx, flag, callOpts) {
				var targetNode;

				flag = flag !== false;

				// this.debug("treeSetFocus(" + flag + "), callOpts: ", callOpts, this.hasFocus());
				// this.debug("    focusNode: " + this.focusNode);
				// this.debug("    activeNode: " + this.activeNode);
				if (flag !== this.hasFocus()) {
					this._hasFocus = flag;
					if (!flag && this.focusNode) {
						// Node also looses focus if widget blurs
						this.focusNode.setFocus(false);
					} else if (flag && (!callOpts || !callOpts.calledByNode)) {
						$(this.$container).focus();
					}
					this.$container.toggleClass("fancytree-treefocus", flag);
					this._triggerTreeEvent(flag ? "focusTree" : "blurTree");
					if (flag && !this.activeNode) {
						// #712: Use last mousedowned node ('click' event fires after focusin)
						targetNode =
							this._lastMousedownNode || this.getFirstChild();
						if (targetNode) {
							targetNode.setFocus();
						}
					}
				}
			},
			/** Widget option was set using `$().fancytree("option", "KEY", VALUE)`.
			 *
			 * Note: `key` may reference a nested option, e.g. 'dnd5.scroll'.
			 * In this case `value`contains the complete, modified `dnd5` option hash.
			 * We can check for changed values like
			 *     if( value.scroll !== tree.options.dnd5.scroll ) {...}
			 *
			 * @param {EventData} ctx
			 * @param {string} key option name
			 * @param {any} value option value
			 */
			treeSetOption: function(ctx, key, value) {
				var tree = ctx.tree,
					callDefault = true,
					callCreate = false,
					callRender = false;

				switch (key) {
					case "aria":
					case "checkbox":
					case "icon":
					case "minExpandLevel":
					case "tabindex":
						// tree._callHook("treeCreate", tree);
						callCreate = true;
						callRender = true;
						break;
					case "checkboxAutoHide":
						tree.$container.toggleClass(
							"fancytree-checkbox-auto-hide",
							!!value
						);
						break;
					case "escapeTitles":
					case "tooltip":
						callRender = true;
						break;
					case "rtl":
						if (value === false) {
							tree.$container
								.removeAttr("DIR")
								.removeClass("fancytree-rtl");
						} else {
							tree.$container
								.attr("DIR", "RTL")
								.addClass("fancytree-rtl");
						}
						callRender = true;
						break;
					case "source":
						callDefault = false;
						tree._callHook("treeLoad", tree, value);
						callRender = true;
						break;
				}
				tree.debug(
					"set option " +
						key +
						"=" +
						value +
						" <" +
						typeof value +
						">"
				);
				if (callDefault) {
					if (this.widget._super) {
						// jQuery UI 1.9+
						this.widget._super.call(this.widget, key, value);
					} else {
						// jQuery UI <= 1.8, we have to manually invoke the _setOption method from the base widget
						$.Widget.prototype._setOption.call(
							this.widget,
							key,
							value
						);
					}
				}
				if (callCreate) {
					tree._callHook("treeCreate", tree);
				}
				if (callRender) {
					tree.render(true, false); // force, not-deep
				}
			},
			/** A Node was added, removed, moved, or it's visibility changed.
			 * @param {EventData} ctx
			 */
			treeStructureChanged: function(ctx, type) {},
		}
	);

	/*******************************************************************************
	 * jQuery UI widget boilerplate
	 */

	/**
	 * The plugin (derrived from <a href=" http://api.jqueryui.com/jQuery.widget/">jQuery.Widget</a>).<br>
	 * This constructor is not called directly. Use `$(selector).fancytree({})`
	 * to initialize the plugin instead.<br>
	 * <pre class="sh_javascript sunlight-highlight-javascript">// Access widget methods and members:
	 * var tree = $("#tree").fancytree("getTree");
	 * var node = $("#tree").fancytree("getActiveNode", "1234");
	 * </pre>
	 *
	 * @mixin Fancytree_Widget
	 */

	$.widget(
		"ui.fancytree",
		/** @lends Fancytree_Widget# */
		{
			/**These options will be used as defaults
			 * @type {FancytreeOptions}
			 */
			options: {
				activeVisible: true,
				ajax: {
					type: "GET",
					cache: false, // false: Append random '_' argument to the request url to prevent caching.
					// timeout: 0, // >0: Make sure we get an ajax error if server is unreachable
					dataType: "json", // Expect json format and pass json object to callbacks.
				},
				aria: true,
				autoActivate: true,
				autoCollapse: false,
				autoScroll: false,
				checkbox: false,
				clickFolderMode: 4,
				debugLevel: null, // 0..4 (null: use global setting $.ui.fancytree.debugLevel)
				disabled: false, // TODO: required anymore?
				enableAspx: true,
				escapeTitles: false,
				extensions: [],
				// fx: { height: "toggle", duration: 200 },
				// toggleEffect: { effect: "drop", options: {direction: "left"}, duration: 200 },
				// toggleEffect: { effect: "slide", options: {direction: "up"}, duration: 200 },
				//toggleEffect: { effect: "blind", options: {direction: "vertical", scale: "box"}, duration: 200 },
				toggleEffect: { effect: "slideToggle", duration: 200 }, //< "toggle" or "slideToggle" to use jQuery instead of jQueryUI for toggleEffect animation
				generateIds: false,
				icon: true,
				idPrefix: "ft_",
				focusOnSelect: false,
				keyboard: true,
				keyPathSeparator: "/",
				minExpandLevel: 1,
				nodata: true, // (bool, string, or callback) display message, when no data available
				quicksearch: false,
				rtl: false,
				scrollOfs: { top: 0, bottom: 0 },
				scrollParent: null,
				selectMode: 2,
				strings: {
					loading: "Loading...", // &#8230; would be escaped when escapeTitles is true
					loadError: "Load error!",
					moreData: "More...",
					noData: "No data.",
				},
				tabindex: "0",
				titlesTabbable: false,
				tooltip: false,
				treeId: null,
				_classNames: {
					node: "fancytree-node",
					folder: "fancytree-folder",
					animating: "fancytree-animating",
					combinedExpanderPrefix: "fancytree-exp-",
					combinedIconPrefix: "fancytree-ico-",
					hasChildren: "fancytree-has-children",
					active: "fancytree-active",
					selected: "fancytree-selected",
					expanded: "fancytree-expanded",
					lazy: "fancytree-lazy",
					focused: "fancytree-focused",
					partload: "fancytree-partload",
					partsel: "fancytree-partsel",
					radio: "fancytree-radio",
					// radiogroup: "fancytree-radiogroup",
					unselectable: "fancytree-unselectable",
					lastsib: "fancytree-lastsib",
					loading: "fancytree-loading",
					error: "fancytree-error",
					statusNodePrefix: "fancytree-statusnode-",
				},
				// events
				lazyLoad: null,
				postProcess: null,
			},
			/* Set up the widget, Called on first $().fancytree() */
			_create: function() {
				this.tree = new Fancytree(this);

				this.$source =
					this.source || this.element.data("type") === "json"
						? this.element
						: this.element.find(">ul").first();
				// Subclass Fancytree instance with all enabled extensions
				var extension,
					extName,
					i,
					opts = this.options,
					extensions = opts.extensions,
					base = this.tree;

				for (i = 0; i < extensions.length; i++) {
					extName = extensions[i];
					extension = $.ui.fancytree._extensions[extName];
					if (!extension) {
						$.error(
							"Could not apply extension '" +
								extName +
								"' (it is not registered, did you forget to include it?)"
						);
					}
					// Add extension options as tree.options.EXTENSION
					//			_assert(!this.tree.options[extName], "Extension name must not exist as option name: " + extName);

					// console.info("extend " + extName, extension.options, this.tree.options[extName])
					// issue #876: we want to replace custom array-options, not merge them
					this.tree.options[extName] = _simpleDeepMerge(
						{},
						extension.options,
						this.tree.options[extName]
					);
					// this.tree.options[extName] = $.extend(true, {}, extension.options, this.tree.options[extName]);

					// console.info("extend " + extName + " =>", this.tree.options[extName])
					// console.info("extend " + extName + " org default =>", extension.options)

					// Add a namespace tree.ext.EXTENSION, to hold instance data
					_assert(
						this.tree.ext[extName] === undefined,
						"Extension name must not exist as Fancytree.ext attribute: '" +
							extName +
							"'"
					);
					// this.tree[extName] = extension;
					this.tree.ext[extName] = {};
					// Subclass Fancytree methods using proxies.
					_subclassObject(this.tree, base, extension, extName);
					// current extension becomes base for the next extension
					base = extension;
				}
				//
				if (opts.icons !== undefined) {
					// 2015-11-16
					if (opts.icon === true) {
						this.tree.warn(
							"'icons' tree option is deprecated since v2.14.0: use 'icon' instead"
						);
						opts.icon = opts.icons;
					} else {
						$.error(
							"'icons' tree option is deprecated since v2.14.0: use 'icon' only instead"
						);
					}
				}
				if (opts.iconClass !== undefined) {
					// 2015-11-16
					if (opts.icon) {
						$.error(
							"'iconClass' tree option is deprecated since v2.14.0: use 'icon' only instead"
						);
					} else {
						this.tree.warn(
							"'iconClass' tree option is deprecated since v2.14.0: use 'icon' instead"
						);
						opts.icon = opts.iconClass;
					}
				}
				if (opts.tabbable !== undefined) {
					// 2016-04-04
					opts.tabindex = opts.tabbable ? "0" : "-1";
					this.tree.warn(
						"'tabbable' tree option is deprecated since v2.17.0: use 'tabindex='" +
							opts.tabindex +
							"' instead"
					);
				}
				//
				this.tree._callHook("treeCreate", this.tree);
				// Note: 'fancytreecreate' event is fired by widget base class
				//        this.tree._triggerTreeEvent("create");
			},

			/* Called on every $().fancytree() */
			_init: function() {
				this.tree._callHook("treeInit", this.tree);
				// TODO: currently we call bind after treeInit, because treeInit
				// might change tree.$container.
				// It would be better, to move event binding into hooks altogether
				this._bind();
			},

			/* Use the _setOption method to respond to changes to options. */
			_setOption: function(key, value) {
				return this.tree._callHook(
					"treeSetOption",
					this.tree,
					key,
					value
				);
			},

			/** Use the destroy method to clean up any modifications your widget has made to the DOM */
			destroy: function() {
				this._unbind();
				this.tree._callHook("treeDestroy", this.tree);
				// In jQuery UI 1.8, you must invoke the destroy method from the base widget
				$.Widget.prototype.destroy.call(this);
				// TODO: delete tree and nodes to make garbage collect easier?
				// TODO: In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
			},

			// -------------------------------------------------------------------------

			/* Remove all event handlers for our namespace */
			_unbind: function() {
				var ns = this.tree._ns;
				this.element.off(ns);
				this.tree.$container.off(ns);
				$(document).off(ns);
			},
			/* Add mouse and kyboard handlers to the container */
			_bind: function() {
				var self = this,
					opts = this.options,
					tree = this.tree,
					ns = tree._ns;
				// selstartEvent = ( $.support.selectstart ? "selectstart" : "mousedown" )

				// Remove all previuous handlers for this tree
				this._unbind();

				//alert("keydown" + ns + "foc=" + tree.hasFocus() + tree.$container);
				// tree.debug("bind events; container: ", tree.$container);
				tree.$container
					.on("focusin" + ns + " focusout" + ns, function(event) {
						var node = FT.getNode(event),
							flag = event.type === "focusin";

						if (!flag && node && $(event.target).is("a")) {
							// #764
							node.debug(
								"Ignored focusout on embedded <a> element."
							);
							return;
						}
						// tree.treeOnFocusInOut.call(tree, event);
						// tree.debug("Tree container got event " + event.type, node, event, FT.getEventTarget(event));
						if (flag) {
							if (tree._getExpiringValue("focusin")) {
								// #789: IE 11 may send duplicate focusin events
								tree.debug("Ignored double focusin.");
								return;
							}
							tree._setExpiringValue("focusin", true, 50);

							if (!node) {
								// #789: IE 11 may send focusin before mousdown(?)
								node = tree._getExpiringValue("mouseDownNode");
								if (node) {
									tree.debug(
										"Reconstruct mouse target for focusin from recent event."
									);
								}
							}
						}
						if (node) {
							// For example clicking into an <input> that is part of a node
							tree._callHook(
								"nodeSetFocus",
								tree._makeHookContext(node, event),
								flag
							);
						} else {
							if (
								tree.tbody &&
								$(event.target).parents(
									"table.fancytree-container > thead"
								).length
							) {
								// #767: ignore events in the table's header
								tree.debug(
									"Ignore focus event outside table body.",
									event
								);
							} else {
								tree._callHook("treeSetFocus", tree, flag);
							}
						}
					})
					.on("selectstart" + ns, "span.fancytree-title", function(
						event
					) {
						// prevent mouse-drags to select text ranges
						// tree.debug("<span title> got event " + event.type);
						event.preventDefault();
					})
					.on("keydown" + ns, function(event) {
						// TODO: also bind keyup and keypress
						// tree.debug("got event " + event.type + ", hasFocus:" + tree.hasFocus());
						// if(opts.disabled || opts.keyboard === false || !tree.hasFocus() ){
						if (opts.disabled || opts.keyboard === false) {
							return true;
						}
						var res,
							node = tree.focusNode, // node may be null
							ctx = tree._makeHookContext(node || tree, event),
							prevPhase = tree.phase;

						try {
							tree.phase = "userEvent";
							// If a 'fancytreekeydown' handler returns false, skip the default
							// handling (implemented by tree.nodeKeydown()).
							if (node) {
								res = tree._triggerNodeEvent(
									"keydown",
									node,
									event
								);
							} else {
								res = tree._triggerTreeEvent("keydown", event);
							}
							if (res === "preventNav") {
								res = true; // prevent keyboard navigation, but don't prevent default handling of embedded input controls
							} else if (res !== false) {
								res = tree._callHook("nodeKeydown", ctx);
							}
							return res;
						} finally {
							tree.phase = prevPhase;
						}
					})
					.on("mousedown" + ns, function(event) {
						var et = FT.getEventTarget(event);
						// self.tree.debug("event(" + event.type + "): node: ", et.node);
						// #712: Store the clicked node, so we can use it when we get a focusin event
						//       ('click' event fires after focusin)
						// tree.debug("event(" + event.type + "): node: ", et.node);
						tree._lastMousedownNode = et ? et.node : null;
						// #789: Store the node also for a short period, so we can use it
						// in a *resulting* focusin event
						tree._setExpiringValue(
							"mouseDownNode",
							tree._lastMousedownNode
						);
					})
					.on("click" + ns + " dblclick" + ns, function(event) {
						if (opts.disabled) {
							return true;
						}
						var ctx,
							et = FT.getEventTarget(event),
							node = et.node,
							tree = self.tree,
							prevPhase = tree.phase;

						// self.tree.debug("event(" + event.type + "): node: ", node);
						if (!node) {
							return true; // Allow bubbling of other events
						}
						ctx = tree._makeHookContext(node, event);
						// self.tree.debug("event(" + event.type + "): node: ", node);
						try {
							tree.phase = "userEvent";
							switch (event.type) {
								case "click":
									ctx.targetType = et.type;
									if (node.isPagingNode()) {
										return (
											tree._triggerNodeEvent(
												"clickPaging",
												ctx,
												event
											) === true
										);
									}
									return tree._triggerNodeEvent(
										"click",
										ctx,
										event
									) === false
										? false
										: tree._callHook("nodeClick", ctx);
								case "dblclick":
									ctx.targetType = et.type;
									return tree._triggerNodeEvent(
										"dblclick",
										ctx,
										event
									) === false
										? false
										: tree._callHook("nodeDblclick", ctx);
							}
						} finally {
							tree.phase = prevPhase;
						}
					});
			},
			/** Return the active node or null.
			 * @returns {FancytreeNode}
			 */
			getActiveNode: function() {
				return this.tree.activeNode;
			},
			/** Return the matching node or null.
			 * @param {string} key
			 * @returns {FancytreeNode}
			 */
			getNodeByKey: function(key) {
				return this.tree.getNodeByKey(key);
			},
			/** Return the invisible system root node.
			 * @returns {FancytreeNode}
			 */
			getRootNode: function() {
				return this.tree.rootNode;
			},
			/** Return the current tree instance.
			 * @returns {Fancytree}
			 */
			getTree: function() {
				return this.tree;
			},
		}
	);

	// $.ui.fancytree was created by the widget factory. Create a local shortcut:
	FT = $.ui.fancytree;

	/**
	 * Static members in the `$.ui.fancytree` namespace.<br>
	 * <br>
	 * <pre class="sh_javascript sunlight-highlight-javascript">// Access static members:
	 * var node = $.ui.fancytree.getNode(element);
	 * alert($.ui.fancytree.version);
	 * </pre>
	 *
	 * @mixin Fancytree_Static
	 */
	$.extend(
		$.ui.fancytree,
		/** @lends Fancytree_Static# */
		{
			/** @type {string} */
			version: "2.31.0", // Set to semver by 'grunt release'
			/** @type {string} */
			buildType: "production", // Set to 'production' by 'grunt build'
			/** @type {int} */
			debugLevel: 3, // Set to 3 by 'grunt build'
			// Used by $.ui.fancytree.debug() and as default for tree.options.debugLevel

			_nextId: 1,
			_nextNodeKey: 1,
			_extensions: {},
			// focusTree: null,

			/** Expose class object as $.ui.fancytree._FancytreeClass */
			_FancytreeClass: Fancytree,
			/** Expose class object as $.ui.fancytree._FancytreeNodeClass */
			_FancytreeNodeClass: FancytreeNode,
			/* Feature checks to provide backwards compatibility */
			jquerySupports: {
				// http://jqueryui.com/upgrade-guide/1.9/#deprecated-offset-option-merged-into-my-and-at
				positionMyOfs: isVersionAtLeast($.ui.version, 1, 9),
			},
			/** Throw an error if condition fails (debug method).
			 * @param {boolean} cond
			 * @param {string} msg
			 */
			assert: function(cond, msg) {
				return _assert(cond, msg);
			},
			/** Create a new Fancytree instance on a target element.
			 *
			 * @param {Element | jQueryObject | string} el Target DOM element or selector
			 * @param {FancytreeOptions} [opts] Fancytree options
			 * @returns {Fancytree} new tree instance
			 * @example
			 * var tree = $.ui.fancytree.createTree("#tree", {
			 *     source: {url: "my/webservice"}
			 * }); // Create tree for this matching element
			 *
			 * @since 2.25
			 */
			createTree: function(el, opts) {
				var tree = $(el)
					.fancytree(opts)
					.fancytree("getTree");
				return tree;
			},
			/** Return a function that executes *fn* at most every *timeout* ms.
			 * @param {integer} timeout
			 * @param {function} fn
			 * @param {boolean} [invokeAsap=false]
			 * @param {any} [ctx]
			 */
			debounce: function(timeout, fn, invokeAsap, ctx) {
				var timer;
				if (arguments.length === 3 && typeof invokeAsap !== "boolean") {
					ctx = invokeAsap;
					invokeAsap = false;
				}
				return function() {
					var args = arguments;
					ctx = ctx || this;
					// eslint-disable-next-line no-unused-expressions
					invokeAsap && !timer && fn.apply(ctx, args);
					clearTimeout(timer);
					timer = setTimeout(function() {
						// eslint-disable-next-line no-unused-expressions
						invokeAsap || fn.apply(ctx, args);
						timer = null;
					}, timeout);
				};
			},
			/** Write message to console if debugLevel >= 4
			 * @param {string} msg
			 */
			debug: function(msg) {
				if ($.ui.fancytree.debugLevel >= 4) {
					consoleApply("log", arguments);
				}
			},
			/** Write error message to console if debugLevel >= 1.
			 * @param {string} msg
			 */
			error: function(msg) {
				if ($.ui.fancytree.debugLevel >= 1) {
					consoleApply("error", arguments);
				}
			},
			/** Convert &lt;, &gt;, &amp;, &quot;, &#39;, &#x2F; to the equivalent entities.
			 *
			 * @param {string} s
			 * @returns {string}
			 */
			escapeHtml: function(s) {
				return ("" + s).replace(REX_HTML, function(s) {
					return ENTITY_MAP[s];
				});
			},
			/** Make jQuery.position() arguments backwards compatible, i.e. if
			 * jQuery UI version <= 1.8, convert
			 *   { my: "left+3 center", at: "left bottom", of: $target }
			 * to
			 *   { my: "left center", at: "left bottom", of: $target, offset: "3  0" }
			 *
			 * See http://jqueryui.com/upgrade-guide/1.9/#deprecated-offset-option-merged-into-my-and-at
			 * and http://jsfiddle.net/mar10/6xtu9a4e/
			 *
			 * @param {object} opts
			 * @returns {object} the (potentially modified) original opts hash object
			 */
			fixPositionOptions: function(opts) {
				if (opts.offset || ("" + opts.my + opts.at).indexOf("%") >= 0) {
					$.error(
						"expected new position syntax (but '%' is not supported)"
					);
				}
				if (!$.ui.fancytree.jquerySupports.positionMyOfs) {
					var // parse 'left+3 center' into ['left+3 center', 'left', '+3', 'center', undefined]
						myParts = /(\w+)([+-]?\d+)?\s+(\w+)([+-]?\d+)?/.exec(
							opts.my
						),
						atParts = /(\w+)([+-]?\d+)?\s+(\w+)([+-]?\d+)?/.exec(
							opts.at
						),
						// convert to numbers
						dx =
							(myParts[2] ? +myParts[2] : 0) +
							(atParts[2] ? +atParts[2] : 0),
						dy =
							(myParts[4] ? +myParts[4] : 0) +
							(atParts[4] ? +atParts[4] : 0);

					opts = $.extend({}, opts, {
						// make a copy and overwrite
						my: myParts[1] + " " + myParts[3],
						at: atParts[1] + " " + atParts[3],
					});
					if (dx || dy) {
						opts.offset = "" + dx + " " + dy;
					}
				}
				return opts;
			},
			/** Return a {node: FancytreeNode, type: TYPE} object for a mouse event.
			 *
			 * @param {Event} event Mouse event, e.g. click, ...
			 * @returns {object} Return a {node: FancytreeNode, type: TYPE} object
			 *     TYPE: 'title' | 'prefix' | 'expander' | 'checkbox' | 'icon' | undefined
			 */
			getEventTarget: function(event) {
				var $target,
					tree,
					tcn = event && event.target ? event.target.className : "",
					res = { node: this.getNode(event.target), type: undefined };
				// We use a fast version of $(res.node).hasClass()
				// See http://jsperf.com/test-for-classname/2
				if (/\bfancytree-title\b/.test(tcn)) {
					res.type = "title";
				} else if (/\bfancytree-expander\b/.test(tcn)) {
					res.type =
						res.node.hasChildren() === false
							? "prefix"
							: "expander";
					// }else if( /\bfancytree-checkbox\b/.test(tcn) || /\bfancytree-radio\b/.test(tcn) ){
				} else if (/\bfancytree-checkbox\b/.test(tcn)) {
					res.type = "checkbox";
				} else if (/\bfancytree(-custom)?-icon\b/.test(tcn)) {
					res.type = "icon";
				} else if (/\bfancytree-node\b/.test(tcn)) {
					// Somewhere near the title
					res.type = "title";
				} else if (event && event.target) {
					$target = $(event.target);
					if ($target.is("ul[role=group]")) {
						// #nnn: Clicking right to a node may hit the surrounding UL
						tree = res.node && res.node.tree;
						(tree || FT).debug("Ignoring click on outer UL.");
						res.node = null;
					} else if ($target.closest(".fancytree-title").length) {
						// #228: clicking an embedded element inside a title
						res.type = "title";
					} else if ($target.closest(".fancytree-checkbox").length) {
						// E.g. <svg> inside checkbox span
						res.type = "checkbox";
					} else if ($target.closest(".fancytree-expander").length) {
						res.type = "expander";
					}
				}
				return res;
			},
			/** Return a string describing the affected node region for a mouse event.
			 *
			 * @param {Event} event Mouse event, e.g. click, mousemove, ...
			 * @returns {string} 'title' | 'prefix' | 'expander' | 'checkbox' | 'icon' | undefined
			 */
			getEventTargetType: function(event) {
				return this.getEventTarget(event).type;
			},
			/** Return a FancytreeNode instance from element, event, or jQuery object.
			 *
			 * @param {Element | jQueryObject | Event} el
			 * @returns {FancytreeNode} matching node or null
			 */
			getNode: function(el) {
				if (el instanceof FancytreeNode) {
					return el; // el already was a FancytreeNode
				} else if (el instanceof $) {
					el = el[0]; // el was a jQuery object: use the DOM element
				} else if (el.originalEvent !== undefined) {
					el = el.target; // el was an Event
				}
				while (el) {
					if (el.ftnode) {
						return el.ftnode;
					}
					el = el.parentNode;
				}
				return null;
			},
			/** Return a Fancytree instance, from element, index, event, or jQueryObject.
			 *
			 * @param {Element | jQueryObject | Event | integer | string} [el]
			 * @returns {Fancytree} matching tree or null
			 * @example
			 * $.ui.fancytree.getTree();  // Get first Fancytree instance on page
			 * $.ui.fancytree.getTree(1);  // Get second Fancytree instance on page
			 * $.ui.fancytree.getTree(event);  // Get tree for this mouse- or keyboard event
			 * $.ui.fancytree.getTree("foo");  // Get tree for this `opts.treeId`
			 * $.ui.fancytree.getTree("#tree");  // Get tree for this matching element
			 *
			 * @since 2.13
			 */
			getTree: function(el) {
				var widget,
					orgEl = el;

				if (el instanceof Fancytree) {
					return el; // el already was a Fancytree
				}
				if (el === undefined) {
					el = 0; // get first tree
				}
				if (typeof el === "number") {
					el = $(".fancytree-container").eq(el); // el was an integer: return nth instance
				} else if (typeof el === "string") {
					// `el` may be a treeId or a selector:
					el = $("#ft-id-" + orgEl).eq(0);
					if (!el.length) {
						el = $(orgEl).eq(0); // el was a selector: use first match
					}
				} else if (el instanceof $) {
					el = el.eq(0); // el was a jQuery object: use the first DOM element
				} else if (el.originalEvent !== undefined) {
					el = $(el.target); // el was an Event
				}
				el = el.closest(":ui-fancytree");
				widget = el.data("ui-fancytree") || el.data("fancytree"); // the latter is required by jQuery <= 1.8
				return widget ? widget.tree : null;
			},
			/** Return an option value that has a default, but may be overridden by a
			 * callback or a node instance attribute.
			 *
			 * Evaluation sequence:<br>
			 *
			 * If tree.options.<optionName> is a callback that returns something, use that.<br>
			 * Else if node.<optionName> is defined, use that.<br>
			 * Else if tree.options.<optionName> is a value, use that.<br>
			 * Else use `defaultValue`.
			 *
			 * @param {string} optionName name of the option property (on node and tree)
			 * @param {FancytreeNode} node passed to the callback
			 * @param {object} nodeObject where to look for the local option property, e.g. `node` or `node.data`
			 * @param {object} treeOption where to look for the tree option, e.g. `tree.options` or `tree.options.dnd5`
			 * @param {any} [defaultValue]
			 * @returns {any}
			 *
			 * @example
			 * // Check for node.foo, tree,options.foo(), and tree.options.foo:
			 * $.ui.fancytree.evalOption("foo", node, node, tree.options);
			 * // Check for node.data.bar, tree,options.qux.bar(), and tree.options.qux.bar:
			 * $.ui.fancytree.evalOption("bar", node, node.data, tree.options.qux);
			 *
			 * @since 2.22
			 */
			evalOption: function(
				optionName,
				node,
				nodeObject,
				treeOptions,
				defaultValue
			) {
				var ctx,
					res,
					tree = node.tree,
					treeOpt = treeOptions[optionName],
					nodeOpt = nodeObject[optionName];

				if ($.isFunction(treeOpt)) {
					ctx = {
						node: node,
						tree: tree,
						widget: tree.widget,
						options: tree.widget.options,
						typeInfo: tree.types[node.type] || {},
					};
					res = treeOpt.call(tree, { type: optionName }, ctx);
					if (res == null) {
						res = nodeOpt;
					}
				} else {
					res = nodeOpt == null ? treeOpt : nodeOpt;
				}
				if (res == null) {
					res = defaultValue; // no option set at all: return default
				}
				return res;
			},
			/** Set expander, checkbox, or node icon, supporting string and object format.
			 *
			 * @param {Element | jQueryObject} span
			 * @param {string} baseClass
			 * @param {string | object} icon
			 * @since 2.27
			 */
			setSpanIcon: function(span, baseClass, icon) {
				var $span = $(span);

				if (typeof icon === "string") {
					$span.attr("class", baseClass + " " + icon);
				} else {
					// support object syntax: { text: ligature, addClasse: classname }
					if (icon.text) {
						$span.text("" + icon.text);
					} else if (icon.html) {
						span.innerHTML = icon.html;
					}
					$span.attr(
						"class",
						baseClass + " " + (icon.addClass || "")
					);
				}
			},
			/** Convert a keydown or mouse event to a canonical string like 'ctrl+a',
			 * 'ctrl+shift+f2', 'shift+leftdblclick'.
			 *
			 * This is especially handy for switch-statements in event handlers.
			 *
			 * @param {event}
			 * @returns {string}
			 *
			 * @example

			switch( $.ui.fancytree.eventToString(event) ) {
				case "-":
					tree.nodeSetExpanded(ctx, false);
					break;
				case "shift+return":
					tree.nodeSetActive(ctx, true);
					break;
				case "down":
					res = node.navigate(event.which, activate);
					break;
				default:
					handled = false;
			}
			if( handled ){
				event.preventDefault();
			}
			*/
			eventToString: function(event) {
				// Poor-man's hotkeys. See here for a complete implementation:
				//   https://github.com/jeresig/jquery.hotkeys
				var which = event.which,
					et = event.type,
					s = [];

				if (event.altKey) {
					s.push("alt");
				}
				if (event.ctrlKey) {
					s.push("ctrl");
				}
				if (event.metaKey) {
					s.push("meta");
				}
				if (event.shiftKey) {
					s.push("shift");
				}

				if (et === "click" || et === "dblclick") {
					s.push(MOUSE_BUTTONS[event.button] + et);
				} else if (et === "wheel") {
					s.push(et);
				} else if (!IGNORE_KEYCODES[which]) {
					s.push(
						SPECIAL_KEYCODES[which] ||
							String.fromCharCode(which).toLowerCase()
					);
				}
				return s.join("+");
			},
			/** Write message to console if debugLevel >= 3
			 * @param {string} msg
			 */
			info: function(msg) {
				if ($.ui.fancytree.debugLevel >= 3) {
					consoleApply("info", arguments);
				}
			},
			/* @deprecated: use eventToString(event) instead.
			 */
			keyEventToString: function(event) {
				this.warn(
					"keyEventToString() is deprecated: use eventToString()"
				);
				return this.eventToString(event);
			},
			/** Return a wrapped handler method, that provides `this._super`.
			 *
			 * @example
				// Implement `opts.createNode` event to add the 'draggable' attribute
				$.ui.fancytree.overrideMethod(ctx.options, "createNode", function(event, data) {
					// Default processing if any
					this._super.apply(this, arguments);
					// Add 'draggable' attribute
					data.node.span.draggable = true;
				});
			 *
			 * @param {object} instance
			 * @param {string} methodName
			 * @param {function} handler
			 * @param {object} [context] optional context
			 */
			overrideMethod: function(instance, methodName, handler, context) {
				var prevSuper,
					_super = instance[methodName] || $.noop;

				instance[methodName] = function() {
					var self = context || this;

					try {
						prevSuper = self._super;
						self._super = _super;
						return handler.apply(self, arguments);
					} finally {
						self._super = prevSuper;
					}
				};
			},
			/**
			 * Parse tree data from HTML <ul> markup
			 *
			 * @param {jQueryObject} $ul
			 * @returns {NodeData[]}
			 */
			parseHtml: function($ul) {
				var classes,
					className,
					extraClasses,
					i,
					iPos,
					l,
					tmp,
					tmp2,
					$children = $ul.find(">li"),
					children = [];

				$children.each(function() {
					var allData,
						lowerCaseAttr,
						$li = $(this),
						$liSpan = $li.find(">span", this).first(),
						$liA = $liSpan.length ? null : $li.find(">a").first(),
						d = { tooltip: null, data: {} };

					if ($liSpan.length) {
						d.title = $liSpan.html();
					} else if ($liA && $liA.length) {
						// If a <li><a> tag is specified, use it literally and extract href/target.
						d.title = $liA.html();
						d.data.href = $liA.attr("href");
						d.data.target = $liA.attr("target");
						d.tooltip = $liA.attr("title");
					} else {
						// If only a <li> tag is specified, use the trimmed string up to
						// the next child <ul> tag.
						d.title = $li.html();
						iPos = d.title.search(/<ul/i);
						if (iPos >= 0) {
							d.title = d.title.substring(0, iPos);
						}
					}
					d.title = $.trim(d.title);

					// Make sure all fields exist
					for (i = 0, l = CLASS_ATTRS.length; i < l; i++) {
						d[CLASS_ATTRS[i]] = undefined;
					}
					// Initialize to `true`, if class is set and collect extraClasses
					classes = this.className.split(" ");
					extraClasses = [];
					for (i = 0, l = classes.length; i < l; i++) {
						className = classes[i];
						if (CLASS_ATTR_MAP[className]) {
							d[className] = true;
						} else {
							extraClasses.push(className);
						}
					}
					d.extraClasses = extraClasses.join(" ");

					// Parse node options from ID, title and class attributes
					tmp = $li.attr("title");
					if (tmp) {
						d.tooltip = tmp; // overrides <a title='...'>
					}
					tmp = $li.attr("id");
					if (tmp) {
						d.key = tmp;
					}
					// Translate hideCheckbox -> checkbox:false
					if ($li.attr("hideCheckbox")) {
						d.checkbox = false;
					}
					// Add <li data-NAME='...'> as node.data.NAME
					allData = _getElementDataAsDict($li);
					if (allData && !$.isEmptyObject(allData)) {
						// #507: convert data-hidecheckbox (lower case) to hideCheckbox
						for (lowerCaseAttr in NODE_ATTR_LOWERCASE_MAP) {
							if (allData.hasOwnProperty(lowerCaseAttr)) {
								allData[
									NODE_ATTR_LOWERCASE_MAP[lowerCaseAttr]
								] = allData[lowerCaseAttr];
								delete allData[lowerCaseAttr];
							}
						}
						// #56: Allow to set special node.attributes from data-...
						for (i = 0, l = NODE_ATTRS.length; i < l; i++) {
							tmp = NODE_ATTRS[i];
							tmp2 = allData[tmp];
							if (tmp2 != null) {
								delete allData[tmp];
								d[tmp] = tmp2;
							}
						}
						// All other data-... goes to node.data...
						$.extend(d.data, allData);
					}
					// Recursive reading of child nodes, if LI tag contains an UL tag
					$ul = $li.find(">ul").first();
					if ($ul.length) {
						d.children = $.ui.fancytree.parseHtml($ul);
					} else {
						d.children = d.lazy ? undefined : null;
					}
					children.push(d);
					// FT.debug("parse ", d, children);
				});
				return children;
			},
			/** Add Fancytree extension definition to the list of globally available extensions.
			 *
			 * @param {object} definition
			 */
			registerExtension: function(definition) {
				_assert(
					definition.name != null,
					"extensions must have a `name` property."
				);
				_assert(
					definition.version != null,
					"extensions must have a `version` property."
				);
				$.ui.fancytree._extensions[definition.name] = definition;
			},
			/** Inverse of escapeHtml().
			 *
			 * @param {string} s
			 * @returns {string}
			 */
			unescapeHtml: function(s) {
				var e = document.createElement("div");
				e.innerHTML = s;
				return e.childNodes.length === 0
					? ""
					: e.childNodes[0].nodeValue;
			},
			/** Write warning message to console if debugLevel >= 2.
			 * @param {string} msg
			 */
			warn: function(msg) {
				if ($.ui.fancytree.debugLevel >= 2) {
					consoleApply("warn", arguments);
				}
			},
		}
	);

	// Value returned by `require('jquery.fancytree')`
	return $.ui.fancytree;
}); // End of closure

/*!
 * jquery.fancytree.dnd.js
 *
 * Drag-and-drop support (jQuery UI draggable/droppable).
 * (Extension module for jquery.fancytree.js: https://github.com/mar10/fancytree/)
 *
 * Copyright (c) 2008-2019, Martin Wendt (https://wwWendt.de)
 *
 * Released under the MIT license
 * https://github.com/mar10/fancytree/wiki/LicenseInfo
 *
 * @version 2.31.0
 * @date 2019-05-31T11:32:38Z
 */

(function(factory) {
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"jquery-ui/ui/widgets/draggable",
			"jquery-ui/ui/widgets/droppable",
			"./jquery.fancytree",
		], factory);
	} else if (typeof module === "object" && module.exports) {
		// Node/CommonJS
		require("./jquery.fancytree");
		module.exports = factory(require("jquery"));
	} else {
		// Browser globals
		factory(jQuery);
	}
})(function($) {
	"use strict";

	/******************************************************************************
	 * Private functions and variables
	 */
	var didRegisterDnd = false,
		classDropAccept = "fancytree-drop-accept",
		classDropAfter = "fancytree-drop-after",
		classDropBefore = "fancytree-drop-before",
		classDropOver = "fancytree-drop-over",
		classDropReject = "fancytree-drop-reject",
		classDropTarget = "fancytree-drop-target";

	/* Convert number to string and prepend +/-; return empty string for 0.*/
	function offsetString(n) {
		// eslint-disable-next-line no-nested-ternary
		return n === 0 ? "" : n > 0 ? "+" + n : "" + n;
	}

	//--- Extend ui.draggable event handling --------------------------------------

	function _registerDnd() {
		if (didRegisterDnd) {
			return;
		}

		// Register proxy-functions for draggable.start/drag/stop

		$.ui.plugin.add("draggable", "connectToFancytree", {
			start: function(event, ui) {
				// 'draggable' was renamed to 'ui-draggable' since jQueryUI 1.10
				var draggable =
						$(this).data("ui-draggable") ||
						$(this).data("draggable"),
					sourceNode = ui.helper.data("ftSourceNode") || null;

				if (sourceNode) {
					// Adjust helper offset, so cursor is slightly outside top/left corner
					draggable.offset.click.top = -2;
					draggable.offset.click.left = +16;
					// Trigger dragStart event
					// TODO: when called as connectTo..., the return value is ignored(?)
					return sourceNode.tree.ext.dnd._onDragEvent(
						"start",
						sourceNode,
						null,
						event,
						ui,
						draggable
					);
				}
			},
			drag: function(event, ui) {
				var ctx,
					isHelper,
					logObject,
					// 'draggable' was renamed to 'ui-draggable' since jQueryUI 1.10
					draggable =
						$(this).data("ui-draggable") ||
						$(this).data("draggable"),
					sourceNode = ui.helper.data("ftSourceNode") || null,
					prevTargetNode = ui.helper.data("ftTargetNode") || null,
					targetNode = $.ui.fancytree.getNode(event.target),
					dndOpts = sourceNode && sourceNode.tree.options.dnd;

				// logObject = sourceNode || prevTargetNode || $.ui.fancytree;
				// logObject.debug("Drag event:", event, event.shiftKey);
				if (event.target && !targetNode) {
					// We got a drag event, but the targetNode could not be found
					// at the event location. This may happen,
					// 1. if the mouse jumped over the drag helper,
					// 2. or if a non-fancytree element is dragged
					// We ignore it:
					isHelper =
						$(event.target).closest(
							"div.fancytree-drag-helper,#fancytree-drop-marker"
						).length > 0;
					if (isHelper) {
						logObject =
							sourceNode || prevTargetNode || $.ui.fancytree;
						logObject.debug("Drag event over helper: ignored.");
						return;
					}
				}
				ui.helper.data("ftTargetNode", targetNode);

				if (dndOpts && dndOpts.updateHelper) {
					ctx = sourceNode.tree._makeHookContext(sourceNode, event, {
						otherNode: targetNode,
						ui: ui,
						draggable: draggable,
						dropMarker: $("#fancytree-drop-marker"),
					});
					dndOpts.updateHelper.call(sourceNode.tree, sourceNode, ctx);
				}

				// Leaving a tree node
				if (prevTargetNode && prevTargetNode !== targetNode) {
					prevTargetNode.tree.ext.dnd._onDragEvent(
						"leave",
						prevTargetNode,
						sourceNode,
						event,
						ui,
						draggable
					);
				}
				if (targetNode) {
					if (!targetNode.tree.options.dnd.dragDrop) {
						// not enabled as drop target
					} else if (targetNode === prevTargetNode) {
						// Moving over same node
						targetNode.tree.ext.dnd._onDragEvent(
							"over",
							targetNode,
							sourceNode,
							event,
							ui,
							draggable
						);
					} else {
						// Entering this node first time
						targetNode.tree.ext.dnd._onDragEvent(
							"enter",
							targetNode,
							sourceNode,
							event,
							ui,
							draggable
						);
						targetNode.tree.ext.dnd._onDragEvent(
							"over",
							targetNode,
							sourceNode,
							event,
							ui,
							draggable
						);
					}
				}
				// else go ahead with standard event handling
			},
			stop: function(event, ui) {
				var logObject,
					// 'draggable' was renamed to 'ui-draggable' since jQueryUI 1.10:
					draggable =
						$(this).data("ui-draggable") ||
						$(this).data("draggable"),
					sourceNode = ui.helper.data("ftSourceNode") || null,
					targetNode = ui.helper.data("ftTargetNode") || null,
					dropped = event.type === "mouseup" && event.which === 1;

				if (!dropped) {
					logObject = sourceNode || targetNode || $.ui.fancytree;
					logObject.debug("Drag was cancelled");
				}
				if (targetNode) {
					if (dropped) {
						targetNode.tree.ext.dnd._onDragEvent(
							"drop",
							targetNode,
							sourceNode,
							event,
							ui,
							draggable
						);
					}
					targetNode.tree.ext.dnd._onDragEvent(
						"leave",
						targetNode,
						sourceNode,
						event,
						ui,
						draggable
					);
				}
				if (sourceNode) {
					sourceNode.tree.ext.dnd._onDragEvent(
						"stop",
						sourceNode,
						null,
						event,
						ui,
						draggable
					);
				}
			},
		});

		didRegisterDnd = true;
	}

	/******************************************************************************
	 * Drag and drop support
	 */
	function _initDragAndDrop(tree) {
		var dnd = tree.options.dnd || null,
			glyph = tree.options.glyph || null;

		// Register 'connectToFancytree' option with ui.draggable
		if (dnd) {
			_registerDnd();
		}
		// Attach ui.draggable to this Fancytree instance
		if (dnd && dnd.dragStart) {
			tree.widget.element.draggable(
				$.extend(
					{
						addClasses: false,
						// DT issue 244: helper should be child of scrollParent:
						appendTo: tree.$container,
						//			appendTo: "body",
						containment: false,
						//			containment: "parent",
						delay: 0,
						distance: 4,
						revert: false,
						scroll: true, // to disable, also set css 'position: inherit' on ul.fancytree-container
						scrollSpeed: 7,
						scrollSensitivity: 10,
						// Delegate draggable.start, drag, and stop events to our handler
						connectToFancytree: true,
						// Let source tree create the helper element
						helper: function(event) {
							var $helper,
								$nodeTag,
								opts,
								sourceNode = $.ui.fancytree.getNode(
									event.target
								);

							if (!sourceNode) {
								// #405, DT issue 211: might happen, if dragging a table *header*
								return "<div>ERROR?: helper requested but sourceNode not found</div>";
							}
							opts = sourceNode.tree.options.dnd;
							$nodeTag = $(sourceNode.span);
							// Only event and node argument is available
							$helper = $(
								"<div class='fancytree-drag-helper'><span class='fancytree-drag-helper-img' /></div>"
							)
								.css({ zIndex: 3, position: "relative" }) // so it appears above ext-wide selection bar
								.append(
									$nodeTag
										.find("span.fancytree-title")
										.clone()
								);

							// Attach node reference to helper object
							$helper.data("ftSourceNode", sourceNode);

							// Support glyph symbols instead of icons
							if (glyph) {
								$helper
									.find(".fancytree-drag-helper-img")
									.addClass(
										glyph.map._addClass +
											" " +
											glyph.map.dragHelper
									);
							}
							// Allow to modify the helper, e.g. to add multi-node-drag feedback
							if (opts.initHelper) {
								opts.initHelper.call(
									sourceNode.tree,
									sourceNode,
									{
										node: sourceNode,
										tree: sourceNode.tree,
										originalEvent: event,
										ui: { helper: $helper },
									}
								);
							}
							// We return an unconnected element, so `draggable` will add this
							// to the parent specified as `appendTo` option
							return $helper;
						},
						start: function(event, ui) {
							var sourceNode = ui.helper.data("ftSourceNode");
							return !!sourceNode; // Abort dragging if no node could be found
						},
					},
					tree.options.dnd.draggable
				)
			);
		}
		// Attach ui.droppable to this Fancytree instance
		if (dnd && dnd.dragDrop) {
			tree.widget.element.droppable(
				$.extend(
					{
						addClasses: false,
						tolerance: "intersect",
						greedy: false,
						/*
			activate: function(event, ui) {
				tree.debug("droppable - activate", event, ui, this);
			},
			create: function(event, ui) {
				tree.debug("droppable - create", event, ui);
			},
			deactivate: function(event, ui) {
				tree.debug("droppable - deactivate", event, ui);
			},
			drop: function(event, ui) {
				tree.debug("droppable - drop", event, ui);
			},
			out: function(event, ui) {
				tree.debug("droppable - out", event, ui);
			},
			over: function(event, ui) {
				tree.debug("droppable - over", event, ui);
			}
*/
					},
					tree.options.dnd.droppable
				)
			);
		}
	}

	/******************************************************************************
	 *
	 */

	$.ui.fancytree.registerExtension({
		name: "dnd",
		version: "2.31.0",
		// Default options for this extension.
		options: {
			// Make tree nodes accept draggables
			autoExpandMS: 1000, // Expand nodes after n milliseconds of hovering.
			draggable: null, // Additional options passed to jQuery draggable
			droppable: null, // Additional options passed to jQuery droppable
			focusOnClick: false, // Focus, although draggable cancels mousedown event (#270)
			preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
			preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
			smartRevert: true, // set draggable.revert = true if drop was rejected
			dropMarkerOffsetX: -24, // absolute position offset for .fancytree-drop-marker relatively to ..fancytree-title (icon/img near a node accepting drop)
			dropMarkerInsertOffsetX: -16, // additional offset for drop-marker with hitMode = "before"/"after"
			// Events (drag support)
			dragStart: null, // Callback(sourceNode, data), return true, to enable dnd
			dragStop: null, // Callback(sourceNode, data)
			initHelper: null, // Callback(sourceNode, data)
			updateHelper: null, // Callback(sourceNode, data)
			// Events (drop support)
			dragEnter: null, // Callback(targetNode, data)
			dragOver: null, // Callback(targetNode, data)
			dragExpand: null, // Callback(targetNode, data), return false to prevent autoExpand
			dragDrop: null, // Callback(targetNode, data)
			dragLeave: null, // Callback(targetNode, data)
		},

		treeInit: function(ctx) {
			var tree = ctx.tree;
			this._superApply(arguments);
			// issue #270: draggable eats mousedown events
			if (tree.options.dnd.dragStart) {
				tree.$container.on("mousedown", function(event) {
					//				if( !tree.hasFocus() && ctx.options.dnd.focusOnClick ) {
					if (ctx.options.dnd.focusOnClick) {
						// #270
						var node = $.ui.fancytree.getNode(event);
						if (node) {
							node.debug(
								"Re-enable focus that was prevented by jQuery UI draggable."
							);
							// node.setFocus();
							// $(node.span).closest(":tabbable").focus();
							// $(event.target).trigger("focus");
							// $(event.target).closest(":tabbable").trigger("focus");
						}
						setTimeout(function() {
							// #300
							$(event.target)
								.closest(":tabbable")
								.focus();
						}, 10);
					}
				});
			}
			_initDragAndDrop(tree);
		},
		/* Display drop marker according to hitMode ('after', 'before', 'over'). */
		_setDndStatus: function(
			sourceNode,
			targetNode,
			helper,
			hitMode,
			accept
		) {
			var markerOffsetX,
				pos,
				markerAt = "center",
				instData = this._local,
				dndOpt = this.options.dnd,
				glyphOpt = this.options.glyph,
				$source = sourceNode ? $(sourceNode.span) : null,
				$target = $(targetNode.span),
				$targetTitle = $target.find("span.fancytree-title");

			if (!instData.$dropMarker) {
				instData.$dropMarker = $(
					"<div id='fancytree-drop-marker'></div>"
				)
					.hide()
					.css({ "z-index": 1000 })
					.prependTo($(this.$div).parent());
				//                .prependTo("body");

				if (glyphOpt) {
					instData.$dropMarker.addClass(
						glyphOpt.map._addClass + " " + glyphOpt.map.dropMarker
					);
				}
			}
			if (
				hitMode === "after" ||
				hitMode === "before" ||
				hitMode === "over"
			) {
				markerOffsetX = dndOpt.dropMarkerOffsetX || 0;
				switch (hitMode) {
					case "before":
						markerAt = "top";
						markerOffsetX += dndOpt.dropMarkerInsertOffsetX || 0;
						break;
					case "after":
						markerAt = "bottom";
						markerOffsetX += dndOpt.dropMarkerInsertOffsetX || 0;
						break;
				}

				pos = {
					my: "left" + offsetString(markerOffsetX) + " center",
					at: "left " + markerAt,
					of: $targetTitle,
				};
				if (this.options.rtl) {
					pos.my = "right" + offsetString(-markerOffsetX) + " center";
					pos.at = "right " + markerAt;
				}
				instData.$dropMarker
					.toggleClass(classDropAfter, hitMode === "after")
					.toggleClass(classDropOver, hitMode === "over")
					.toggleClass(classDropBefore, hitMode === "before")
					.toggleClass("fancytree-rtl", !!this.options.rtl)
					.show()
					.position($.ui.fancytree.fixPositionOptions(pos));
			} else {
				instData.$dropMarker.hide();
			}
			if ($source) {
				$source
					.toggleClass(classDropAccept, accept === true)
					.toggleClass(classDropReject, accept === false);
			}
			$target
				.toggleClass(
					classDropTarget,
					hitMode === "after" ||
						hitMode === "before" ||
						hitMode === "over"
				)
				.toggleClass(classDropAfter, hitMode === "after")
				.toggleClass(classDropBefore, hitMode === "before")
				.toggleClass(classDropAccept, accept === true)
				.toggleClass(classDropReject, accept === false);

			helper
				.toggleClass(classDropAccept, accept === true)
				.toggleClass(classDropReject, accept === false);
		},

		/*
		 * Handles drag'n'drop functionality.
		 *
		 * A standard jQuery drag-and-drop process may generate these calls:
		 *
		 * start:
		 *     _onDragEvent("start", sourceNode, null, event, ui, draggable);
		 * drag:
		 *     _onDragEvent("leave", prevTargetNode, sourceNode, event, ui, draggable);
		 *     _onDragEvent("over", targetNode, sourceNode, event, ui, draggable);
		 *     _onDragEvent("enter", targetNode, sourceNode, event, ui, draggable);
		 * stop:
		 *     _onDragEvent("drop", targetNode, sourceNode, event, ui, draggable);
		 *     _onDragEvent("leave", targetNode, sourceNode, event, ui, draggable);
		 *     _onDragEvent("stop", sourceNode, null, event, ui, draggable);
		 */
		_onDragEvent: function(
			eventName,
			node,
			otherNode,
			event,
			ui,
			draggable
		) {
			// if(eventName !== "over"){
			// 	this.debug("tree.ext.dnd._onDragEvent(%s, %o, %o) - %o", eventName, node, otherNode, this);
			// }
			var accept,
				nodeOfs,
				parentRect,
				rect,
				relPos,
				relPos2,
				enterResponse,
				hitMode,
				r,
				opts = this.options,
				dnd = opts.dnd,
				ctx = this._makeHookContext(node, event, {
					otherNode: otherNode,
					ui: ui,
					draggable: draggable,
				}),
				res = null,
				self = this,
				$nodeTag = $(node.span);

			if (dnd.smartRevert) {
				draggable.options.revert = "invalid";
			}

			switch (eventName) {
				case "start":
					if (node.isStatusNode()) {
						res = false;
					} else if (dnd.dragStart) {
						res = dnd.dragStart(node, ctx);
					}
					if (res === false) {
						this.debug("tree.dragStart() cancelled");
						//draggable._clear();
						// NOTE: the return value seems to be ignored (drag is not cancelled, when false is returned)
						// TODO: call this._cancelDrag()?
						ui.helper.trigger("mouseup").hide();
					} else {
						if (dnd.smartRevert) {
							// #567, #593: fix revert position
							// rect = node.li.getBoundingClientRect();
							rect = node[
								ctx.tree.nodeContainerAttrName
							].getBoundingClientRect();
							parentRect = $(
								draggable.options.appendTo
							)[0].getBoundingClientRect();
							draggable.originalPosition.left = Math.max(
								0,
								rect.left - parentRect.left
							);
							draggable.originalPosition.top = Math.max(
								0,
								rect.top - parentRect.top
							);
						}
						$nodeTag.addClass("fancytree-drag-source");
						// Register global handlers to allow cancel
						$(document).on(
							"keydown.fancytree-dnd,mousedown.fancytree-dnd",
							function(event) {
								// node.tree.debug("dnd global event", event.type, event.which);
								if (
									event.type === "keydown" &&
									event.which === $.ui.keyCode.ESCAPE
								) {
									self.ext.dnd._cancelDrag();
								} else if (event.type === "mousedown") {
									self.ext.dnd._cancelDrag();
								}
							}
						);
					}
					break;

				case "enter":
					if (
						dnd.preventRecursiveMoves &&
						node.isDescendantOf(otherNode)
					) {
						r = false;
					} else {
						r = dnd.dragEnter ? dnd.dragEnter(node, ctx) : null;
					}
					if (!r) {
						// convert null, undefined, false to false
						res = false;
					} else if ($.isArray(r)) {
						// TODO: also accept passing an object of this format directly
						res = {
							over: $.inArray("over", r) >= 0,
							before: $.inArray("before", r) >= 0,
							after: $.inArray("after", r) >= 0,
						};
					} else {
						res = {
							over: r === true || r === "over",
							before: r === true || r === "before",
							after: r === true || r === "after",
						};
					}
					ui.helper.data("enterResponse", res);
					// this.debug("helper.enterResponse: %o", res);
					break;

				case "over":
					enterResponse = ui.helper.data("enterResponse");
					hitMode = null;
					if (enterResponse === false) {
						// Don't call dragOver if onEnter returned false.
						//                break;
					} else if (typeof enterResponse === "string") {
						// Use hitMode from onEnter if provided.
						hitMode = enterResponse;
					} else {
						// Calculate hitMode from relative cursor position.
						nodeOfs = $nodeTag.offset();
						relPos = {
							x: event.pageX - nodeOfs.left,
							y: event.pageY - nodeOfs.top,
						};
						relPos2 = {
							x: relPos.x / $nodeTag.width(),
							y: relPos.y / $nodeTag.height(),
						};

						if (enterResponse.after && relPos2.y > 0.75) {
							hitMode = "after";
						} else if (
							!enterResponse.over &&
							enterResponse.after &&
							relPos2.y > 0.5
						) {
							hitMode = "after";
						} else if (enterResponse.before && relPos2.y <= 0.25) {
							hitMode = "before";
						} else if (
							!enterResponse.over &&
							enterResponse.before &&
							relPos2.y <= 0.5
						) {
							hitMode = "before";
						} else if (enterResponse.over) {
							hitMode = "over";
						}
						// Prevent no-ops like 'before source node'
						// TODO: these are no-ops when moving nodes, but not in copy mode
						if (dnd.preventVoidMoves) {
							if (node === otherNode) {
								this.debug(
									"    drop over source node prevented"
								);
								hitMode = null;
							} else if (
								hitMode === "before" &&
								otherNode &&
								node === otherNode.getNextSibling()
							) {
								this.debug(
									"    drop after source node prevented"
								);
								hitMode = null;
							} else if (
								hitMode === "after" &&
								otherNode &&
								node === otherNode.getPrevSibling()
							) {
								this.debug(
									"    drop before source node prevented"
								);
								hitMode = null;
							} else if (
								hitMode === "over" &&
								otherNode &&
								otherNode.parent === node &&
								otherNode.isLastSibling()
							) {
								this.debug(
									"    drop last child over own parent prevented"
								);
								hitMode = null;
							}
						}
						//                this.debug("hitMode: %s - %s - %s", hitMode, (node.parent === otherNode), node.isLastSibling());
						ui.helper.data("hitMode", hitMode);
					}
					// Auto-expand node (only when 'over' the node, not 'before', or 'after')
					if (
						hitMode !== "before" &&
						hitMode !== "after" &&
						dnd.autoExpandMS &&
						node.hasChildren() !== false &&
						!node.expanded &&
						(!dnd.dragExpand || dnd.dragExpand(node, ctx) !== false)
					) {
						node.scheduleAction("expand", dnd.autoExpandMS);
					}
					if (hitMode && dnd.dragOver) {
						// TODO: http://code.google.com/p/dynatree/source/detail?r=625
						ctx.hitMode = hitMode;
						res = dnd.dragOver(node, ctx);
					}
					accept = res !== false && hitMode !== null;
					if (dnd.smartRevert) {
						draggable.options.revert = !accept;
					}
					this._local._setDndStatus(
						otherNode,
						node,
						ui.helper,
						hitMode,
						accept
					);
					break;

				case "drop":
					hitMode = ui.helper.data("hitMode");
					if (hitMode && dnd.dragDrop) {
						ctx.hitMode = hitMode;
						dnd.dragDrop(node, ctx);
					}
					break;

				case "leave":
					// Cancel pending expand request
					node.scheduleAction("cancel");
					ui.helper.data("enterResponse", null);
					ui.helper.data("hitMode", null);
					this._local._setDndStatus(
						otherNode,
						node,
						ui.helper,
						"out",
						undefined
					);
					if (dnd.dragLeave) {
						dnd.dragLeave(node, ctx);
					}
					break;

				case "stop":
					$nodeTag.removeClass("fancytree-drag-source");
					$(document).off(".fancytree-dnd");
					if (dnd.dragStop) {
						dnd.dragStop(node, ctx);
					}
					break;

				default:
					$.error("Unsupported drag event: " + eventName);
			}
			return res;
		},

		_cancelDrag: function() {
			var dd = $.ui.ddmanager.current;
			if (dd) {
				dd.cancel();
			}
		},
	});
	// Value returned by `require('jquery.fancytree..')`
	return $.ui.fancytree;
}); // End of closure

/*!
 * jquery.fancytree.filter.js
 *
 * Remove or highlight tree nodes, based on a filter.
 * (Extension module for jquery.fancytree.js: https://github.com/mar10/fancytree/)
 *
 * Copyright (c) 2008-2019, Martin Wendt (https://wwWendt.de)
 *
 * Released under the MIT license
 * https://github.com/mar10/fancytree/wiki/LicenseInfo
 *
 * @version 2.31.0
 * @date 2019-05-31T11:32:38Z
 */

(function(factory) {
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define(["jquery", "./jquery.fancytree"], factory);
	} else if (typeof module === "object" && module.exports) {
		// Node/CommonJS
		require("./jquery.fancytree");
		module.exports = factory(require("jquery"));
	} else {
		// Browser globals
		factory(jQuery);
	}
})(function($) {
	"use strict";

	/*******************************************************************************
	 * Private functions and variables
	 */

	var KeyNoData = "__not_found__",
		escapeHtml = $.ui.fancytree.escapeHtml;

	function _escapeRegex(str) {
		return (str + "").replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
	}

	function extractHtmlText(s) {
		if (s.indexOf(">") >= 0) {
			return $("<div/>")
				.html(s)
				.text();
		}
		return s;
	}

	$.ui.fancytree._FancytreeClass.prototype._applyFilterImpl = function(
		filter,
		branchMode,
		_opts
	) {
		var match,
			statusNode,
			re,
			reHighlight,
			temp,
			prevEnableUpdate,
			count = 0,
			treeOpts = this.options,
			escapeTitles = treeOpts.escapeTitles,
			prevAutoCollapse = treeOpts.autoCollapse,
			opts = $.extend({}, treeOpts.filter, _opts),
			hideMode = opts.mode === "hide",
			leavesOnly = !!opts.leavesOnly && !branchMode;

		// Default to 'match title substring (not case sensitive)'
		if (typeof filter === "string") {
			if (filter === "") {
				this.warn(
					"Fancytree passing an empty string as a filter is handled as clearFilter()."
				);
				this.clearFilter();
				return;
			}
			if (opts.fuzzy) {
				// See https://codereview.stackexchange.com/questions/23899/faster-javascript-fuzzy-string-matching-function/23905#23905
				// and http://www.quora.com/How-is-the-fuzzy-search-algorithm-in-Sublime-Text-designed
				// and http://www.dustindiaz.com/autocomplete-fuzzy-matching
				match = filter.split("").reduce(function(a, b) {
					return a + "[^" + b + "]*" + b;
				});
			} else {
				match = _escapeRegex(filter); // make sure a '.' is treated literally
			}
			re = new RegExp(".*" + match + ".*", "i");
			reHighlight = new RegExp(_escapeRegex(filter), "gi");
			filter = function(node) {
				if (!node.title) {
					return false;
				}
				var text = escapeTitles
						? node.title
						: extractHtmlText(node.title),
					res = !!re.test(text);

				if (res && opts.highlight) {
					if (escapeTitles) {
						// #740: we must not apply the marks to escaped entity names, e.g. `&quot;`
						// Use some exotic characters to mark matches:
						temp = text.replace(reHighlight, function(s) {
							return "\uFFF7" + s + "\uFFF8";
						});
						// now we can escape the title...
						node.titleWithHighlight = escapeHtml(temp)
							// ... and finally insert the desired `<mark>` tags
							.replace(/\uFFF7/g, "<mark>")
							.replace(/\uFFF8/g, "</mark>");
					} else {
						node.titleWithHighlight = text.replace(
							reHighlight,
							function(s) {
								return "<mark>" + s + "</mark>";
							}
						);
					}
					// node.debug("filter", escapeTitles, text, node.titleWithHighlight);
				}
				return res;
			};
		}

		this.enableFilter = true;
		this.lastFilterArgs = arguments;

		prevEnableUpdate = this.enableUpdate(false);

		this.$div.addClass("fancytree-ext-filter");
		if (hideMode) {
			this.$div.addClass("fancytree-ext-filter-hide");
		} else {
			this.$div.addClass("fancytree-ext-filter-dimm");
		}
		this.$div.toggleClass(
			"fancytree-ext-filter-hide-expanders",
			!!opts.hideExpanders
		);
		// Reset current filter
		this.visit(function(node) {
			delete node.match;
			delete node.titleWithHighlight;
			node.subMatchCount = 0;
		});
		statusNode = this.getRootNode()._findDirectChild(KeyNoData);
		if (statusNode) {
			statusNode.remove();
		}

		// Adjust node.hide, .match, and .subMatchCount properties
		treeOpts.autoCollapse = false; // #528

		this.visit(function(node) {
			if (leavesOnly && node.children != null) {
				return;
			}
			var res = filter(node),
				matchedByBranch = false;

			if (res === "skip") {
				node.visit(function(c) {
					c.match = false;
				}, true);
				return "skip";
			}
			if (!res && (branchMode || res === "branch") && node.parent.match) {
				res = true;
				matchedByBranch = true;
			}
			if (res) {
				count++;
				node.match = true;
				node.visitParents(function(p) {
					p.subMatchCount += 1;
					// Expand match (unless this is no real match, but only a node in a matched branch)
					if (opts.autoExpand && !matchedByBranch && !p.expanded) {
						p.setExpanded(true, {
							noAnimation: true,
							noEvents: true,
							scrollIntoView: false,
						});
						p._filterAutoExpanded = true;
					}
				});
			}
		});
		treeOpts.autoCollapse = prevAutoCollapse;

		if (count === 0 && opts.nodata && hideMode) {
			statusNode = opts.nodata;
			if ($.isFunction(statusNode)) {
				statusNode = statusNode();
			}
			if (statusNode === true) {
				statusNode = {};
			} else if (typeof statusNode === "string") {
				statusNode = { title: statusNode };
			}
			statusNode = $.extend(
				{
					statusNodeType: "nodata",
					key: KeyNoData,
					title: this.options.strings.noData,
				},
				statusNode
			);

			this.getRootNode().addNode(statusNode).match = true;
		}
		// Redraw whole tree
		this._callHook("treeStructureChanged", this, "applyFilter");
		// this.render();
		this.enableUpdate(prevEnableUpdate);
		return count;
	};

	/**
	 * [ext-filter] Dimm or hide nodes.
	 *
	 * @param {function | string} filter
	 * @param {boolean} [opts={autoExpand: false, leavesOnly: false}]
	 * @returns {integer} count
	 * @alias Fancytree#filterNodes
	 * @requires jquery.fancytree.filter.js
	 */
	$.ui.fancytree._FancytreeClass.prototype.filterNodes = function(
		filter,
		opts
	) {
		if (typeof opts === "boolean") {
			opts = { leavesOnly: opts };
			this.warn(
				"Fancytree.filterNodes() leavesOnly option is deprecated since 2.9.0 / 2015-04-19. Use opts.leavesOnly instead."
			);
		}
		return this._applyFilterImpl(filter, false, opts);
	};

	/**
	 * [ext-filter] Dimm or hide whole branches.
	 *
	 * @param {function | string} filter
	 * @param {boolean} [opts={autoExpand: false}]
	 * @returns {integer} count
	 * @alias Fancytree#filterBranches
	 * @requires jquery.fancytree.filter.js
	 */
	$.ui.fancytree._FancytreeClass.prototype.filterBranches = function(
		filter,
		opts
	) {
		return this._applyFilterImpl(filter, true, opts);
	};

	/**
	 * [ext-filter] Reset the filter.
	 *
	 * @alias Fancytree#clearFilter
	 * @requires jquery.fancytree.filter.js
	 */
	$.ui.fancytree._FancytreeClass.prototype.clearFilter = function() {
		var $title,
			statusNode = this.getRootNode()._findDirectChild(KeyNoData),
			escapeTitles = this.options.escapeTitles,
			enhanceTitle = this.options.enhanceTitle,
			prevEnableUpdate = this.enableUpdate(false);

		if (statusNode) {
			statusNode.remove();
		}
		this.visit(function(node) {
			if (node.match && node.span) {
				// #491, #601
				$title = $(node.span).find(">span.fancytree-title");
				if (escapeTitles) {
					$title.text(node.title);
				} else {
					$title.html(node.title);
				}
				if (enhanceTitle) {
					enhanceTitle(
						{ type: "enhanceTitle" },
						{ node: node, $title: $title }
					);
				}
			}
			delete node.match;
			delete node.subMatchCount;
			delete node.titleWithHighlight;
			if (node.$subMatchBadge) {
				node.$subMatchBadge.remove();
				delete node.$subMatchBadge;
			}
			if (node._filterAutoExpanded && node.expanded) {
				node.setExpanded(false, {
					noAnimation: true,
					noEvents: true,
					scrollIntoView: false,
				});
			}
			delete node._filterAutoExpanded;
		});
		this.enableFilter = false;
		this.lastFilterArgs = null;
		this.$div.removeClass(
			"fancytree-ext-filter fancytree-ext-filter-dimm fancytree-ext-filter-hide"
		);
		this._callHook("treeStructureChanged", this, "clearFilter");
		// this.render();
		this.enableUpdate(prevEnableUpdate);
	};

	/**
	 * [ext-filter] Return true if a filter is currently applied.
	 *
	 * @returns {Boolean}
	 * @alias Fancytree#isFilterActive
	 * @requires jquery.fancytree.filter.js
	 * @since 2.13
	 */
	$.ui.fancytree._FancytreeClass.prototype.isFilterActive = function() {
		return !!this.enableFilter;
	};

	/**
	 * [ext-filter] Return true if this node is matched by current filter (or no filter is active).
	 *
	 * @returns {Boolean}
	 * @alias FancytreeNode#isMatched
	 * @requires jquery.fancytree.filter.js
	 * @since 2.13
	 */
	$.ui.fancytree._FancytreeNodeClass.prototype.isMatched = function() {
		return !(this.tree.enableFilter && !this.match);
	};

	/*******************************************************************************
	 * Extension code
	 */
	$.ui.fancytree.registerExtension({
		name: "filter",
		version: "2.31.0",
		// Default options for this extension.
		options: {
			autoApply: true, // Re-apply last filter if lazy data is loaded
			autoExpand: false, // Expand all branches that contain matches while filtered
			counter: true, // Show a badge with number of matching child nodes near parent icons
			fuzzy: false, // Match single characters in order, e.g. 'fb' will match 'FooBar'
			hideExpandedCounter: true, // Hide counter badge if parent is expanded
			hideExpanders: false, // Hide expanders if all child nodes are hidden by filter
			highlight: true, // Highlight matches by wrapping inside <mark> tags
			leavesOnly: false, // Match end nodes only
			nodata: true, // Display a 'no data' status node if result is empty
			mode: "dimm", // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
		},
		nodeLoadChildren: function(ctx, source) {
			var tree = ctx.tree;

			return this._superApply(arguments).done(function() {
				if (
					tree.enableFilter &&
					tree.lastFilterArgs &&
					ctx.options.filter.autoApply
				) {
					tree._applyFilterImpl.apply(tree, tree.lastFilterArgs);
				}
			});
		},
		nodeSetExpanded: function(ctx, flag, callOpts) {
			var node = ctx.node;

			delete node._filterAutoExpanded;
			// Make sure counter badge is displayed again, when node is beeing collapsed
			if (
				!flag &&
				ctx.options.filter.hideExpandedCounter &&
				node.$subMatchBadge
			) {
				node.$subMatchBadge.show();
			}
			return this._superApply(arguments);
		},
		nodeRenderStatus: function(ctx) {
			// Set classes for current status
			var res,
				node = ctx.node,
				tree = ctx.tree,
				opts = ctx.options.filter,
				$title = $(node.span).find("span.fancytree-title"),
				$span = $(node[tree.statusClassPropName]),
				enhanceTitle = ctx.options.enhanceTitle,
				escapeTitles = ctx.options.escapeTitles;

			res = this._super(ctx);
			// nothing to do, if node was not yet rendered
			if (!$span.length || !tree.enableFilter) {
				return res;
			}
			$span
				.toggleClass("fancytree-match", !!node.match)
				.toggleClass("fancytree-submatch", !!node.subMatchCount)
				.toggleClass(
					"fancytree-hide",
					!(node.match || node.subMatchCount)
				);
			// Add/update counter badge
			if (
				opts.counter &&
				node.subMatchCount &&
				(!node.isExpanded() || !opts.hideExpandedCounter)
			) {
				if (!node.$subMatchBadge) {
					node.$subMatchBadge = $(
						"<span class='fancytree-childcounter'/>"
					);
					$(
						"span.fancytree-icon, span.fancytree-custom-icon",
						node.span
					).append(node.$subMatchBadge);
				}
				node.$subMatchBadge.show().text(node.subMatchCount);
			} else if (node.$subMatchBadge) {
				node.$subMatchBadge.hide();
			}
			// node.debug("nodeRenderStatus", node.titleWithHighlight, node.title)
			// #601: also check for $title.length, because we don't need to render
			// if node.span is null (i.e. not rendered)
			if (node.span && (!node.isEditing || !node.isEditing.call(node))) {
				if (node.titleWithHighlight) {
					$title.html(node.titleWithHighlight);
				} else if (escapeTitles) {
					$title.text(node.title);
				} else {
					$title.html(node.title);
				}
				if (enhanceTitle) {
					enhanceTitle(
						{ type: "enhanceTitle" },
						{ node: node, $title: $title }
					);
				}
			}
			return res;
		},
	});
	// Value returned by `require('jquery.fancytree..')`
	return $.ui.fancytree;
}); // End of closure

/*! jQuery UI - v1.12.1 - 2016-09-16
 * http://jqueryui.com
 * Includes: position.js
 * Copyright jQuery Foundation and other contributors; Licensed MIT */

(function( factory ) {
    if ( typeof define === "function" && define.amd ) {

        // AMD. Register as an anonymous module.
        define([ "jquery" ], factory );
    } else {

        // Browser globals
        factory( jQuery );
    }
}(function( $ ) {

    $.ui = $.ui || {};

    var version = $.ui.version = "1.12.1";


    /*!
     * jQuery UI Position 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/position/
     */

//>>label: Position
//>>group: Core
//>>description: Positions elements relative to other elements.
//>>docs: http://api.jqueryui.com/position/
//>>demos: http://jqueryui.com/position/


    ( function() {
        var cachedScrollbarWidth,
            max = Math.max,
            abs = Math.abs,
            rhorizontal = /left|center|right/,
            rvertical = /top|center|bottom/,
            roffset = /[\+\-]\d+(\.[\d]+)?%?/,
            rposition = /^\w+/,
            rpercent = /%$/,
            _position = $.fn.position;

        function getOffsets( offsets, width, height ) {
            return [
                parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
                parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
            ];
        }

        function parseCss( element, property ) {
            return parseInt( $.css( element, property ), 10 ) || 0;
        }

        function getDimensions( elem ) {
            var raw = elem[ 0 ];
            if ( raw.nodeType === 9 ) {
                return {
                    width: elem.width(),
                    height: elem.height(),
                    offset: { top: 0, left: 0 }
                };
            }
            if ( $.isWindow( raw ) ) {
                return {
                    width: elem.width(),
                    height: elem.height(),
                    offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
                };
            }
            if ( raw.preventDefault ) {
                return {
                    width: 0,
                    height: 0,
                    offset: { top: raw.pageY, left: raw.pageX }
                };
            }
            return {
                width: elem.outerWidth(),
                height: elem.outerHeight(),
                offset: elem.offset()
            };
        }

        $.position = {
            scrollbarWidth: function() {
                if ( cachedScrollbarWidth !== undefined ) {
                    return cachedScrollbarWidth;
                }
                var w1, w2,
                    div = $( "<div " +
                        "style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" +
                        "<div style='height:100px;width:auto;'></div></div>" ),
                    innerDiv = div.children()[ 0 ];

                $( "body" ).append( div );
                w1 = innerDiv.offsetWidth;
                div.css( "overflow", "scroll" );

                w2 = innerDiv.offsetWidth;

                if ( w1 === w2 ) {
                    w2 = div[ 0 ].clientWidth;
                }

                div.remove();

                return ( cachedScrollbarWidth = w1 - w2 );
            },
            getScrollInfo: function( within ) {
                var overflowX = within.isWindow || within.isDocument ? "" :
                        within.element.css( "overflow-x" ),
                    overflowY = within.isWindow || within.isDocument ? "" :
                        within.element.css( "overflow-y" ),
                    hasOverflowX = overflowX === "scroll" ||
                        ( overflowX === "auto" && within.width < within.element[ 0 ].scrollWidth ),
                    hasOverflowY = overflowY === "scroll" ||
                        ( overflowY === "auto" && within.height < within.element[ 0 ].scrollHeight );
                return {
                    width: hasOverflowY ? $.position.scrollbarWidth() : 0,
                    height: hasOverflowX ? $.position.scrollbarWidth() : 0
                };
            },
            getWithinInfo: function( element ) {
                var withinElement = $( element || window ),
                    isWindow = $.isWindow( withinElement[ 0 ] ),
                    isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9,
                    hasOffset = !isWindow && !isDocument;
                return {
                    element: withinElement,
                    isWindow: isWindow,
                    isDocument: isDocument,
                    offset: hasOffset ? $( element ).offset() : { left: 0, top: 0 },
                    scrollLeft: withinElement.scrollLeft(),
                    scrollTop: withinElement.scrollTop(),
                    width: withinElement.outerWidth(),
                    height: withinElement.outerHeight()
                };
            }
        };

        $.fn.position = function( options ) {
            if ( !options || !options.of ) {
                return _position.apply( this, arguments );
            }

            // Make a copy, we don't want to modify arguments
            options = $.extend( {}, options );

            var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
                target = $( options.of ),
                within = $.position.getWithinInfo( options.within ),
                scrollInfo = $.position.getScrollInfo( within ),
                collision = ( options.collision || "flip" ).split( " " ),
                offsets = {};

            dimensions = getDimensions( target );
            if ( target[ 0 ].preventDefault ) {

                // Force left top to allow flipping
                options.at = "left top";
            }
            targetWidth = dimensions.width;
            targetHeight = dimensions.height;
            targetOffset = dimensions.offset;

            // Clone to reuse original targetOffset later
            basePosition = $.extend( {}, targetOffset );

            // Force my and at to have valid horizontal and vertical positions
            // if a value is missing or invalid, it will be converted to center
            $.each( [ "my", "at" ], function() {
                var pos = ( options[ this ] || "" ).split( " " ),
                    horizontalOffset,
                    verticalOffset;

                if ( pos.length === 1 ) {
                    pos = rhorizontal.test( pos[ 0 ] ) ?
                        pos.concat( [ "center" ] ) :
                        rvertical.test( pos[ 0 ] ) ?
                            [ "center" ].concat( pos ) :
                            [ "center", "center" ];
                }
                pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
                pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

                // Calculate offsets
                horizontalOffset = roffset.exec( pos[ 0 ] );
                verticalOffset = roffset.exec( pos[ 1 ] );
                offsets[ this ] = [
                    horizontalOffset ? horizontalOffset[ 0 ] : 0,
                    verticalOffset ? verticalOffset[ 0 ] : 0
                ];

                // Reduce to just the positions without the offsets
                options[ this ] = [
                    rposition.exec( pos[ 0 ] )[ 0 ],
                    rposition.exec( pos[ 1 ] )[ 0 ]
                ];
            } );

            // Normalize collision option
            if ( collision.length === 1 ) {
                collision[ 1 ] = collision[ 0 ];
            }

            if ( options.at[ 0 ] === "right" ) {
                basePosition.left += targetWidth;
            } else if ( options.at[ 0 ] === "center" ) {
                basePosition.left += targetWidth / 2;
            }

            if ( options.at[ 1 ] === "bottom" ) {
                basePosition.top += targetHeight;
            } else if ( options.at[ 1 ] === "center" ) {
                basePosition.top += targetHeight / 2;
            }

            atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
            basePosition.left += atOffset[ 0 ];
            basePosition.top += atOffset[ 1 ];

            return this.each( function() {
                var collisionPosition, using,
                    elem = $( this ),
                    elemWidth = elem.outerWidth(),
                    elemHeight = elem.outerHeight(),
                    marginLeft = parseCss( this, "marginLeft" ),
                    marginTop = parseCss( this, "marginTop" ),
                    collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) +
                        scrollInfo.width,
                    collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) +
                        scrollInfo.height,
                    position = $.extend( {}, basePosition ),
                    myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

                if ( options.my[ 0 ] === "right" ) {
                    position.left -= elemWidth;
                } else if ( options.my[ 0 ] === "center" ) {
                    position.left -= elemWidth / 2;
                }

                if ( options.my[ 1 ] === "bottom" ) {
                    position.top -= elemHeight;
                } else if ( options.my[ 1 ] === "center" ) {
                    position.top -= elemHeight / 2;
                }

                position.left += myOffset[ 0 ];
                position.top += myOffset[ 1 ];

                collisionPosition = {
                    marginLeft: marginLeft,
                    marginTop: marginTop
                };

                $.each( [ "left", "top" ], function( i, dir ) {
                    if ( $.ui.position[ collision[ i ] ] ) {
                        $.ui.position[ collision[ i ] ][ dir ]( position, {
                            targetWidth: targetWidth,
                            targetHeight: targetHeight,
                            elemWidth: elemWidth,
                            elemHeight: elemHeight,
                            collisionPosition: collisionPosition,
                            collisionWidth: collisionWidth,
                            collisionHeight: collisionHeight,
                            offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
                            my: options.my,
                            at: options.at,
                            within: within,
                            elem: elem
                        } );
                    }
                } );

                if ( options.using ) {

                    // Adds feedback as second argument to using callback, if present
                    using = function( props ) {
                        var left = targetOffset.left - position.left,
                            right = left + targetWidth - elemWidth,
                            top = targetOffset.top - position.top,
                            bottom = top + targetHeight - elemHeight,
                            feedback = {
                                target: {
                                    element: target,
                                    left: targetOffset.left,
                                    top: targetOffset.top,
                                    width: targetWidth,
                                    height: targetHeight
                                },
                                element: {
                                    element: elem,
                                    left: position.left,
                                    top: position.top,
                                    width: elemWidth,
                                    height: elemHeight
                                },
                                horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
                                vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
                            };
                        if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
                            feedback.horizontal = "center";
                        }
                        if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
                            feedback.vertical = "middle";
                        }
                        if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
                            feedback.important = "horizontal";
                        } else {
                            feedback.important = "vertical";
                        }
                        options.using.call( this, props, feedback );
                    };
                }

                elem.offset( $.extend( position, { using: using } ) );
            } );
        };

        $.ui.position = {
            fit: {
                left: function( position, data ) {
                    var within = data.within,
                        withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
                        outerWidth = within.width,
                        collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                        overLeft = withinOffset - collisionPosLeft,
                        overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
                        newOverRight;

                    // Element is wider than within
                    if ( data.collisionWidth > outerWidth ) {

                        // Element is initially over the left side of within
                        if ( overLeft > 0 && overRight <= 0 ) {
                            newOverRight = position.left + overLeft + data.collisionWidth - outerWidth -
                                withinOffset;
                            position.left += overLeft - newOverRight;

                            // Element is initially over right side of within
                        } else if ( overRight > 0 && overLeft <= 0 ) {
                            position.left = withinOffset;

                            // Element is initially over both left and right sides of within
                        } else {
                            if ( overLeft > overRight ) {
                                position.left = withinOffset + outerWidth - data.collisionWidth;
                            } else {
                                position.left = withinOffset;
                            }
                        }

                        // Too far left -> align with left edge
                    } else if ( overLeft > 0 ) {
                        position.left += overLeft;

                        // Too far right -> align with right edge
                    } else if ( overRight > 0 ) {
                        position.left -= overRight;

                        // Adjust based on position and margin
                    } else {
                        position.left = max( position.left - collisionPosLeft, position.left );
                    }
                },
                top: function( position, data ) {
                    var within = data.within,
                        withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
                        outerHeight = data.within.height,
                        collisionPosTop = position.top - data.collisionPosition.marginTop,
                        overTop = withinOffset - collisionPosTop,
                        overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
                        newOverBottom;

                    // Element is taller than within
                    if ( data.collisionHeight > outerHeight ) {

                        // Element is initially over the top of within
                        if ( overTop > 0 && overBottom <= 0 ) {
                            newOverBottom = position.top + overTop + data.collisionHeight - outerHeight -
                                withinOffset;
                            position.top += overTop - newOverBottom;

                            // Element is initially over bottom of within
                        } else if ( overBottom > 0 && overTop <= 0 ) {
                            position.top = withinOffset;

                            // Element is initially over both top and bottom of within
                        } else {
                            if ( overTop > overBottom ) {
                                position.top = withinOffset + outerHeight - data.collisionHeight;
                            } else {
                                position.top = withinOffset;
                            }
                        }

                        // Too far up -> align with top
                    } else if ( overTop > 0 ) {
                        position.top += overTop;

                        // Too far down -> align with bottom edge
                    } else if ( overBottom > 0 ) {
                        position.top -= overBottom;

                        // Adjust based on position and margin
                    } else {
                        position.top = max( position.top - collisionPosTop, position.top );
                    }
                }
            },
            flip: {
                left: function( position, data ) {
                    var within = data.within,
                        withinOffset = within.offset.left + within.scrollLeft,
                        outerWidth = within.width,
                        offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
                        collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                        overLeft = collisionPosLeft - offsetLeft,
                        overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
                        myOffset = data.my[ 0 ] === "left" ?
                            -data.elemWidth :
                            data.my[ 0 ] === "right" ?
                                data.elemWidth :
                                0,
                        atOffset = data.at[ 0 ] === "left" ?
                            data.targetWidth :
                            data.at[ 0 ] === "right" ?
                                -data.targetWidth :
                                0,
                        offset = -2 * data.offset[ 0 ],
                        newOverRight,
                        newOverLeft;

                    if ( overLeft < 0 ) {
                        newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth -
                            outerWidth - withinOffset;
                        if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
                            position.left += myOffset + atOffset + offset;
                        }
                    } else if ( overRight > 0 ) {
                        newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset +
                            atOffset + offset - offsetLeft;
                        if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
                            position.left += myOffset + atOffset + offset;
                        }
                    }
                },
                top: function( position, data ) {
                    var within = data.within,
                        withinOffset = within.offset.top + within.scrollTop,
                        outerHeight = within.height,
                        offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
                        collisionPosTop = position.top - data.collisionPosition.marginTop,
                        overTop = collisionPosTop - offsetTop,
                        overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
                        top = data.my[ 1 ] === "top",
                        myOffset = top ?
                            -data.elemHeight :
                            data.my[ 1 ] === "bottom" ?
                                data.elemHeight :
                                0,
                        atOffset = data.at[ 1 ] === "top" ?
                            data.targetHeight :
                            data.at[ 1 ] === "bottom" ?
                                -data.targetHeight :
                                0,
                        offset = -2 * data.offset[ 1 ],
                        newOverTop,
                        newOverBottom;
                    if ( overTop < 0 ) {
                        newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight -
                            outerHeight - withinOffset;
                        if ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) {
                            position.top += myOffset + atOffset + offset;
                        }
                    } else if ( overBottom > 0 ) {
                        newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset +
                            offset - offsetTop;
                        if ( newOverTop > 0 || abs( newOverTop ) < overBottom ) {
                            position.top += myOffset + atOffset + offset;
                        }
                    }
                }
            },
            flipfit: {
                left: function() {
                    $.ui.position.flip.left.apply( this, arguments );
                    $.ui.position.fit.left.apply( this, arguments );
                },
                top: function() {
                    $.ui.position.flip.top.apply( this, arguments );
                    $.ui.position.fit.top.apply( this, arguments );
                }
            }
        };

    } )();

    var position = $.ui.position;
}));

/**
 * jQuery contextMenu v2.8.0 - Plugin for simple contextMenu handling
 *
 * Version: v2.8.0
 *
 * Authors: Björn Brala (SWIS.nl), Rodney Rehm, Addy Osmani (patches for FF)
 * Web: http://swisnl.github.io/jQuery-contextMenu/
 *
 * Copyright (c) 2011-2019 SWIS BV and contributors
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 * Date: 2019-01-16T15:45:48.370Z
 */

// jscs:disable
/* jshint ignore:start */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node / CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals.
        factory(jQuery);
    }
})(function ($) {

    'use strict';

    // TODO: -
    // ARIA stuff: menuitem, menuitemcheckbox und menuitemradio
    // create <menu> structure if $.support[htmlCommand || htmlMenuitem] and !opt.disableNative

    // determine html5 compatibility
    $.support.htmlMenuitem = ('HTMLMenuItemElement' in window);
    $.support.htmlCommand = ('HTMLCommandElement' in window);
    $.support.eventSelectstart = ('onselectstart' in document.documentElement);
    /* // should the need arise, test for css user-select
     $.support.cssUserSelect = (function(){
     var t = false,
     e = document.createElement('div');

     $.each('Moz|Webkit|Khtml|O|ms|Icab|'.split('|'), function(i, prefix) {
     var propCC = prefix + (prefix ? 'U' : 'u') + 'serSelect',
     prop = (prefix ? ('-' + prefix.toLowerCase() + '-') : '') + 'user-select';

     e.style.cssText = prop + ': text;';
     if (e.style[propCC] == 'text') {
     t = true;
     return false;
     }

     return true;
     });

     return t;
     })();
     */


    if (!$.ui || !$.widget) {
        // duck punch $.cleanData like jQueryUI does to get that remove event
        $.cleanData = (function (orig) {
            return function (elems) {
                var events, elem, i;
                for (i = 0; elems[i] != null; i++) {
                    elem = elems[i];
                    try {
                        // Only trigger remove when necessary to save time
                        events = $._data(elem, 'events');
                        if (events && events.remove) {
                            $(elem).triggerHandler('remove');
                        }

                        // Http://bugs.jquery.com/ticket/8235
                    } catch (e) {
                    }
                }
                orig(elems);
            };
        })($.cleanData);
    }
    /* jshint ignore:end */
    // jscs:enable

    var // currently active contextMenu trigger
        $currentTrigger = null,
        // is contextMenu initialized with at least one menu?
        initialized = false,
        // window handle
        $win = $(window),
        // number of registered menus
        counter = 0,
        // mapping selector to namespace
        namespaces = {},
        // mapping namespace to options
        menus = {},
        // custom command type handlers
        types = {},
        // default values
        defaults = {
            // selector of contextMenu trigger
            selector: null,
            // where to append the menu to
            appendTo: null,
            // method to trigger context menu ["right", "left", "hover"]
            trigger: 'right',
            // hide menu when mouse leaves trigger / menu elements
            autoHide: false,
            // ms to wait before showing a hover-triggered context menu
            delay: 200,
            // flag denoting if a second trigger should simply move (true) or rebuild (false) an open menu
            // as long as the trigger happened on one of the trigger-element's child nodes
            reposition: true,
            // Flag denoting if a second trigger should close the menu, as long as
            // the trigger happened on one of the trigger-element's child nodes.
            // This overrides the reposition option.
            hideOnSecondTrigger: false,

            //ability to select submenu
            selectableSubMenu: false,

            // Default classname configuration to be able avoid conflicts in frameworks
            classNames: {
                hover: 'context-menu-hover', // Item hover
                disabled: 'context-menu-disabled', // Item disabled
                visible: 'context-menu-visible', // Item visible
                notSelectable: 'context-menu-not-selectable', // Item not selectable

                icon: 'context-menu-icon',
                iconEdit: 'context-menu-icon-edit',
                iconCut: 'context-menu-icon-cut',
                iconCopy: 'context-menu-icon-copy',
                iconPaste: 'context-menu-icon-paste',
                iconDelete: 'context-menu-icon-delete',
                iconAdd: 'context-menu-icon-add',
                iconQuit: 'context-menu-icon-quit',
                iconLoadingClass: 'context-menu-icon-loading'
            },

            // determine position to show menu at
            determinePosition: function ($menu) {
                // position to the lower middle of the trigger element
                if ($.ui && $.ui.position) {
                    // .position() is provided as a jQuery UI utility
                    // (...and it won't work on hidden elements)
                    $menu.css('display', 'block').position({
                        my: 'center top',
                        at: 'center bottom',
                        of: this,
                        offset: '0 5',
                        collision: 'fit'
                    }).css('display', 'none');
                } else {
                    // determine contextMenu position
                    var offset = this.offset();
                    offset.top += this.outerHeight();
                    offset.left += this.outerWidth() / 2 - $menu.outerWidth() / 2;
                    $menu.css(offset);
                }
            },
            // position menu
            position: function (opt, x, y) {
                var offset;
                // determine contextMenu position
                if (!x && !y) {
                    opt.determinePosition.call(this, opt.$menu);
                    return;
                } else if (x === 'maintain' && y === 'maintain') {
                    // x and y must not be changed (after re-show on command click)
                    offset = opt.$menu.position();
                } else {
                    // x and y are given (by mouse event)
                    var offsetParentOffset = opt.$menu.offsetParent().offset();
                    offset = {top: y - offsetParentOffset.top, left: x -offsetParentOffset.left};
                }

                // correct offset if viewport demands it
                var bottom = $win.scrollTop() + $win.height(),
                    right = $win.scrollLeft() + $win.width(),
                    height = opt.$menu.outerHeight(),
                    width = opt.$menu.outerWidth();

                if (offset.top + height > bottom) {
                    offset.top -= height;
                }

                if (offset.top < 0) {
                    offset.top = 0;
                }

                if (offset.left + width > right) {
                    offset.left -= width;
                }

                if (offset.left < 0) {
                    offset.left = 0;
                }

                opt.$menu.css(offset);
            },
            // position the sub-menu
            positionSubmenu: function ($menu) {
                if (typeof $menu === 'undefined') {
                    // When user hovers over item (which has sub items) handle.focusItem will call this.
                    // but the submenu does not exist yet if opt.items is a promise. just return, will
                    // call positionSubmenu after promise is completed.
                    return;
                }
                if ($.ui && $.ui.position) {
                    // .position() is provided as a jQuery UI utility
                    // (...and it won't work on hidden elements)
                    $menu.css('display', 'block').position({
                        my: 'left top-5',
                        at: 'right top',
                        of: this,
                        collision: 'flipfit fit'
                    }).css('display', '');
                } else {
                    // determine contextMenu position
                    var offset = {
                        top: -9,
                        left: this.outerWidth() - 5
                    };
                    $menu.css(offset);
                }
            },
            // offset to add to zIndex
            zIndex: 1,
            // show hide animation settings
            animation: {
                duration: 50,
                show: 'slideDown',
                hide: 'slideUp'
            },
            // events
            events: {
                preShow: $.noop,
                show: $.noop,
                hide: $.noop,
                activated: $.noop
            },
            // default callback
            callback: null,
            // list of contextMenu items
            items: {}
        },
        // mouse position for hover activation
        hoveract = {
            timer: null,
            pageX: null,
            pageY: null
        },
        // determine zIndex
        zindex = function ($t) {
            var zin = 0,
                $tt = $t;

            while (true) {
                zin = Math.max(zin, parseInt($tt.css('z-index'), 10) || 0);
                $tt = $tt.parent();
                if (!$tt || !$tt.length || 'html body'.indexOf($tt.prop('nodeName').toLowerCase()) > -1) {
                    break;
                }
            }
            return zin;
        },
        // event handlers
        handle = {
            // abort anything
            abortevent: function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
            },
            // contextmenu show dispatcher
            contextmenu: function (e) {
                var $this = $(this);
                
                //Show browser context-menu when preShow returns false
                if (e.data.events.preShow($this,e) === false) {
                    return;
                }

                // disable actual context-menu if we are using the right mouse button as the trigger
                if (e.data.trigger === 'right') {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }

                // abort native-triggered events unless we're triggering on right click
                if ((e.data.trigger !== 'right' && e.data.trigger !== 'demand') && e.originalEvent) {
                    return;
                }

                // Let the current contextmenu decide if it should show or not based on its own trigger settings
                if (typeof e.mouseButton !== 'undefined' && e.data) {
                    if (!(e.data.trigger === 'left' && e.mouseButton === 0) && !(e.data.trigger === 'right' && e.mouseButton === 2)) {
                        // Mouse click is not valid.
                        return;
                    }
                }

                // abort event if menu is visible for this trigger
                if ($this.hasClass('context-menu-active')) {
                    return;
                }

                if (!$this.hasClass('context-menu-disabled')) {
                    // theoretically need to fire a show event at <menu>
                    // http://www.whatwg.org/specs/web-apps/current-work/multipage/interactive-elements.html#context-menus
                    // var evt = jQuery.Event("show", { data: data, pageX: e.pageX, pageY: e.pageY, relatedTarget: this });
                    // e.data.$menu.trigger(evt);

                    $currentTrigger = $this;
                    if (e.data.build) {
                        var built = e.data.build($currentTrigger, e);
                        // abort if build() returned false
                        if (built === false) {
                            return;
                        }

                        // dynamically build menu on invocation
                        e.data = $.extend(true, {}, defaults, e.data, built || {});

                        // abort if there are no items to display
                        if (!e.data.items || $.isEmptyObject(e.data.items)) {
                            // Note: jQuery captures and ignores errors from event handlers
                            if (window.console) {
                                (console.error || console.log).call(console, 'No items specified to show in contextMenu');
                            }

                            throw new Error('No Items specified');
                        }

                        // backreference for custom command type creation
                        e.data.$trigger = $currentTrigger;

                        op.create(e.data);
                    }
                    op.show.call($this, e.data, e.pageX, e.pageY);
                }
            },
            // contextMenu left-click trigger
            click: function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                $(this).trigger($.Event('contextmenu', {data: e.data, pageX: e.pageX, pageY: e.pageY}));
            },
            // contextMenu right-click trigger
            mousedown: function (e) {
                // register mouse down
                var $this = $(this);

                // hide any previous menus
                if ($currentTrigger && $currentTrigger.length && !$currentTrigger.is($this)) {
                    $currentTrigger.data('contextMenu').$menu.trigger('contextmenu:hide');
                }

                // activate on right click
                if (e.button === 2) {
                    $currentTrigger = $this.data('contextMenuActive', true);
                }
            },
            // contextMenu right-click trigger
            mouseup: function (e) {
                // show menu
                var $this = $(this);
                if ($this.data('contextMenuActive') && $currentTrigger && $currentTrigger.length && $currentTrigger.is($this) && !$this.hasClass('context-menu-disabled')) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    $currentTrigger = $this;
                    $this.trigger($.Event('contextmenu', {data: e.data, pageX: e.pageX, pageY: e.pageY}));
                }

                $this.removeData('contextMenuActive');
            },
            // contextMenu hover trigger
            mouseenter: function (e) {
                var $this = $(this),
                    $related = $(e.relatedTarget),
                    $document = $(document);

                // abort if we're coming from a menu
                if ($related.is('.context-menu-list') || $related.closest('.context-menu-list').length) {
                    return;
                }

                // abort if a menu is shown
                if ($currentTrigger && $currentTrigger.length) {
                    return;
                }

                hoveract.pageX = e.pageX;
                hoveract.pageY = e.pageY;
                hoveract.data = e.data;
                $document.on('mousemove.contextMenuShow', handle.mousemove);
                hoveract.timer = setTimeout(function () {
                    hoveract.timer = null;
                    $document.off('mousemove.contextMenuShow');
                    $currentTrigger = $this;
                    $this.trigger($.Event('contextmenu', {
                        data: hoveract.data,
                        pageX: hoveract.pageX,
                        pageY: hoveract.pageY
                    }));
                }, e.data.delay);
            },
            // contextMenu hover trigger
            mousemove: function (e) {
                hoveract.pageX = e.pageX;
                hoveract.pageY = e.pageY;
            },
            // contextMenu hover trigger
            mouseleave: function (e) {
                // abort if we're leaving for a menu
                var $related = $(e.relatedTarget);
                if ($related.is('.context-menu-list') || $related.closest('.context-menu-list').length) {
                    return;
                }

                try {
                    clearTimeout(hoveract.timer);
                } catch (e) {
                }

                hoveract.timer = null;
            },
            // click on layer to hide contextMenu
            layerClick: function (e) {
                var $this = $(this),
                    root = $this.data('contextMenuRoot'),
                    button = e.button,
                    x = e.pageX,
                    y = e.pageY,
                    fakeClick = x === undefined,
                    target,
                    offset;

                e.preventDefault();

                setTimeout(function () {
                    // If the click is not real, things break: https://github.com/swisnl/jQuery-contextMenu/issues/132
                    if(fakeClick){
                        if (root !== null && typeof root !== 'undefined' && root.$menu !== null  && typeof root.$menu !== 'undefined') {
                            root.$menu.trigger('contextmenu:hide');
                        }
                        return;
                    }

                    var $window;
                    var triggerAction = ((root.trigger === 'left' && button === 0) || (root.trigger === 'right' && button === 2));

                    // find the element that would've been clicked, wasn't the layer in the way
                    if (document.elementFromPoint && root.$layer) {
                        root.$layer.hide();
                        target = document.elementFromPoint(x - $win.scrollLeft(), y - $win.scrollTop());

                        // also need to try and focus this element if we're in a contenteditable area,
                        // as the layer will prevent the browser mouse action we want
                        if (target.isContentEditable) {
                            var range = document.createRange(),
                                sel = window.getSelection();
                            range.selectNode(target);
                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                        $(target).trigger(e);
                        root.$layer.show();
                    }

                    if (root.hideOnSecondTrigger && triggerAction && root.$menu !== null && typeof root.$menu !== 'undefined') {
                      root.$menu.trigger('contextmenu:hide');
                      return;
                    }

                    if (root.reposition && triggerAction) {
                        if (document.elementFromPoint) {
                            if (root.$trigger.is(target)) {
                                root.position.call(root.$trigger, root, x, y);
                                return;
                            }
                        } else {
                            offset = root.$trigger.offset();
                            $window = $(window);
                            // while this looks kinda awful, it's the best way to avoid
                            // unnecessarily calculating any positions
                            offset.top += $window.scrollTop();
                            if (offset.top <= e.pageY) {
                                offset.left += $window.scrollLeft();
                                if (offset.left <= e.pageX) {
                                    offset.bottom = offset.top + root.$trigger.outerHeight();
                                    if (offset.bottom >= e.pageY) {
                                        offset.right = offset.left + root.$trigger.outerWidth();
                                        if (offset.right >= e.pageX) {
                                            // reposition
                                            root.position.call(root.$trigger, root, x, y);
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (target && triggerAction) {
                        root.$trigger.one('contextmenu:hidden', function () {
                            $(target).contextMenu({x: x, y: y, button: button});
                        });
                    }

                    if (root !== null && typeof root !== 'undefined' && root.$menu !== null  && typeof root.$menu !== 'undefined') {
                        root.$menu.trigger('contextmenu:hide');
                    }
                }, 50);
            },
            // key handled :hover
            keyStop: function (e, opt) {
                if (!opt.isInput) {
                    e.preventDefault();
                }

                e.stopPropagation();
            },
            key: function (e) {

                var opt = {};

                // Only get the data from $currentTrigger if it exists
                if ($currentTrigger) {
                    opt = $currentTrigger.data('contextMenu') || {};
                }
                // If the trigger happen on a element that are above the contextmenu do this
                if (typeof opt.zIndex === 'undefined') {
                    opt.zIndex = 0;
                }
                var targetZIndex = 0;
                var getZIndexOfTriggerTarget = function (target) {
                    if (target.style.zIndex !== '') {
                        targetZIndex = target.style.zIndex;
                    } else {
                        if (target.offsetParent !== null && typeof target.offsetParent !== 'undefined') {
                            getZIndexOfTriggerTarget(target.offsetParent);
                        }
                        else if (target.parentElement !== null && typeof target.parentElement !== 'undefined') {
                            getZIndexOfTriggerTarget(target.parentElement);
                        }
                    }
                };
                getZIndexOfTriggerTarget(e.target);
                // If targetZIndex is heigher then opt.zIndex dont progress any futher.
                // This is used to make sure that if you are using a dialog with a input / textarea / contenteditable div
                // and its above the contextmenu it wont steal keys events
                if (opt.$menu && parseInt(targetZIndex,10) > parseInt(opt.$menu.css("zIndex"),10)) {
                    return;
                }
                switch (e.keyCode) {
                    case 9:
                    case 38: // up
                        handle.keyStop(e, opt);
                        // if keyCode is [38 (up)] or [9 (tab) with shift]
                        if (opt.isInput) {
                            if (e.keyCode === 9 && e.shiftKey) {
                                e.preventDefault();
                                if (opt.$selected) {
                                    opt.$selected.find('input, textarea, select').blur();
                                }
                                if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                                    opt.$menu.trigger('prevcommand');
                                }
                                return;
                            } else if (e.keyCode === 38 && opt.$selected.find('input, textarea, select').prop('type') === 'checkbox') {
                                // checkboxes don't capture this key
                                e.preventDefault();
                                return;
                            }
                        } else if (e.keyCode !== 9 || e.shiftKey) {
                            if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                                opt.$menu.trigger('prevcommand');
                            }
                            return;
                        }
                        break;
                    // omitting break;
                    // case 9: // tab - reached through omitted break;
                    case 40: // down
                        handle.keyStop(e, opt);
                        if (opt.isInput) {
                            if (e.keyCode === 9) {
                                e.preventDefault();
                                if (opt.$selected) {
                                    opt.$selected.find('input, textarea, select').blur();
                                }
                                if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                                    opt.$menu.trigger('nextcommand');
                                }
                                return;
                            } else if (e.keyCode === 40 && opt.$selected.find('input, textarea, select').prop('type') === 'checkbox') {
                                // checkboxes don't capture this key
                                e.preventDefault();
                                return;
                            }
                        } else {
                            if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                                opt.$menu.trigger('nextcommand');
                            }
                            return;
                        }
                        break;

                    case 37: // left
                        handle.keyStop(e, opt);
                        if (opt.isInput || !opt.$selected || !opt.$selected.length) {
                            break;
                        }

                        if (!opt.$selected.parent().hasClass('context-menu-root')) {
                            var $parent = opt.$selected.parent().parent();
                            opt.$selected.trigger('contextmenu:blur');
                            opt.$selected = $parent;
                            return;
                        }
                        break;

                    case 39: // right
                        handle.keyStop(e, opt);
                        if (opt.isInput || !opt.$selected || !opt.$selected.length) {
                            break;
                        }

                        var itemdata = opt.$selected.data('contextMenu') || {};
                        if (itemdata.$menu && opt.$selected.hasClass('context-menu-submenu')) {
                            opt.$selected = null;
                            itemdata.$selected = null;
                            itemdata.$menu.trigger('nextcommand');
                            return;
                        }
                        break;

                    case 35: // end
                    case 36: // home
                        if (opt.$selected && opt.$selected.find('input, textarea, select').length) {
                            return;
                        } else {
                            (opt.$selected && opt.$selected.parent() || opt.$menu)
                                .children(':not(.' + opt.classNames.disabled + ', .' + opt.classNames.notSelectable + ')')[e.keyCode === 36 ? 'first' : 'last']()
                                .trigger('contextmenu:focus');
                            e.preventDefault();
                            return;
                        }
                        break;

                    case 13: // enter
                        handle.keyStop(e, opt);
                        if (opt.isInput) {
                            if (opt.$selected && !opt.$selected.is('textarea, select')) {
                                e.preventDefault();
                                return;
                            }
                            break;
                        }
                        if (typeof opt.$selected !== 'undefined' && opt.$selected !== null) {
                            opt.$selected.trigger('mouseup');
                        }
                        return;

                    case 32: // space
                    case 33: // page up
                    case 34: // page down
                        // prevent browser from scrolling down while menu is visible
                        handle.keyStop(e, opt);
                        return;

                    case 27: // esc
                        handle.keyStop(e, opt);
                        if (opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                            opt.$menu.trigger('contextmenu:hide');
                        }
                        return;

                    default: // 0-9, a-z
                        var k = (String.fromCharCode(e.keyCode)).toUpperCase();
                        if (opt.accesskeys && opt.accesskeys[k]) {
                            // according to the specs accesskeys must be invoked immediately
                            opt.accesskeys[k].$node.trigger(opt.accesskeys[k].$menu ? 'contextmenu:focus' : 'mouseup');
                            return;
                        }
                        break;
                }
                // pass event to selected item,
                // stop propagation to avoid endless recursion
                e.stopPropagation();
                if (typeof opt.$selected !== 'undefined' && opt.$selected !== null) {
                    opt.$selected.trigger(e);
                }
            },
            // select previous possible command in menu
            prevItem: function (e) {
                e.stopPropagation();
                var opt = $(this).data('contextMenu') || {};
                var root = $(this).data('contextMenuRoot') || {};

                // obtain currently selected menu
                if (opt.$selected) {
                    var $s = opt.$selected;
                    opt = opt.$selected.parent().data('contextMenu') || {};
                    opt.$selected = $s;
                }

                var $children = opt.$menu.children(),
                    $prev = !opt.$selected || !opt.$selected.prev().length ? $children.last() : opt.$selected.prev(),
                    $round = $prev;

                // skip disabled or hidden elements
                while ($prev.hasClass(root.classNames.disabled) || $prev.hasClass(root.classNames.notSelectable) || $prev.is(':hidden')) {
                    if ($prev.prev().length) {
                        $prev = $prev.prev();
                    } else {
                        $prev = $children.last();
                    }
                    if ($prev.is($round)) {
                        // break endless loop
                        return;
                    }
                }

                // leave current
                if (opt.$selected) {
                    handle.itemMouseleave.call(opt.$selected.get(0), e);
                }

                // activate next
                handle.itemMouseenter.call($prev.get(0), e);

                // focus input
                var $input = $prev.find('input, textarea, select');
                if ($input.length) {
                    $input.focus();
                }
            },
            // select next possible command in menu
            nextItem: function (e) {
                e.stopPropagation();
                var opt = $(this).data('contextMenu') || {};
                var root = $(this).data('contextMenuRoot') || {};

                // obtain currently selected menu
                if (opt.$selected) {
                    var $s = opt.$selected;
                    opt = opt.$selected.parent().data('contextMenu') || {};
                    opt.$selected = $s;
                }

                var $children = opt.$menu.children(),
                    $next = !opt.$selected || !opt.$selected.next().length ? $children.first() : opt.$selected.next(),
                    $round = $next;

                // skip disabled
                while ($next.hasClass(root.classNames.disabled) || $next.hasClass(root.classNames.notSelectable) || $next.is(':hidden')) {
                    if ($next.next().length) {
                        $next = $next.next();
                    } else {
                        $next = $children.first();
                    }
                    if ($next.is($round)) {
                        // break endless loop
                        return;
                    }
                }

                // leave current
                if (opt.$selected) {
                    handle.itemMouseleave.call(opt.$selected.get(0), e);
                }

                // activate next
                handle.itemMouseenter.call($next.get(0), e);

                // focus input
                var $input = $next.find('input, textarea, select');
                if ($input.length) {
                    $input.focus();
                }
            },
            // flag that we're inside an input so the key handler can act accordingly
            focusInput: function () {
                var $this = $(this).closest('.context-menu-item'),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot;

                root.$selected = opt.$selected = $this;
                root.isInput = opt.isInput = true;
            },
            // flag that we're inside an input so the key handler can act accordingly
            blurInput: function () {
                var $this = $(this).closest('.context-menu-item'),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot;

                root.isInput = opt.isInput = false;
            },
            // :hover on menu
            menuMouseenter: function () {
                var root = $(this).data().contextMenuRoot;
                root.hovering = true;
            },
            // :hover on menu
            menuMouseleave: function (e) {
                var root = $(this).data().contextMenuRoot;
                if (root.$layer && root.$layer.is(e.relatedTarget)) {
                    root.hovering = false;
                }
            },
            // :hover done manually so key handling is possible
            itemMouseenter: function (e) {
                var $this = $(this),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot;

                root.hovering = true;

                // abort if we're re-entering
                if (e && root.$layer && root.$layer.is(e.relatedTarget)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }

                // make sure only one item is selected
                (opt.$menu ? opt : root).$menu
                    .children('.' + root.classNames.hover).trigger('contextmenu:blur')
                    .children('.hover').trigger('contextmenu:blur');

                if ($this.hasClass(root.classNames.disabled) || $this.hasClass(root.classNames.notSelectable)) {
                    opt.$selected = null;
                    return;
                }


                $this.trigger('contextmenu:focus');
            },
            // :hover done manually so key handling is possible
            itemMouseleave: function (e) {
                var $this = $(this),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot;

                if (root !== opt && root.$layer && root.$layer.is(e.relatedTarget)) {
                    if (typeof root.$selected !== 'undefined' && root.$selected !== null) {
                        root.$selected.trigger('contextmenu:blur');
                    }
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    root.$selected = opt.$selected = opt.$node;
                    return;
                }

                if(opt && opt.$menu && opt.$menu.hasClass('context-menu-visible')){
                    return;
                }

                $this.trigger('contextmenu:blur');
            },
            // contextMenu item click
            itemClick: function (e) {
                var $this = $(this),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot,
                    key = data.contextMenuKey,
                    callback;

                // abort if the key is unknown or disabled or is a menu
                if (!opt.items[key] || $this.is('.' + root.classNames.disabled + ', .context-menu-separator, .' + root.classNames.notSelectable) || ($this.is('.context-menu-submenu') && root.selectableSubMenu === false )) {
                    return;
                }

                e.preventDefault();
                e.stopImmediatePropagation();

                if ($.isFunction(opt.callbacks[key]) && Object.prototype.hasOwnProperty.call(opt.callbacks, key)) {
                    // item-specific callback
                    callback = opt.callbacks[key];
                } else if ($.isFunction(root.callback)) {
                    // default callback
                    callback = root.callback;
                } else {
                    // no callback, no action
                    return;
                }

                // hide menu if callback doesn't stop that
                if (callback.call(root.$trigger, key, root, e) !== false) {
                    root.$menu.trigger('contextmenu:hide');
                } else if (root.$menu.parent().length) {
                    op.update.call(root.$trigger, root);
                }
            },
            // ignore click events on input elements
            inputClick: function (e) {
                e.stopImmediatePropagation();
            },
            // hide <menu>
            hideMenu: function (e, data) {
                var root = $(this).data('contextMenuRoot');
                op.hide.call(root.$trigger, root, data && data.force);
            },
            // focus <command>
            focusItem: function (e) {
                e.stopPropagation();
                var $this = $(this),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot;

                if ($this.hasClass(root.classNames.disabled) || $this.hasClass(root.classNames.notSelectable)) {
                    return;
                }

                $this
                    .addClass([root.classNames.hover, root.classNames.visible].join(' '))
                    // select other items and included items
                    .parent().find('.context-menu-item').not($this)
                    .removeClass(root.classNames.visible)
                    .filter('.' + root.classNames.hover)
                    .trigger('contextmenu:blur');

                // remember selected
                opt.$selected = root.$selected = $this;


                if(opt && opt.$node && opt.$node.hasClass('context-menu-submenu')){
                    opt.$node.addClass(root.classNames.hover);
                }

                // position sub-menu - do after show so dumb $.ui.position can keep up
                if (opt.$node) {
                    root.positionSubmenu.call(opt.$node, opt.$menu);
                }
            },
            // blur <command>
            blurItem: function (e) {
                e.stopPropagation();
                var $this = $(this),
                    data = $this.data(),
                    opt = data.contextMenu,
                    root = data.contextMenuRoot;

                if (opt.autoHide) { // for tablets and touch screens this needs to remain
                    $this.removeClass(root.classNames.visible);
                }
                $this.removeClass(root.classNames.hover);
                opt.$selected = null;
            }
        },
        // operations
        op = {
            show: function (opt, x, y) {
                var $trigger = $(this),
                    css = {};

                // hide any open menus
                $('#context-menu-layer').trigger('mousedown');

                // backreference for callbacks
                opt.$trigger = $trigger;

                // show event
                if (opt.events.show.call($trigger, opt) === false) {
                    $currentTrigger = null;
                    return;
                }

                // create or update context menu
                var hasVisibleItems = op.update.call($trigger, opt);
                if (hasVisibleItems === false) {
                    $currentTrigger = null;
                    return;
                }

                // position menu
                opt.position.call($trigger, opt, x, y);

                // make sure we're in front
                if (opt.zIndex) {
                    var additionalZValue = opt.zIndex;
                    // If opt.zIndex is a function, call the function to get the right zIndex.
                    if (typeof opt.zIndex === 'function') {
                        additionalZValue = opt.zIndex.call($trigger, opt);
                    }
                    css.zIndex = zindex($trigger) + additionalZValue;
                }

                // add layer
                op.layer.call(opt.$menu, opt, css.zIndex);

                // adjust sub-menu zIndexes
                opt.$menu.find('ul').css('zIndex', css.zIndex + 1);

                // position and show context menu
                opt.$menu.css(css)[opt.animation.show](opt.animation.duration, function () {
                    $trigger.trigger('contextmenu:visible');

                    op.activated(opt);
                    opt.events.activated(opt);
                });
                // make options available and set state
                $trigger
                    .data('contextMenu', opt)
                    .addClass('context-menu-active');

                // register key handler
                $(document).off('keydown.contextMenu').on('keydown.contextMenu', handle.key);
                // register autoHide handler
                if (opt.autoHide) {
                    // mouse position handler
                    $(document).on('mousemove.contextMenuAutoHide', function (e) {
                        // need to capture the offset on mousemove,
                        // since the page might've been scrolled since activation
                        var pos = $trigger.offset();
                        pos.right = pos.left + $trigger.outerWidth();
                        pos.bottom = pos.top + $trigger.outerHeight();

                        if (opt.$layer && !opt.hovering && (!(e.pageX >= pos.left && e.pageX <= pos.right) || !(e.pageY >= pos.top && e.pageY <= pos.bottom))) {
                            /* Additional hover check after short time, you might just miss the edge of the menu */
                            setTimeout(function () {
                                if (!opt.hovering && opt.$menu !== null && typeof opt.$menu !== 'undefined') {
                                    opt.$menu.trigger('contextmenu:hide');
                                }
                            }, 50);
                        }
                    });
                }
            },
            hide: function (opt, force) {
                var $trigger = $(this);
                if (!opt) {
                    opt = $trigger.data('contextMenu') || {};
                }

                // hide event
                if (!force && opt.events && opt.events.hide.call($trigger, opt) === false) {
                    return;
                }

                // remove options and revert state
                $trigger
                    .removeData('contextMenu')
                    .removeClass('context-menu-active');

                if (opt.$layer) {
                    // keep layer for a bit so the contextmenu event can be aborted properly by opera
                    setTimeout((function ($layer) {
                        return function () {
                            $layer.remove();
                        };
                    })(opt.$layer), 10);

                    try {
                        delete opt.$layer;
                    } catch (e) {
                        opt.$layer = null;
                    }
                }

                // remove handle
                $currentTrigger = null;
                // remove selected
                opt.$menu.find('.' + opt.classNames.hover).trigger('contextmenu:blur');
                opt.$selected = null;
                // collapse all submenus
                opt.$menu.find('.' + opt.classNames.visible).removeClass(opt.classNames.visible);
                // unregister key and mouse handlers
                // $(document).off('.contextMenuAutoHide keydown.contextMenu'); // http://bugs.jquery.com/ticket/10705
                $(document).off('.contextMenuAutoHide').off('keydown.contextMenu');
                // hide menu
                if (opt.$menu) {
                    opt.$menu[opt.animation.hide](opt.animation.duration, function () {
                        // tear down dynamically built menu after animation is completed.
                        if (opt.build) {
                            opt.$menu.remove();
                            $.each(opt, function (key) {
                                switch (key) {
                                    case 'ns':
                                    case 'selector':
                                    case 'build':
                                    case 'trigger':
                                        return true;

                                    default:
                                        opt[key] = undefined;
                                        try {
                                            delete opt[key];
                                        } catch (e) {
                                        }
                                        return true;
                                }
                            });
                        }

                        setTimeout(function () {
                            $trigger.trigger('contextmenu:hidden');
                        }, 10);
                    });
                }
            },
            create: function (opt, root) {
                if (typeof root === 'undefined') {
                    root = opt;
                }

                // create contextMenu
                opt.$menu = $('<ul class="context-menu-list"></ul>').addClass(opt.className || '').data({
                    'contextMenu': opt,
                    'contextMenuRoot': root
                });

                $.each(['callbacks', 'commands', 'inputs'], function (i, k) {
                    opt[k] = {};
                    if (!root[k]) {
                        root[k] = {};
                    }
                });

                if (!root.accesskeys) {
                    root.accesskeys = {};
                }

                function createNameNode(item) {
                    var $name = $('<span></span>');
                    if (item._accesskey) {
                        if (item._beforeAccesskey) {
                            $name.append(document.createTextNode(item._beforeAccesskey));
                        }
                        $('<span></span>')
                            .addClass('context-menu-accesskey')
                            .text(item._accesskey)
                            .appendTo($name);
                        if (item._afterAccesskey) {
                            $name.append(document.createTextNode(item._afterAccesskey));
                        }
                    } else {
                        if (item.isHtmlName) {
                            // restrict use with access keys
                            if (typeof item.accesskey !== 'undefined') {
                                throw new Error('accesskeys are not compatible with HTML names and cannot be used together in the same item');
                            }
                            $name.html(item.name);
                        } else {
                            $name.text(item.name);
                        }
                    }
                    return $name;
                }

                // create contextMenu items
                $.each(opt.items, function (key, item) {
                    var $t = $('<li class="context-menu-item"></li>').addClass(item.className || ''),
                        $label = null,
                        $input = null;

                    // iOS needs to see a click-event bound to an element to actually
                    // have the TouchEvents infrastructure trigger the click event
                    $t.on('click', $.noop);

                    // Make old school string seperator a real item so checks wont be
                    // akward later.
                    // And normalize 'cm_separator' into 'cm_seperator'.
                    if (typeof item === 'string' || item.type === 'cm_separator') {
                        item = {type: 'cm_seperator'};
                    }

                    item.$node = $t.data({
                        'contextMenu': opt,
                        'contextMenuRoot': root,
                        'contextMenuKey': key
                    });

                    // register accesskey
                    // NOTE: the accesskey attribute should be applicable to any element, but Safari5 and Chrome13 still can't do that
                    if (typeof item.accesskey !== 'undefined') {
                        var aks = splitAccesskey(item.accesskey);
                        for (var i = 0, ak; ak = aks[i]; i++) {
                            if (!root.accesskeys[ak]) {
                                root.accesskeys[ak] = item;
                                var matched = item.name.match(new RegExp('^(.*?)(' + ak + ')(.*)$', 'i'));
                                if (matched) {
                                    item._beforeAccesskey = matched[1];
                                    item._accesskey = matched[2];
                                    item._afterAccesskey = matched[3];
                                }
                                break;
                            }
                        }
                    }

                    if (item.type && types[item.type]) {
                        // run custom type handler
                        types[item.type].call($t, item, opt, root);
                        // register commands
                        $.each([opt, root], function (i, k) {
                            k.commands[key] = item;
                            // Overwrite only if undefined or the item is appended to the root. This so it
                            // doesn't overwrite callbacks of root elements if the name is the same.
                            if ($.isFunction(item.callback) && (typeof k.callbacks[key] === 'undefined' || typeof opt.type === 'undefined')) {
                                k.callbacks[key] = item.callback;
                            }
                        });
                    } else {
                        // add label for input
                        if (item.type === 'cm_seperator') {
                            $t.addClass('context-menu-separator ' + root.classNames.notSelectable);
                        } else if (item.type === 'html') {
                            $t.addClass('context-menu-html ' + root.classNames.notSelectable);
                        } else if (item.type !== 'sub' && item.type) {
                            $label = $('<label></label>').appendTo($t);
                            createNameNode(item).appendTo($label);

                            $t.addClass('context-menu-input');
                            opt.hasTypes = true;
                            $.each([opt, root], function (i, k) {
                                k.commands[key] = item;
                                k.inputs[key] = item;
                            });
                        } else if (item.items) {
                            item.type = 'sub';
                        }

                        switch (item.type) {
                            case 'cm_seperator':
                                break;

                            case 'text':
                                $input = $('<input type="text" value="1" name="" />')
                                    .attr('name', 'context-menu-input-' + key)
                                    .val(item.value || '')
                                    .appendTo($label);
                                break;

                            case 'textarea':
                                $input = $('<textarea name=""></textarea>')
                                    .attr('name', 'context-menu-input-' + key)
                                    .val(item.value || '')
                                    .appendTo($label);

                                if (item.height) {
                                    $input.height(item.height);
                                }
                                break;

                            case 'checkbox':
                                $input = $('<input type="checkbox" value="1" name="" />')
                                    .attr('name', 'context-menu-input-' + key)
                                    .val(item.value || '')
                                    .prop('checked', !!item.selected)
                                    .prependTo($label);
                                break;

                            case 'radio':
                                $input = $('<input type="radio" value="1" name="" />')
                                    .attr('name', 'context-menu-input-' + item.radio)
                                    .val(item.value || '')
                                    .prop('checked', !!item.selected)
                                    .prependTo($label);
                                break;

                            case 'select':
                                $input = $('<select name=""></select>')
                                    .attr('name', 'context-menu-input-' + key)
                                    .appendTo($label);
                                if (item.options) {
                                    $.each(item.options, function (value, text) {
                                        $('<option></option>').val(value).text(text).appendTo($input);
                                    });
                                    $input.val(item.selected);
                                }
                                break;

                            case 'sub':
                                createNameNode(item).appendTo($t);
                                item.appendTo = item.$node;
                                $t.data('contextMenu', item).addClass('context-menu-submenu');
                                item.callback = null;

                                // If item contains items, and this is a promise, we should create it later
                                // check if subitems is of type promise. If it is a promise we need to create
                                // it later, after promise has been resolved.
                                if ('function' === typeof item.items.then) {
                                    // probably a promise, process it, when completed it will create the sub menu's.
                                    op.processPromises(item, root, item.items);
                                } else {
                                    // normal submenu.
                                    op.create(item, root);
                                }
                                break;

                            case 'html':
                                $(item.html).appendTo($t);
                                break;

                            default:
                                $.each([opt, root], function (i, k) {
                                    k.commands[key] = item;
                                    // Overwrite only if undefined or the item is appended to the root. This so it
                                    // doesn't overwrite callbacks of root elements if the name is the same.
                                    if ($.isFunction(item.callback) && (typeof k.callbacks[key] === 'undefined' || typeof opt.type === 'undefined')) {
                                        k.callbacks[key] = item.callback;
                                    }
                                });
                                createNameNode(item).appendTo($t);
                                break;
                        }

                        // disable key listener in <input>
                        if (item.type && item.type !== 'sub' && item.type !== 'html' && item.type !== 'cm_seperator') {
                            $input
                                .on('focus', handle.focusInput)
                                .on('blur', handle.blurInput);

                            if (item.events) {
                                $input.on(item.events, opt);
                            }
                        }

                        // add icons
                        if (item.icon) {
                            if ($.isFunction(item.icon)) {
                                item._icon = item.icon.call(this, this, $t, key, item);
                            } else {
                                if (typeof(item.icon) === 'string' && (
                                    item.icon.substring(0, 4) === 'fab '
                                    || item.icon.substring(0, 4) === 'fas '
                                    || item.icon.substring(0, 4) === 'far '
                                    || item.icon.substring(0, 4) === 'fal ')
                                ) {
                                    // to enable font awesome
                                    $t.addClass(root.classNames.icon + ' ' + root.classNames.icon + '--fa5');
                                    item._icon = $('<i class="' + item.icon + '"></i>');
                                } else if (typeof(item.icon) === 'string' && item.icon.substring(0, 3) === 'fa-') {
                                    item._icon = root.classNames.icon + ' ' + root.classNames.icon + '--fa fa ' + item.icon;
                                } else {
                                    item._icon = root.classNames.icon + ' ' + root.classNames.icon + '-' + item.icon;
                                }
                            }

                            if(typeof(item._icon) === "string"){
                                $t.addClass(item._icon);
                            } else {
                                $t.prepend(item._icon);
                            }
                        }
                    }

                    // cache contained elements
                    item.$input = $input;
                    item.$label = $label;

                    // attach item to menu
                    $t.appendTo(opt.$menu);

                    // Disable text selection
                    if (!opt.hasTypes && $.support.eventSelectstart) {
                        // browsers support user-select: none,
                        // IE has a special event for text-selection
                        // browsers supporting neither will not be preventing text-selection
                        $t.on('selectstart.disableTextSelect', handle.abortevent);
                    }
                });
                // attach contextMenu to <body> (to bypass any possible overflow:hidden issues on parents of the trigger element)
                if (!opt.$node) {
                    opt.$menu.css('display', 'none').addClass('context-menu-root');
                }
                opt.$menu.appendTo(opt.appendTo || document.body);
            },
            resize: function ($menu, nested) {
                var domMenu;
                // determine widths of submenus, as CSS won't grow them automatically
                // position:absolute within position:absolute; min-width:100; max-width:200; results in width: 100;
                // kinda sucks hard...

                // determine width of absolutely positioned element
                $menu.css({position: 'absolute', display: 'block'});
                // don't apply yet, because that would break nested elements' widths
                $menu.data('width',
                    (domMenu = $menu.get(0)).getBoundingClientRect ?
                        Math.ceil(domMenu.getBoundingClientRect().width) :
                        $menu.outerWidth() + 1); // outerWidth() returns rounded pixels
                // reset styles so they allow nested elements to grow/shrink naturally
                $menu.css({
                    position: 'static',
                    minWidth: '0px',
                    maxWidth: '100000px'
                });
                // identify width of nested menus
                $menu.find('> li > ul').each(function () {
                    op.resize($(this), true);
                });
                // reset and apply changes in the end because nested
                // elements' widths wouldn't be calculatable otherwise
                if (!nested) {
                    $menu.find('ul').addBack().css({
                        position: '',
                        display: '',
                        minWidth: '',
                        maxWidth: ''
                    }).outerWidth(function () {
                        return $(this).data('width');
                    });
                }
            },
            update: function (opt, root) {
                var $trigger = this;
                if (typeof root === 'undefined') {
                    root = opt;
                    op.resize(opt.$menu);
                }

                var hasVisibleItems = false;

                // re-check disabled for each item
                opt.$menu.children().each(function () {
                    var $item = $(this),
                        key = $item.data('contextMenuKey'),
                        item = opt.items[key],
                        disabled = ($.isFunction(item.disabled) && item.disabled.call($trigger, key, root)) || item.disabled === true,
                        visible;
                    if ($.isFunction(item.visible)) {
                        visible = item.visible.call($trigger, key, root);
                    } else if (typeof item.visible !== 'undefined') {
                        visible = item.visible === true;
                    } else {
                        visible = true;
                    }

                    if (visible) {
                        hasVisibleItems = true;
                    }

                    $item[visible ? 'show' : 'hide']();

                    // dis- / enable item
                    $item[disabled ? 'addClass' : 'removeClass'](root.classNames.disabled);

                    if ($.isFunction(item.icon)) {
                        $item.removeClass(item._icon);
                        var iconResult = item.icon.call(this, $trigger, $item, key, item);
                        if(typeof(iconResult) === "string"){
                            $item.addClass(iconResult);
                        } else {
                            $item.prepend(iconResult);
                        }
                    }

                    if (item.type) {
                        // dis- / enable input elements
                        $item.find('input, select, textarea').prop('disabled', disabled);

                        // update input states
                        switch (item.type) {
                            case 'text':
                            case 'textarea':
                                item.$input.val(item.value || '');
                                break;

                            case 'checkbox':
                            case 'radio':
                                item.$input.val(item.value || '').prop('checked', !!item.selected);
                                break;

                            case 'select':
                                item.$input.val((item.selected === 0 ? "0" : item.selected) || '');
                                break;
                        }
                    }

                    if (item.$menu) {
                        // update sub-menu
                        var subMenuHasVisibleItems = op.update.call($trigger, item, root);
                        if (subMenuHasVisibleItems) {
                            hasVisibleItems = true;
                        }
                    }
                });
                return hasVisibleItems;
            },
            layer: function (opt, zIndex) {
                // add transparent layer for click area
                // filter and background for Internet Explorer, Issue #23
                var $layer = opt.$layer = $('<div id="context-menu-layer"></div>')
                    .css({
                        height: $win.height(),
                        width: $win.width(),
                        display: 'block',
                        position: 'fixed',
                        'z-index': zIndex,
                        top: 0,
                        left: 0,
                        opacity: 0,
                        filter: 'alpha(opacity=0)',
                        'background-color': '#000'
                    })
                    .data('contextMenuRoot', opt)
                    .insertBefore(this)
                    .on('contextmenu', handle.abortevent)
                    .on('mousedown', handle.layerClick);

                // IE6 doesn't know position:fixed;
                if (typeof document.body.style.maxWidth === 'undefined') { // IE6 doesn't support maxWidth
                    $layer.css({
                        'position': 'absolute',
                        'height': $(document).height()
                    });
                }

                return $layer;
            },
            processPromises: function (opt, root, promise) {
                // Start
                opt.$node.addClass(root.classNames.iconLoadingClass);

                function completedPromise(opt, root, items) {
                    // Completed promise (dev called promise.resolve). We now have a list of items which can
                    // be used to create the rest of the context menu.
                    if (typeof items === 'undefined') {
                        // Null result, dev should have checked
                        errorPromise(undefined);//own error object
                    }
                    finishPromiseProcess(opt, root, items);
                }

                function errorPromise(opt, root, errorItem) {
                    // User called promise.reject() with an error item, if not, provide own error item.
                    if (typeof errorItem === 'undefined') {
                        errorItem = {
                            "error": {
                                name: "No items and no error item",
                                icon: "context-menu-icon context-menu-icon-quit"
                            }
                        };
                        if (window.console) {
                            (console.error || console.log).call(console, 'When you reject a promise, provide an "items" object, equal to normal sub-menu items');
                        }
                    } else if (typeof errorItem === 'string') {
                        errorItem = {"error": {name: errorItem}};
                    }
                    finishPromiseProcess(opt, root, errorItem);
                }

                function finishPromiseProcess(opt, root, items) {
                    if (typeof root.$menu === 'undefined' || !root.$menu.is(':visible')) {
                        return;
                    }
                    opt.$node.removeClass(root.classNames.iconLoadingClass);
                    opt.items = items;
                    op.create(opt, root, true); // Create submenu
                    op.update(opt, root); // Correctly update position if user is already hovered over menu item
                    root.positionSubmenu.call(opt.$node, opt.$menu); // positionSubmenu, will only do anything if user already hovered over menu item that just got new subitems.
                }

                // Wait for promise completion. .then(success, error, notify) (we don't track notify). Bind the opt
                // and root to avoid scope problems
                promise.then(completedPromise.bind(this, opt, root), errorPromise.bind(this, opt, root));
            },
            // operation that will run after contextMenu showed on screen
            activated: function(opt){
                var $menu = opt.$menu;
                var $menuOffset = $menu.offset();
                var winHeight = $(window).height();
                var winScrollTop = $(window).scrollTop();
                var menuHeight = $menu.height();
                if(menuHeight > winHeight){
                    $menu.css({
                        'height' : winHeight + 'px',
                        'overflow-x': 'hidden',
                        'overflow-y': 'auto',
                        'top': winScrollTop + 'px'
                    });
                } else if(($menuOffset.top < winScrollTop) || ($menuOffset.top + menuHeight > winScrollTop + winHeight)){
                    $menu.css({
                        'top': winScrollTop + 'px'
                    });
                }
            }
        };

    // split accesskey according to http://www.whatwg.org/specs/web-apps/current-work/multipage/editing.html#assigned-access-key
    function splitAccesskey(val) {
        var t = val.split(/\s+/);
        var keys = [];

        for (var i = 0, k; k = t[i]; i++) {
            k = k.charAt(0).toUpperCase(); // first character only
            // theoretically non-accessible characters should be ignored, but different systems, different keyboard layouts, ... screw it.
            // a map to look up already used access keys would be nice
            keys.push(k);
        }

        return keys;
    }

// handle contextMenu triggers
    $.fn.contextMenu = function (operation) {
        var $t = this, $o = operation;
        if (this.length > 0) {  // this is not a build on demand menu
            if (typeof operation === 'undefined') {
                this.first().trigger('contextmenu');
            } else if (typeof operation.x !== 'undefined' && typeof operation.y !== 'undefined') {
                this.first().trigger($.Event('contextmenu', {
                    pageX: operation.x,
                    pageY: operation.y,
                    mouseButton: operation.button
                }));
            } else if (operation === 'hide') {
                var $menu = this.first().data('contextMenu') ? this.first().data('contextMenu').$menu : null;
                if ($menu) {
                    $menu.trigger('contextmenu:hide');
                }
            } else if (operation === 'destroy') {
                $.contextMenu('destroy', {context: this});
            } else if ($.isPlainObject(operation)) {
                operation.context = this;
                $.contextMenu('create', operation);
            } else if (operation) {
                this.removeClass('context-menu-disabled');
            } else if (!operation) {
                this.addClass('context-menu-disabled');
            }
        } else {
            $.each(menus, function () {
                if (this.selector === $t.selector) {
                    $o.data = this;

                    $.extend($o.data, {trigger: 'demand'});
                }
            });

            handle.contextmenu.call($o.target, $o);
        }

        return this;
    };

    // manage contextMenu instances
    $.contextMenu = function (operation, options) {
        if (typeof operation !== 'string') {
            options = operation;
            operation = 'create';
        }

        if (typeof options === 'string') {
            options = {selector: options};
        } else if (typeof options === 'undefined') {
            options = {};
        }

        // merge with default options
        var o = $.extend(true, {}, defaults, options || {});
        var $document = $(document);
        var $context = $document;
        var _hasContext = false;

        if (!o.context || !o.context.length) {
            o.context = document;
        } else {
            // you never know what they throw at you...
            $context = $(o.context).first();
            o.context = $context.get(0);
            _hasContext = !$(o.context).is(document);
        }

        switch (operation) {

            case 'update':
                // Updates visibility and such
                if(_hasContext){
                    op.update($context);
                } else {
                    for(var menu in menus){
                        if(menus.hasOwnProperty(menu)){
                            op.update(menus[menu]);
                        }
                    }
                }
                break;

            case 'create':
                // no selector no joy
                if (!o.selector) {
                    throw new Error('No selector specified');
                }
                // make sure internal classes are not bound to
                if (o.selector.match(/.context-menu-(list|item|input)($|\s)/)) {
                    throw new Error('Cannot bind to selector "' + o.selector + '" as it contains a reserved className');
                }
                if (!o.build && (!o.items || $.isEmptyObject(o.items))) {
                    throw new Error('No Items specified');
                }
                counter++;
                o.ns = '.contextMenu' + counter;
                if (!_hasContext) {
                    namespaces[o.selector] = o.ns;
                }
                menus[o.ns] = o;

                // default to right click
                if (!o.trigger) {
                    o.trigger = 'right';
                }

                if (!initialized) {
                    var itemClick = o.itemClickEvent === 'click' ? 'click.contextMenu' : 'mouseup.contextMenu';
                    var contextMenuItemObj = {
                        // 'mouseup.contextMenu': handle.itemClick,
                        // 'click.contextMenu': handle.itemClick,
                        'contextmenu:focus.contextMenu': handle.focusItem,
                        'contextmenu:blur.contextMenu': handle.blurItem,
                        'contextmenu.contextMenu': handle.abortevent,
                        'mouseenter.contextMenu': handle.itemMouseenter,
                        'mouseleave.contextMenu': handle.itemMouseleave
                    };
                    contextMenuItemObj[itemClick] = handle.itemClick;
                    // make sure item click is registered first
                    $document
                        .on({
                            'contextmenu:hide.contextMenu': handle.hideMenu,
                            'prevcommand.contextMenu': handle.prevItem,
                            'nextcommand.contextMenu': handle.nextItem,
                            'contextmenu.contextMenu': handle.abortevent,
                            'mouseenter.contextMenu': handle.menuMouseenter,
                            'mouseleave.contextMenu': handle.menuMouseleave
                        }, '.context-menu-list')
                        .on('mouseup.contextMenu', '.context-menu-input', handle.inputClick)
                        .on(contextMenuItemObj, '.context-menu-item');

                    initialized = true;
                }

                // engage native contextmenu event
                $context
                    .on('contextmenu' + o.ns, o.selector, o, handle.contextmenu);

                if (_hasContext) {
                    // add remove hook, just in case
                    $context.on('remove' + o.ns, function () {
                        $(this).contextMenu('destroy');
                    });
                }

                switch (o.trigger) {
                    case 'hover':
                        $context
                            .on('mouseenter' + o.ns, o.selector, o, handle.mouseenter)
                            .on('mouseleave' + o.ns, o.selector, o, handle.mouseleave);
                        break;

                    case 'left':
                        $context.on('click' + o.ns, o.selector, o, handle.click);
                        break;
				    case 'touchstart':
                        $context.on('touchstart' + o.ns, o.selector, o, handle.click);
                        break;
                    /*
                     default:
                     // http://www.quirksmode.org/dom/events/contextmenu.html
                     $document
                     .on('mousedown' + o.ns, o.selector, o, handle.mousedown)
                     .on('mouseup' + o.ns, o.selector, o, handle.mouseup);
                     break;
                     */
                }

                // create menu
                if (!o.build) {
                    op.create(o);
                }
                break;

            case 'destroy':
                var $visibleMenu;
                if (_hasContext) {
                    // get proper options
                    var context = o.context;
                    $.each(menus, function (ns, o) {

                        if (!o) {
                            return true;
                        }

                        // Is this menu equest to the context called from
                        if (!$(context).is(o.selector)) {
                            return true;
                        }

                        $visibleMenu = $('.context-menu-list').filter(':visible');
                        if ($visibleMenu.length && $visibleMenu.data().contextMenuRoot.$trigger.is($(o.context).find(o.selector))) {
                            $visibleMenu.trigger('contextmenu:hide', {force: true});
                        }

                        try {
                            if (menus[o.ns].$menu) {
                                menus[o.ns].$menu.remove();
                            }

                            delete menus[o.ns];
                        } catch (e) {
                            menus[o.ns] = null;
                        }

                        $(o.context).off(o.ns);

                        return true;
                    });
                } else if (!o.selector) {
                    $document.off('.contextMenu .contextMenuAutoHide');
                    $.each(menus, function (ns, o) {
                        $(o.context).off(o.ns);
                    });

                    namespaces = {};
                    menus = {};
                    counter = 0;
                    initialized = false;

                    $('#context-menu-layer, .context-menu-list').remove();
                } else if (namespaces[o.selector]) {
                    $visibleMenu = $('.context-menu-list').filter(':visible');
                    if ($visibleMenu.length && $visibleMenu.data().contextMenuRoot.$trigger.is(o.selector)) {
                        $visibleMenu.trigger('contextmenu:hide', {force: true});
                    }

                    try {
                        if (menus[namespaces[o.selector]].$menu) {
                            menus[namespaces[o.selector]].$menu.remove();
                        }

                        delete menus[namespaces[o.selector]];
                    } catch (e) {
                        menus[namespaces[o.selector]] = null;
                    }

                    $document.off(namespaces[o.selector]);
                }
                break;

            case 'html5':
                // if <command> and <menuitem> are not handled by the browser,
                // or options was a bool true,
                // initialize $.contextMenu for them
                if ((!$.support.htmlCommand && !$.support.htmlMenuitem) || (typeof options === 'boolean' && options)) {
                    $('menu[type="context"]').each(function () {
                        if (this.id) {
                            $.contextMenu({
                                selector: '[contextmenu=' + this.id + ']',
                                items: $.contextMenu.fromMenu(this)
                            });
                        }
                    }).css('display', 'none');
                }
                break;

            default:
                throw new Error('Unknown operation "' + operation + '"');
        }

        return this;
    };

// import values into <input> commands
    $.contextMenu.setInputValues = function (opt, data) {
        if (typeof data === 'undefined') {
            data = {};
        }

        $.each(opt.inputs, function (key, item) {
            switch (item.type) {
                case 'text':
                case 'textarea':
                    item.value = data[key] || '';
                    break;

                case 'checkbox':
                    item.selected = data[key] ? true : false;
                    break;

                case 'radio':
                    item.selected = (data[item.radio] || '') === item.value;
                    break;

                case 'select':
                    item.selected = data[key] || '';
                    break;
            }
        });
    };

// export values from <input> commands
    $.contextMenu.getInputValues = function (opt, data) {
        if (typeof data === 'undefined') {
            data = {};
        }

        $.each(opt.inputs, function (key, item) {
            switch (item.type) {
                case 'text':
                case 'textarea':
                case 'select':
                    data[key] = item.$input.val();
                    break;

                case 'checkbox':
                    data[key] = item.$input.prop('checked');
                    break;

                case 'radio':
                    if (item.$input.prop('checked')) {
                        data[item.radio] = item.value;
                    }
                    break;
            }
        });

        return data;
    };

// find <label for="xyz">
    function inputLabel(node) {
        return (node.id && $('label[for="' + node.id + '"]').val()) || node.name;
    }

// convert <menu> to items object
    function menuChildren(items, $children, counter) {
        if (!counter) {
            counter = 0;
        }

        $children.each(function () {
            var $node = $(this),
                node = this,
                nodeName = this.nodeName.toLowerCase(),
                label,
                item;

            // extract <label><input>
            if (nodeName === 'label' && $node.find('input, textarea, select').length) {
                label = $node.text();
                $node = $node.children().first();
                node = $node.get(0);
                nodeName = node.nodeName.toLowerCase();
            }

            /*
             * <menu> accepts flow-content as children. that means <embed>, <canvas> and such are valid menu items.
             * Not being the sadistic kind, $.contextMenu only accepts:
             * <command>, <menuitem>, <hr>, <span>, <p> <input [text, radio, checkbox]>, <textarea>, <select> and of course <menu>.
             * Everything else will be imported as an html node, which is not interfaced with contextMenu.
             */

            // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#concept-command
            switch (nodeName) {
                // http://www.whatwg.org/specs/web-apps/current-work/multipage/interactive-elements.html#the-menu-element
                case 'menu':
                    item = {name: $node.attr('label'), items: {}};
                    counter = menuChildren(item.items, $node.children(), counter);
                    break;

                // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-a-element-to-define-a-command
                case 'a':
                // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-button-element-to-define-a-command
                case 'button':
                    item = {
                        name: $node.text(),
                        disabled: !!$node.attr('disabled'),
                        callback: (function () {
                            return function () {
                                $node.get(0).click();
                            };
                        })()
                    };
                    break;

                // http://www.whatwg.org/specs/web-apps/current-work/multipage/commands.html#using-the-command-element-to-define-a-command
                case 'menuitem':
                case 'command':
                    switch ($node.attr('type')) {
                        case undefined:
                        case 'command':
                        case 'menuitem':
                            item = {
                                name: $node.attr('label'),
                                disabled: !!$node.attr('disabled'),
                                icon: $node.attr('icon'),
                                callback: (function () {
                                    return function () {
                                        $node.get(0).click();
                                    };
                                })()
                            };
                            break;

                        case 'checkbox':
                            item = {
                                type: 'checkbox',
                                disabled: !!$node.attr('disabled'),
                                name: $node.attr('label'),
                                selected: !!$node.attr('checked')
                            };
                            break;
                        case 'radio':
                            item = {
                                type: 'radio',
                                disabled: !!$node.attr('disabled'),
                                name: $node.attr('label'),
                                radio: $node.attr('radiogroup'),
                                value: $node.attr('id'),
                                selected: !!$node.attr('checked')
                            };
                            break;

                        default:
                            item = undefined;
                    }
                    break;

                case 'hr':
                    item = '-------';
                    break;

                case 'input':
                    switch ($node.attr('type')) {
                        case 'text':
                            item = {
                                type: 'text',
                                name: label || inputLabel(node),
                                disabled: !!$node.attr('disabled'),
                                value: $node.val()
                            };
                            break;

                        case 'checkbox':
                            item = {
                                type: 'checkbox',
                                name: label || inputLabel(node),
                                disabled: !!$node.attr('disabled'),
                                selected: !!$node.attr('checked')
                            };
                            break;

                        case 'radio':
                            item = {
                                type: 'radio',
                                name: label || inputLabel(node),
                                disabled: !!$node.attr('disabled'),
                                radio: !!$node.attr('name'),
                                value: $node.val(),
                                selected: !!$node.attr('checked')
                            };
                            break;

                        default:
                            item = undefined;
                            break;
                    }
                    break;

                case 'select':
                    item = {
                        type: 'select',
                        name: label || inputLabel(node),
                        disabled: !!$node.attr('disabled'),
                        selected: $node.val(),
                        options: {}
                    };
                    $node.children().each(function () {
                        item.options[this.value] = $(this).text();
                    });
                    break;

                case 'textarea':
                    item = {
                        type: 'textarea',
                        name: label || inputLabel(node),
                        disabled: !!$node.attr('disabled'),
                        value: $node.val()
                    };
                    break;

                case 'label':
                    break;

                default:
                    item = {type: 'html', html: $node.clone(true)};
                    break;
            }

            if (item) {
                counter++;
                items['key' + counter] = item;
            }
        });

        return counter;
    }

// convert html5 menu
    $.contextMenu.fromMenu = function (element) {
        var $this = $(element),
            items = {};

        menuChildren(items, $this.children());

        return items;
    };

// make defaults accessible
    $.contextMenu.defaults = defaults;
    $.contextMenu.types = types;
// export internal functions - undocumented, for hacking only!
    $.contextMenu.handle = handle;
    $.contextMenu.op = op;
    $.contextMenu.menus = menus;
});

/**!
 * jquery.fancytree.contextmenu.js
 *
 * Integrate the 'jQuery contextMenu' plugin as Fancytree extension:
 * https://github.com/swisnl/jQuery-contextMenu
 *
 * Copyright (c) 2008-2018, Martin Wendt (https://wwWendt.de)
 * Released under the MIT license
 * https://github.com/mar10/fancytree/wiki/LicenseInfo
 */
(function($, document) {
	"use strict";

	var initContextMenu = function(tree, selector, menu, actions) {
		tree.$container.on("mousedown.contextMenu", function(event) {
			var node = $.ui.fancytree.getNode(event);

			if (node) {
				$.contextMenu("destroy", "." + selector);

				node.setFocus(true);
				node.setActive(true);

				$.contextMenu({
					selector: "." + selector,
					events: {
						show: function(options) {
							options.prevKeyboard = tree.options.keyboard;
							tree.options.keyboard = false;
						},
						hide: function(options) {
							tree.options.keyboard = options.prevKeyboard;
							node.setFocus(true);
						},
					},
					build: function($trigger, e) {
						node = $.ui.fancytree.getNode($trigger);

						var menuItems = {};
						if ($.isFunction(menu)) {
							menuItems = menu(node);
						} else if ($.isPlainObject(menu)) {
							menuItems = menu;
						}

						return {
							callback: function(action, options) {
								if ($.isFunction(actions)) {
									actions(node, action, options);
								} else if ($.isPlainObject(actions)) {
									if (
										actions.hasOwnProperty(action) &&
										$.isFunction(actions[action])
									) {
										actions[action](node, options);
									}
								}
							},
							items: menuItems,
						};
					},
				});
			}
		});
	};

	$.ui.fancytree.registerExtension({
		name: "contextMenu",
		version: "@VERSION",
		contextMenu: {
			selector: "fancytree-title",
			menu: {},
			actions: {},
		},
		treeInit: function(ctx) {
			this._superApply(arguments);
			initContextMenu(
				ctx.tree,
				ctx.options.contextMenu.selector || "fancytree-title",
				ctx.options.contextMenu.menu,
				ctx.options.contextMenu.actions
			);
		},
	});
})(jQuery, document);

/*!
 * jquery.fancytree.glyph.js
 *
 * Use glyph fonts as instead of icon sprites.
 * (Extension module for jquery.fancytree.js: https://github.com/mar10/fancytree/)
 *
 * Copyright (c) 2008-2016, Martin Wendt (http://wwWendt.de)
 *
 * Released under the MIT license
 * https://github.com/mar10/fancytree/wiki/LicenseInfo
 *
 * @version @VERSION
 * @date @DATE
 */

;(function($, window, document, undefined) {

    "use strict";
    
    /* *****************************************************************************
     * Private functions and variables
     */
    
    function _getIcon(opts, type){
        return opts.map[type];
    }
    
    $.ui.fancytree.registerExtension({
        name: "glyph",
        version: "0.4.0",
        // Default options for this extension.
        options: {
            map: {
                // Samples from Font Awesome 3.2
                //   http://fortawesome.github.io/Font-Awesome/3.2.1/icons/
                // See here for alternatives:
                //   http://fortawesome.github.io/Font-Awesome/icons/
                //   http://getbootstrap.com/components/
                checkbox: "icon-check-empty",
                checkboxSelected: "icon-check",
                checkboxUnknown: "icon-check icon-muted",
                error: "icon-exclamation-sign",
                expanderClosed: "icon-caret-right",
                expanderLazy: "icon-angle-right",
                expanderOpen: "icon-caret-down",
                noExpander: "",
                dragHelper: "icon-caret-right",
                dropMarker: "icon-caret-right",
                // Default node icons.
                // (Use tree.options.icon callback to define custom icons
                // based on node data)
                doc: "icon-file-alt",
                docOpen: "icon-file-alt",
                loading: "icon-refresh icon-spin",
                folder: "icon-folder-close-alt",
                folderOpen: "icon-folder-open-alt"
            }
        },
    
        treeInit: function(ctx){
            var tree = ctx.tree;
            this._superApply(arguments);
            tree.$container.addClass("fancytree-ext-glyph");
        },
        nodeRenderStatus: function(ctx) {
            var icon, res, span,
                node = ctx.node,
                $span = $(node.span),
                opts = ctx.options.glyph,
                map = opts.map;
    
            res = this._superApply(arguments);
    
            if( node.isRoot() ){
                return res;
            }
            span = $span.children("span.fancytree-expander").get(0);
            if( span ){
                // if( node.isLoading() ){
                    // icon = "loading";
                if( node.statusNodeType ){
                    icon = node.statusNodeType; // loading, error
                }else if( node.expanded ){
                    icon = "expanderOpen";
                }else if( node.isUndefined() ){
                    icon = "expanderLazy";
                }else if( node.hasChildren() ){
                    icon = "expanderClosed";
                }else{
                    icon = "noExpander";
                }
                span.className = "fancytree-expander " + map[icon];
            }
    
            if( node.tr ){
                span = $("td", node.tr).find("span.fancytree-checkbox").get(0);
            }else{
                span = $span.children("span.fancytree-checkbox").get(0);
            }
            if( span ){
                icon = node.selected ? "checkboxSelected" : (node.partsel ? "checkboxUnknown" : "checkbox");
                span.className = "fancytree-checkbox " + map[icon];
            }
    
            // Standard icon (note that this does not match .fancytree-custom-icon,
            // that might be set by opts.icon callbacks)
            span = $span.children("span.fancytree-icon").get(0);
            if( span ){
                if( node.folder ){
                    icon = node.expanded ? _getIcon(opts, "folderOpen") : _getIcon(opts, "folder");
                }else{
                    icon = node.expanded ? _getIcon(opts, "docOpen") : _getIcon(opts, "doc");
                }
                span.className = "fancytree-icon " + icon;
            }
            return res;
        },
        nodeSetStatus: function(ctx, status, message, details) {
            var res, span,
                opts = ctx.options.glyph,
                node = ctx.node;
    
            res = this._superApply(arguments);
    
            if(node.parent){
                span = $("span.fancytree-expander", node.span).get(0);
            }else{
                span = $(".fancytree-statusnode-loading, .fancytree-statusnode-error", node[this.nodeContainerAttrName])
                    .find("span.fancytree-expander").get(0);
            }
            if( status === "loading" ){
                span.className = "fancytree-expander " + _getIcon(opts, "loading");
            }else if( status === "error" ){
                span.className = "fancytree-expander " + _getIcon(opts, "error");
            }
            return res;
        }
    });
}(jQuery, window, document));

/*!
 * jquery.fancytree.persist.js
 *
 * Persist tree status in cookiesRemove or highlight tree nodes, based on a filter.
 * (Extension module for jquery.fancytree.js: https://github.com/mar10/fancytree/)
 *
 * @depends: js-cookie or jquery-cookie
 *
 * Copyright (c) 2008-2016, Martin Wendt (http://wwWendt.de)
 *
 * Released under the MIT license
 * https://github.com/mar10/fancytree/wiki/LicenseInfo
 *
 * @version @VERSION
 * @date @DATE
 */

;(function($, window, document, undefined) {

	"use strict";
	/* global Cookies:false */
	
	/*******************************************************************************
	 * Private functions and variables
	 */
	var cookieGetter, cookieRemover, cookieSetter,
		_assert = $.ui.fancytree.assert,
		ACTIVE = "active",
		EXPANDED = "expanded",
		FOCUS = "focus",
		SELECTED = "selected";
	
	if( typeof Cookies === "function" ) {
		// Assume https://github.com/js-cookie/js-cookie
		cookieSetter = Cookies.set;
		cookieGetter = Cookies.get;
		cookieRemover = Cookies.remove;
	} else {
		// Fall back to https://github.com/carhartl/jquery-cookie
		cookieSetter = cookieGetter = $.cookie;
		cookieRemover = $.removeCookie;
	}
	
	/* Recursively load lazy nodes
	 * @param {string} mode 'load', 'expand', false
	 */
	function _loadLazyNodes(tree, local, keyList, mode, dfd) {
		var i, key, l, node,
			foundOne = false,
			deferredList = [],
			missingKeyList = [];
	
		keyList = keyList || [];
		dfd = dfd || $.Deferred();
	
		for( i=0, l=keyList.length; i<l; i++ ) {
			key = keyList[i];
			node = tree.getNodeByKey(key);
			if( node ) {
				if( mode && node.isUndefined() ) {
					foundOne = true;
					tree.debug("_loadLazyNodes: " + node + " is lazy: loading...");
					if( mode === "expand" ) {
						deferredList.push(node.setExpanded());
					} else {
						deferredList.push(node.load());
					}
				} else {
					tree.debug("_loadLazyNodes: " + node + " already loaded.");
					node.setExpanded();
				}
			} else {
				missingKeyList.push(key);
				tree.debug("_loadLazyNodes: " + node + " was not yet found.");
			}
		}
	
		$.when.apply($, deferredList).always(function(){
			// All lazy-expands have finished
			if( foundOne && missingKeyList.length > 0 ) {
				// If we read new nodes from server, try to resolve yet-missing keys
				_loadLazyNodes(tree, local, missingKeyList, mode, dfd);
			} else {
				if( missingKeyList.length ) {
					tree.warn("_loadLazyNodes: could not load those keys: ", missingKeyList);
					for( i=0, l=missingKeyList.length; i<l; i++ ) {
						key = keyList[i];
						local._appendKey(EXPANDED, keyList[i], false);
					}
				}
				dfd.resolve();
			}
		});
		return dfd;
	}
	
	
	/**
	 * [ext-persist] Remove persistence cookies of the given type(s).
	 * Called like
	 *     $("#tree").fancytree("getTree").clearCookies("active expanded focus selected");
	 *
	 * @alias Fancytree#clearCookies
	 * @requires jquery.fancytree.persist.js
	 */
	$.ui.fancytree._FancytreeClass.prototype.clearCookies = function(types){
		var local = this.ext.persist,
			prefix = local.cookiePrefix;
	
		types = types || "active expanded focus selected";
		if(types.indexOf(ACTIVE) >= 0){
			local._data(prefix + ACTIVE, null);
		}
		if(types.indexOf(EXPANDED) >= 0){
			local._data(prefix + EXPANDED, null);
		}
		if(types.indexOf(FOCUS) >= 0){
			local._data(prefix + FOCUS, null);
		}
		if(types.indexOf(SELECTED) >= 0){
			local._data(prefix + SELECTED, null);
		}
	};
	
	
	/**
	 * [ext-persist] Return persistence information from cookies
	 *
	 * Called like
	 *     $("#tree").fancytree("getTree").getPersistData();
	 *
	 * @alias Fancytree#getPersistData
	 * @requires jquery.fancytree.persist.js
	 */
	$.ui.fancytree._FancytreeClass.prototype.getPersistData = function(){
		var local = this.ext.persist,
			prefix = local.cookiePrefix,
			delim = local.cookieDelimiter,
			res = {};
	
		res[ACTIVE] = local._data(prefix + ACTIVE);
		res[EXPANDED] = (local._data(prefix + EXPANDED) || "").split(delim);
		res[SELECTED] = (local._data(prefix + SELECTED) || "").split(delim);
		res[FOCUS] = local._data(prefix + FOCUS);
		return res;
	};
	
	
	/* *****************************************************************************
	 * Extension code
	 */
	$.ui.fancytree.registerExtension({
		name: "persist",
		version: "0.3.0",
		// Default options for this extension.
		options: {
			cookieDelimiter: "~",
			cookiePrefix: undefined, // 'fancytree-<treeId>-' by default
			cookie: {
				raw: false,
				expires: "",
				path: "",
				domain: "",
				secure: false
			},
			expandLazy: false,     // true: recursively expand and load lazy nodes
			fireActivate: true,    // false: suppress `activate` event after active node was restored
			overrideSource: true,  // true: cookie takes precedence over `source` data attributes.
			store: "auto",         // 'cookie': force cookie, 'local': force localStore, 'session': force sessionStore
			types: "active expanded focus selected"
		},
	
		/* Generic read/write string data to cookie, sessionStorage or localStorage. */
		_data: function(key, value){
			var ls = this._local.localStorage; // null, sessionStorage, or localStorage
	
			if( value === undefined ) {
				return ls ? ls.getItem(key) : cookieGetter(key);
			} else if ( value === null ) {
				if( ls ) {
					ls.removeItem(key);
				} else {
					cookieRemover(key);
				}
			} else {
				if( ls ) {
					ls.setItem(key, value);
				} else {
					cookieSetter(key, value, this.options.persist.cookie);
				}
			}
		},
	
		/* Append `key` to a cookie. */
		_appendKey: function(type, key, flag){
			key = "" + key; // #90
			var local = this._local,
				instOpts = this.options.persist,
				delim = instOpts.cookieDelimiter,
				cookieName = local.cookiePrefix + type,
				data = local._data(cookieName),
				keyList = data ? data.split(delim) : [],
				idx = $.inArray(key, keyList);
			// Remove, even if we add a key,  so the key is always the last entry
			if(idx >= 0){
				keyList.splice(idx, 1);
			}
			// Append key to cookie
			if(flag){
				keyList.push(key);
			}
			local._data(cookieName, keyList.join(delim));
		},
	
		treeInit: function(ctx){
			var tree = ctx.tree,
				opts = ctx.options,
				local = this._local,
				instOpts = this.options.persist;
	
			// For 'auto' or 'cookie' mode, the cookie plugin must be available
			_assert((instOpts.store !== "auto" && instOpts.store !== "cookie") || cookieGetter,
				"Missing required plugin for 'persist' extension: js.cookie.js or jquery.cookie.js");
	
			local.cookiePrefix = instOpts.cookiePrefix || ("fancytree-" + tree._id + "-");
			local.storeActive = instOpts.types.indexOf(ACTIVE) >= 0;
			local.storeExpanded = instOpts.types.indexOf(EXPANDED) >= 0;
			local.storeSelected = instOpts.types.indexOf(SELECTED) >= 0;
			local.storeFocus = instOpts.types.indexOf(FOCUS) >= 0;
			if( instOpts.store === "cookie" || !window.localStorage ) {
				local.localStorage = null;
			} else {
				local.localStorage = (instOpts.store === "local") ? window.localStorage : window.sessionStorage;
			}
	
			// Bind init-handler to apply cookie state
			tree.$div.bind("fancytreeinit", function(event){
				if ( tree._triggerTreeEvent("beforeRestore", null, {}) === false ) {
					return;
				}
	
				var cookie, dfd, i, keyList, node,
					prevFocus = local._data(local.cookiePrefix + FOCUS), // record this before node.setActive() overrides it;
					noEvents = instOpts.fireActivate === false;
	
				// tree.debug("document.cookie:", document.cookie);
	
				cookie = local._data(local.cookiePrefix + EXPANDED);
				keyList = cookie && cookie.split(instOpts.cookieDelimiter);
	
				if( local.storeExpanded ) {
					// Recursively load nested lazy nodes if expandLazy is 'expand' or 'load'
					// Also remove expand-cookies for unmatched nodes
					dfd = _loadLazyNodes(tree, local, keyList, instOpts.expandLazy ? "expand" : false , null);
				} else {
					// nothing to do
					dfd = new $.Deferred().resolve();
				}
	
				dfd.done(function(){
					if(local.storeSelected){
						cookie = local._data(local.cookiePrefix + SELECTED);
						if(cookie){
							keyList = cookie.split(instOpts.cookieDelimiter);
							for(i=0; i<keyList.length; i++){
								node = tree.getNodeByKey(keyList[i]);
								if(node){
									if(node.selected === undefined || instOpts.overrideSource && (node.selected === false)){
	//									node.setSelected();
										node.selected = true;
										node.renderStatus();
									}
								}else{
									// node is no longer member of the tree: remove from cookie also
									local._appendKey(SELECTED, keyList[i], false);
								}
							}
						}
						// In selectMode 3 we have to fix the child nodes, since we
						// only stored the selected *top* nodes
						if( tree.options.selectMode === 3 ){
							tree.visit(function(n){
								if( n.selected ) {
									n.fixSelection3AfterClick();
									return "skip";
								}
							});
						}
					}
					if(local.storeActive){
						cookie = local._data(local.cookiePrefix + ACTIVE);
						if(cookie && (opts.persist.overrideSource || !tree.activeNode)){
							node = tree.getNodeByKey(cookie);
							if(node){
								node.debug("persist: set active", cookie);
								// We only want to set the focus if the container
								// had the keyboard focus before
								node.setActive(true, {
									noFocus: true,
									noEvents: noEvents
								});
							}
						}
					}
					if(local.storeFocus && prevFocus){
						node = tree.getNodeByKey(prevFocus);
						if(node){
							// node.debug("persist: set focus", cookie);
							if( tree.options.titlesTabbable ) {
								$(node.span).find(".fancytree-title").focus();
							} else {
								$(tree.$container).focus();
							}
							// node.setFocus();
						}
					}
					tree._triggerTreeEvent("restore", null, {});
				});
			});
			// Init the tree
			return this._superApply(arguments);
		},
		nodeSetActive: function(ctx, flag, opts) {
			var res,
				local = this._local;
	
			flag = (flag !== false);
			res = this._superApply(arguments);
	
			if(local.storeActive){
				local._data(local.cookiePrefix + ACTIVE, this.activeNode ? this.activeNode.key : null);
			}
			return res;
		},
		nodeSetExpanded: function(ctx, flag, opts) {
			var res,
				node = ctx.node,
				local = this._local;
	
			flag = (flag !== false);
			res = this._superApply(arguments);
	
			if(local.storeExpanded){
				local._appendKey(EXPANDED, node.key, flag);
			}
			return res;
		},
		nodeSetFocus: function(ctx, flag) {
			var res,
				local = this._local;
	
			flag = (flag !== false);
			res = this._superApply(arguments);
	
			if( local.storeFocus ) {
				local._data(local.cookiePrefix + FOCUS, this.focusNode ? this.focusNode.key : null);
			}
			return res;
		},
		nodeSetSelected: function(ctx, flag) {
			var res, selNodes,
				tree = ctx.tree,
				node = ctx.node,
				local = this._local;
	
			flag = (flag !== false);
			res = this._superApply(arguments);
	
			if(local.storeSelected){
				if( tree.options.selectMode === 3 ){
					// In selectMode 3 we only store the the selected *top* nodes.
					// De-selecting a node may also de-select some parents, so we
					// calculate the current status again
					selNodes = $.map(tree.getSelectedNodes(true), function(n){
						return n.key;
					});
					selNodes = selNodes.join(ctx.options.persist.cookieDelimiter);
					local._data(local.cookiePrefix + SELECTED, selNodes);
				} else {
					// beforeSelect can prevent the change - flag doesn't reflect the node.selected state
					local._appendKey(SELECTED, node.key, node.selected);
				}
			}
			return res;
		}
	});
}(jQuery, window, document));	