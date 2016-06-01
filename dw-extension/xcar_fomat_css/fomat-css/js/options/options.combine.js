cssStyle['vendor-prefix-align']  = {

    /**
     * Internal
     *
     * Containt vendor-prefixes list.
     */
    _prefixesList: [
        'webkit',
        'moz',
        'ms',
        'o'
    ],

    /**
     * Internal
     *
     * Make namespace from property name
     * @param {String} propertyName
     * @returns {String|undefined}
     */
    _makeNamespace: function(propertyName) {
        var info = this._getPrefixInfo(propertyName);
        return info && info.baseName;
    },

    /**
     * Internal
     *
     * Create object which contains info about vendor prefix used in propertyName.
     * @param {String} propertyName property name
     * @returns {Object|undefined}
     */
    _getPrefixInfo: function(propertyName, namespace) {
        var baseName = propertyName;
        var prefixLength = 0;

        namespace = namespace || '';

        if (!propertyName) return;

        this._prefixesList.some(function(prefix) {
            prefix = '-' + prefix + '-';
            if (propertyName.indexOf(prefix) !== 0) return;

            baseName = baseName.substr(prefix.length);
            prefixLength = prefix.length;

            return true;
        });

        return {
            id: namespace + baseName,
            baseName: baseName,
            prefixLength: prefixLength
        };
    },

    /**
     * Internal
     *
     * Walk across nodes, and call payload for every node that pass selector check.
     * @param {node} node
     * @param {function} selector
     * @param {function} payload
     */
    _walk: function(node, selector, payload, namespaceSelector) {
        node.forEach(function(item, i) {
            var info = this._getPrefixInfo(
                selector(item),
                namespaceSelector && this._makeNamespace(namespaceSelector(item))
            );
            if (!info) return;
            payload(info, i);
        }, this);
    },

    /**
     * Internal
     *
     * Return property name.
     * e.g.
     * for: 'color: #fff'
     * returns string: 'color'
     * @param {node} node
     * @returns {String|undefined}
     */
    _getDeclName: function(node) {
        if (node[0] !== 'declaration') return;
        // TODO: Check that it's not a variable
        return node[1][1][1];
    },

    /**
     * Internal
     *
     * Return property value name.
     * e.g.
     * for: '-webkit-transition: -webkit-transform 150ms linear'
     * returns string: '-webkit-transform', and
     * for: 'background: -webkit-linear-gradient(...)'
     * returns string: '-webkit-linear-gradient'
     * @param {node} node
     * @returns {String|undefined}
     */
    _getValName: function(node) {
        // TODO: Check that `node[3]` is the node we need
        if (node[0] !== 'declaration' || !node[3] || !node[3][2])
            return;
        if (node[3][2] && node[3][2][0] === 'ident')
            return node[3][2][1];
        if (node[3][2] && node[3][2][0] === 'function')
            return node[3][2][1][1];
    },

    /**
     * Internal
     *
     * Update dict which contains info about items align.
     * @param {Object} info,
     * @param {Object} dict,
     * @param {String} whitespaceNode
     */
    _updateDict: function(info, dict, whitespaceNode) {
        if (info.prefixLength === 0) return;

        var indent = dict[info.id] || { prefixLength: 0, baseLength: 0 };

        dict[info.id] = indent.prefixLength > info.prefixLength ?
        indent :
        {
            prefixLength: info.prefixLength,
            baseLength: whitespaceNode.substr(whitespaceNode.lastIndexOf('\n') + 1).length
        };
    },

    /**
     * Return string with correct number of spaces for info.baseName property.
     * @param {Object} info,
     * @param {Object} dict,
     * @param {String} whitespaceNode
     * @returns {String}
     */
    _updateIndent: function(info, dict, whitespaceNode) {
        var item = dict[info.id];
        if (!item)
            return whitespaceNode;

        var firstPart = whitespaceNode.substr(0, whitespaceNode.lastIndexOf('\n') + 1 );
        var extraIndent = new Array(
            item.prefixLength -
            info.prefixLength +
        item.baseLength + 1).join(' ');

        return firstPart.concat(extraIndent);
    },

    /**
     * Sets handler value.
     *
     * @param {Array} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        return value ? this : undefined;
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType !== 'block') return;

        var dict = {};
        var _this = this;

        // Gathering Info
        this._walk(node, this._getDeclName, function(info, i) {
            _this._updateDict(info, dict, node[i - 1][1]);
        });
        this._walk(node, this._getValName, function(info, i) {
            _this._updateDict(info, dict, node[i][3][1][1]);
        }, this._getDeclName);

        // Update nodes
        this._walk(node, this._getDeclName, function(info, i) {
            node[i - 1][1] = _this._updateIndent(info, dict, node[i - 1][1]);
        });
        this._walk(node, this._getValName, function(info, i) {
            node[i][3][1][1] = _this._updateIndent(info, dict, node[i][3][1][1]);
        }, this._getDeclName );

    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node) {
        if (nodeType !== 'block') return;

        var result = {
                true: 0,
                false: 0
            };

        var maybePrefix = false;
        var prevPrefixLength = false;
        var prevProp;
        var prevSum;
        var partialResult = null;

        var getResult = function(node, sum, info, i) {
            var prop = info.baseName;

            // If this is the last item in a row and we have a result, then catch it
            if (prop !== prevProp && partialResult !== null) {
                if (partialResult) {
                    result.true++;
                } else {
                    result.false++;
                }
                partialResult = null;
            }

            if (prop === prevProp && info.prefixLength !== prevPrefixLength) {
                maybePrefix = true;
            } else {
                maybePrefix = false;
            }

            if (maybePrefix && partialResult !== false) {
                // If there is prefixed prop, check if the prefixes are aligned,
                // but only if we hadn't already catched that it is false
                if (sum === prevSum) {
                    partialResult = true;
                } else {
                    partialResult = false;
                }
            }

            if (node.length === i + 3 && partialResult !== null) {
                // If we're at the last property and have a result, catch it
                if (partialResult) {
                    result.true++;
                } else {
                    result.false++;
                }
            }

            prevPrefixLength = info.prefixLength;
            prevProp = prop;
            prevSum = sum;
        };

        // Gathering Info
        this._walk(node, this._getDeclName, function(info, i) {
            if (node[i - 1]) {
                var sum = node[i - 1][1].replace(/^[ \t]*\n+/, '').length + info.prefixLength;
                getResult(node, sum, info, i);
            }
        });

        this._walk(node, this._getValName, function(info, i) {
            if (node[i][3][1]) {
                var sum = node[i][3][1][1].replace(/^[ \t]*\n+/, '').length + info.prefixLength;
                getResult(node, sum, info, i);
            }
        });

        if (result.true > 0 || result.false > 0) {
            if (result.true >= result.false) {
                return true;
            } else {
                return false;
            }
        }
    }
};




cssStyle['quotes']  = {

    /**
     * Sets handler value.
     *
     * @param {String|Boolean} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        delete this._value;

        if (value === 'single' || value === 'double' ) {
            this._value = value;
        }

        if (!this._value) return;
        return this;
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType === 'string') {
            if (node[0][0] === '"' && this._value === 'single') {
                node[0] = node[0]
                    .replace(/\\"/g, '"') // unescape all escaped double quotes
                    .replace(/([^\\])'/g, '$1\\\'') // escape all the single quotes
                    .replace(/^"|"$/g, '\''); // replace the first and the last quote

            } else if (node[0][0] === '\'' && this._value === 'double') {
                node[0] = node[0]
                    .replace(/\\'/g, '\'') // unescape all escaped single quotes
                    .replace(/([^\\])"/g, '$1\\\"') // escape all the double quotes
                    .replace(/^'|'$/g, '"'); // replace the first and the last quote
            }
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node) {
        if (nodeType === 'string') {
            if (node[0][0] === '"') {
                return 'double';
            } else if (node[0][0] === '\'') {
                return 'single';
            }
        }
    }
};

cssStyle['remove-empty-rulesets']  = {

    /**
     * Sets handler value.
     *
     * @param {String} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        if (value === true) {
            this._value = value;
            return this;
        }
    },

    /**
     * Remove rulesets with no declarations.
     *
     * @param {String} nodeType
     * @param {Array} nodeContent
     */
    process: function(nodeType, nodeContent) {
        if (nodeType === 'stylesheet') {
            this._processStylesheetContent(nodeContent);
        }
    },

    _processStylesheetContent: function(nodeContent) {
        this._removeEmptyRulesets(nodeContent);
        this._mergeAdjacentWhitespace(nodeContent);
    },

    _removeEmptyRulesets: function(nodeContent) {
        var i = nodeContent.length;
        // Loop through node and try to find a ruleset:
        while (i--) {
            var node = nodeContent[i];
            if (!this._isRuleset(node)) continue;
            // If a ruleset is found, try to find its nested rulesets and remove
            // all empty ones:
            var j = node.length;
            while (j--) {
                // Nested rulesets are located inside blocks, that's why look
                // for blocks only:
                var blockNode = node[j];
                if (blockNode[0] !== 'block') continue;
                blockNode.shift();
                this._processStylesheetContent(blockNode);
                blockNode.unshift('block');
                node[j] = blockNode;
            }
            // If after removing all empty nested rulesets the parent has also
            // become empty, remove it too:
            if (this._isEmptyRuleset(node)) {
                nodeContent.splice(i, 1);
            }
        }
    },

    /**
     * Removing ruleset nodes from tree may result in two adjacent whitespace nodes which is not correct AST:
     * [space, ruleset, space] => [space, space]
     * To ensure correctness of further processing we should merge such nodes into one.
     * [space, space] => [space]
     */
    _mergeAdjacentWhitespace: function(nodeContent) {
        var i = nodeContent.length - 1;
        while (i-- > 0) {
            if (this._isWhitespace(nodeContent[i]) && this._isWhitespace(nodeContent[i + 1])) {
                nodeContent[i][1] += nodeContent[i + 1][1];
                nodeContent.splice(i + 1, 1);
            }
        }
    },

    _isEmptyRuleset: function(ruleset) {
        return ruleset.filter(this._isBlock).every(this._isEmptyBlock, this);
    },

    /**
     * Block is considered empty when it has nothing but spaces.
     */
    _isEmptyBlock: function(node) {
        return node.length === 1 || !node.some(this._isNotWhitespace);
    },

    _isDeclarationOrComment: function(node) {
        return ['declaration', 'commentML', 'commentSL'].indexOf(node[0]) > -1;
    },

    _isRuleset: function(node) {
        return node[0] === 'ruleset';
    },

    _isBlock: function(node) {
        return node[0] === 'block';
    },

    _isWhitespace: function(node) {
        return node[0] === 's';
    },

    _isNotWhitespace: function(node) {
        return typeof node === 'object' && node[0] !== 's';
    },

    /**
     * Detects the value of an option at the tree node.
     * This option is treated as `true` by default, but any trailing space would invalidate it.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    _detectDefault: true,

    detect: function(nodeType, node) {
        if (nodeType === 'atrulers' || nodeType === 'block') {
            if (node.length === 0 || (node.length === 1 && node[0][0] === 's')) {
                return false;
            }
        }
    }
};


cssStyle['rule-indent']  = {

    /**
     * Sets handler value.
     *
     * @param {String|Number} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        delete this._value;

        if (typeof value === 'number' && value === Math.abs(Math.round(value))) {
            this._value = new Array(value + 1).join(' ');
        } else if (typeof value === 'string' && value.match(/^[ \t]+$/)) {
            this._value = value;
        }

        if (typeof this._value === 'string') return this;
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node, level) {
        if (nodeType === 'block') {
            if (node[0] && node[0][0] !== 's') {
                node.unshift(['s', '']);
            }
            for (var i = 0; i < node.length; i++) {
                var nodeItem = node[i];
                if (nodeItem[0] === 'declaration') {
                    var value = '\n' + new Array(level + 2).join(this._value);
                    var space = node[i - 1];
                    var tail;

                    if (space[0] !== 's') {
                        space = ['s', ''];
                        tail = node.splice(i);
                        tail.unshift(space);
                        Array.prototype.push.apply(node, tail);
                        i++;
                    }
                    space[1] = space[1].replace(/(\n)?([\t ]+)?$/, value);
                }
            }
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node, level) {
        var result = null;

        if (nodeType === 'declaration') {
            if (this._prev !== undefined) {
                result = this._prev.replace(/\s*\n/g, '');
                if (level > 0) {
                    result = result.substr(0, parseInt(result.length / (level + 1), 10));
                }
            } else {
                result = '';
            }
        }

        // Store the previous nodeType
        if (nodeType === 's') {
            this._prev = node[0];
        } else {
            this._prev = undefined;
        }

        if (result !== null) {
            return result;
        }
    }

};


cssStyle['sort-order'] = {

    /**
     * Sets handler value.
     *
     * @param {Array} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        if (!value) return;

        this._order = {};
		//console.log(value)
        if (typeof value[0] === 'string') {
            value.forEach(function(prop, propIndex) {
                this._order[prop] = { group: 0, prop: propIndex };
            }, this);
        } else {
			
            value.forEach(function(group, groupIndex) {
                group.forEach(function(prop, propIndex) {
                    this._order[prop] = { group: groupIndex, prop: propIndex };
                }, this);
            }, this);
        }

        return this;
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        // Types of nodes that can be sorted: 可以排序的节点类型
        var NODES = ['atruleb', 'atruler', 'atrules', 'commentML', 'commentSL',
            'declaration', 's', 'include'];
        // Spaces and comments: 空白和注释
        var SC = ['commentML', 'commentSL', 's'];

        var currentNode;
        // Sort order of properties: 属性排序
        var order = this._order;
        // List of declarations that should be sorted: 要排序的声明列表
        var sorted = [];
        // list of nodes that should be removed from parent node: 需要从父节点移除的节点列表
        var deleted = [];
        // List of spaces and comments that go before declaration/@-rule: 在声明或引用规则前的空白和注释
        var sc0 = [];
        // Value to search in sort order: either a declaration's property name
        // (e.g. `color`), or @-rule's special keyword (e.g. `$import`):在排序规则中搜索的值
        var propertyName;

        // Counters for loops: 循环计数器
        var i;
        var l;
        var j;
        var nl;

        /**
         * Check if there are any comments or spaces before 检测声明，特殊规则前的空白或注释
         * the declaration/@-rule.
         * @returns {Array} List of nodes with spaces and comments
         */
        var checkSC0 = function() {
            // List of nodes with spaces and comments: 空白和注释节点列表
            var sc = [];
            // List of nodes that can be later deleted from parent node: 可在后面被父节点删除的节点列表
            var d = [];

            for (; i < l; i++) {
                currentNode = node[i];
                // If there is no node left, 左侧无节点 停止返回false
                // stop and do nothing with previously found spaces/comments:
                if (!currentNode) {
                    return false;
                }

                // Remove any empty lines: 移除空行
                if (currentNode[0] === 's') {
                    currentNode[1] = currentNode[1].replace(/\n[\s\t\n\r]*\n/, '\n');
                }

                // If the node is declaration or @-rule, stop and return all
                // found nodes with spaces and comments (if there are any): 
                if (SC.indexOf(currentNode[0]) === -1) break;

                sc.push(currentNode);
                d.push(i);
            }

            deleted = deleted.concat(d);

            return sc;
        };

        /**
         * Check if there are any comments or spaces after
         * the declaration/@-rule.
         * @returns {Array} List of nodes with spaces and comments
         * @private
         */
        var checkSC1 = function() {//检测声明，特殊规则后的空白或注释
            // List of nodes with spaces and comments:
            var sc = [];
            // List of nodes that can be later deleted from parent node:
            var d = [];
            // Position of `\n` symbol inside a node with spaces:
            var lbIndex;

            // Check every next node:
            for (; i < l; i++) {
                currentNode = node[i + 1];
                // If there is no node, or it is nor spaces neither comment, stop:
                if (!currentNode || SC.indexOf(currentNode[0]) === -1) break;


                // Remove any empty lines:
                if (currentNode[0] === 's') {
                    currentNode[1] = currentNode[1].replace(/\n[\s\t\n\r]*\n/, '\n');
                }

                if (['commentML', 'commentSL'].indexOf(currentNode[0]) > -1) {
                    sc.push(currentNode);
                    d.push(i + 1);
                    continue;
                }

                lbIndex = currentNode[1].indexOf('\n');

                // If there are any line breaks in a node with spaces, stop and
                // split the node into two: one with spaces before line break
                // and one with `\n` symbol and everything that goes after.
                // Combine the first one with declaration/@-rule's node:
                if (lbIndex > -1) {
                    // TODO: Don't push an empty array
                    sc.push(['s', currentNode[1].substring(0, lbIndex)]);
                    currentNode[1] = currentNode[1].substring(lbIndex);
                    break;
                }

                sc.push(currentNode);
                d.push(i + 1);
            }

            deleted = deleted.concat(d);

            return sc;
        };

        /**
         * Combine declaration/@-rule's node with other relevant information:
         * property index, semicolon, spaces and comments.
         * @returns {Object} Extended node
         */
        var extendNode = function() {
            currentNode = node[i];
            var nextNode = node[i + 1];
            // Object containing current node, all corresponding spaces,
            // comments and other information:
            var extendedNode;
            // Check if current node's property name is in sort order.
            // If it is, save information about its indices:
            var orderProperty = order[propertyName];

            extendedNode = {
                i: i,
                node: currentNode,
                sc0: sc0,
                delim: []
            };

            // If the declaration's property is in order's list, save its
            // group and property indices. Otherwise set them to 10000, so
            // declaration appears at the bottom of a sorted list:
            extendedNode.groupIndex = orderProperty && orderProperty.group > -1 ?
                orderProperty.group : 10000;
            extendedNode.propertyIndex = orderProperty && orderProperty.prop > -1 ?
                orderProperty.prop : 10000;

            // Mark current node to remove it later from parent node:
            deleted.push(i);

            // If there is `;` right after the declaration, save it with the
            // declaration and mark it for removing from parent node:
            if (currentNode && nextNode && nextNode[0] === 'declDelim') {
                extendedNode.delim.push(nextNode);
                deleted.push(i + 1);
                i++;
            }

            // Save spaces and comments which follow right after the declaration
            // and mark them for removing from parent node:
            extendedNode.sc1 = checkSC1();

            return extendedNode;
        };

        // TODO: Think it through!
        // Sort properties only inside blocks:
        if (nodeType !== 'block') return;

        // Check every child node.
        // If it is declaration (property-value pair, e.g. `color: tomato`),
        // or @-rule (e.g. `@include nani`),
        // combine it with spaces, semicolon and comments and move them from
        // current node to a separate list for further sorting:
        for (i = 0, l = node.length; i < l; i++) {
            if (NODES.indexOf(node[i][0]) === -1) continue;

            // Save preceding spaces and comments, if there are any, and mark
            // them for removing from parent node:
            sc0 = checkSC0();
            if (!sc0) continue;

            // If spaces/comments are the last nodes, stop and go to sorting:
            if (!node[i]) {
                deleted.splice(deleted.length - sc0.length, deleted.length + 1);
                break;
            }

            // Check if the node needs to be sorted:
            // it should be a special @-rule (e.g. `@include`) or a declaration
            // with a valid property (e.g. `color` or `$width`).
            // If not, proceed with the next node:
            propertyName = null;
            // Look for includes:
            if (node[i][0] === 'include') {
                propertyName = '$include';
            } else {
                for (j = 1, nl = node[i].length; j < nl; j++) {
                    currentNode = node[i][j];
                    if (currentNode[0] === 'property') {
                        propertyName = currentNode[1][0] === 'variable' ?
                            '$variable' : currentNode[1][1];
                        break;
                    } else if (currentNode[0] === 'atkeyword' &&
                        currentNode[1][1] === 'import') { // Look for imports
                        propertyName = '$import';
                        break;
                    }
                }
            }

            // If current node is not property-value pair or import or include,
            // skip it and continue with the next node:
            if (!propertyName) {
                deleted.splice(deleted.length - sc0.length, deleted.length + 1);
                continue;
            }

            // Make an extended node and move it to a separate list for further
            // sorting:
            sorted.push(extendNode());
        }

        // Remove all nodes, that were moved to a `sorted` list, from parent node:
        for (i = deleted.length - 1; i > -1; i--) {
            node.splice(deleted[i], 1);
        }

        // Sort declarations saved for sorting:
        sorted.sort(function(a, b) {
            // If a's group index is higher than b's group index, in a sorted
            // list a appears after b:
            if (a.groupIndex !== b.groupIndex) return a.groupIndex - b.groupIndex;

            // If a and b have the same group index, and a's property index is
            // higher than b's property index, in a sorted list a appears after
            // b:
            if (a.propertyIndex !== b.propertyIndex) return a.propertyIndex - b.propertyIndex;

            // If a and b have the same group index and the same property index,
            // in a sorted list they appear in the same order they were in
            // original array:
            return a.i - b.i;
        });

        // Build all nodes back together. First go sorted declarations, then
        // everything else:
        if (sorted.length > 0) {
            for (i = sorted.length - 1, l = -1; i > l; i--) {
                currentNode = sorted[i];
                var prevNode = sorted[i - 1];
                sc0 = currentNode.sc0;
                var sc1 = currentNode.sc1;

                // Divide declarations from different groups with an empty line:
                if (prevNode && currentNode.groupIndex > prevNode.groupIndex) {
                    if (sc0[0] && sc0[0][0] === 's' &&
                        sc0[0][1].match(/\n/g) &&
                        sc0[0][1].match(/\n/g).length < 2) {
                        sc0.unshift(['s', '\n']);
                    }
                }

                sc0.reverse();
                sc1.reverse();

                for (j = 0, nl = sc1.length; j < nl; j++) {
                    node.unshift(sc1[j]);
                }
                if (currentNode.delim.length > 0) node.unshift(['declDelim']);
                node.unshift(currentNode.node);
                for (j = 0, nl = sc0.length; j < nl; j++) {
                    node.unshift(sc0[j]);
                }
            }
        }
    }
};

cssStyle['stick-brace'] = {

    /**
     * Sets handler value.
     *
     * @param {String|Number} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        delete this._value;

        if (typeof value === 'number' && value === Math.abs(Math.round(value))) {
            this._value = new Array(value + 1).join(' ');
        } else if (typeof value === 'string' && value.match(/^[ \t\n]*$/)) {
            this._value = value;
        }

        if (typeof this._value === 'string') return this;
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType === 'selector' || nodeType === 'atruler') {
            for (var i = node.length; i--;) {
                var nodeItem = node[i];
                if (nodeItem[0] === 'simpleselector' || nodeItem[0] === 'atrulerq') {
                    if (nodeItem[nodeItem.length - 1][0] === 's') nodeItem.pop();
                    nodeItem.push(['s', this._value]);
                    break;
                }
            }
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node, level) {
        if (nodeType === 'selector' || nodeType === 'atruler') {
            for (var i = node.length; i--;) {
                var nodeItem = node[i];
                if (nodeItem[0] === 'simpleselector' || nodeItem[0] === 'atrulerq') {
                    var result = '';
                    if (nodeItem[nodeItem.length - 1][0] === 's') {
                        result = nodeItem[nodeItem.length - 1][1];
                    }
                    if (this._prev !== undefined && this._prev[0] < level) {
                        result = result.replace(result.replace(this._prev[1], ''), '');
                    }
                    if (this._prev === undefined || this._prev[0] !== level) {
                        this._prev = [level, result];
                    }
                    return result;
                }
            }
        }
    }

};
cssStyle['strip-spaces'] = {

    /**
     * Sets handler value.
     *
     * @param {String|Boolean} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        this._value = value === true;
        if (!this._value) return;
        return this;
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType === 's') {
            node[0] = this._trim(node[0]);
        }
        if (nodeType === 'stylesheet') {
            var lastChild = node[node.length - 1];
            if (lastChild[0] === 's') {
                lastChild[1] = this._trim(lastChild[1])
                    .replace(/[ \t]+$/, '')
                    .replace(/[\n]+/g, '\n');
            }
        }
    },

    /**
     * Trim trailing spaces on each line.
     * @private
     * @param {String} s Spaceful string
     * @returns {String}
     */
    _trim: function(s) {
        return s.replace(/[ \t]+\n/g, '\n');
    },

    /**
     * Detects the value of an option at the tree node.
     * This option is treated as `true` by default, but any trailing space would invalidate it.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    _detectDefault: true,

    detect: function(nodeType, node) {
        if (nodeType === 's') {
            if (node[0].match(/[ \t]\n/)) {
                return false;
            }
        }
        if (nodeType === 'stylesheet') {
            var lastChild = node[node.length - 1];
            if (lastChild[0] === 's' && lastChild[1] !== '\n' && lastChild[1].match(/^[ \n\t]+$/)) {
                return false;
            }
        }
    }
};
cssStyle['unitless-zero']  = {

    /**
     * Sets handler value.
     *
     * @param {Boolean} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        if (value === true) {
            this._value = value;
            return this;
        }
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType === 'value' || nodeType === 'braces') {
            node.forEach(function(child, index) {
                if (
                    (child[0] === 'percentage' ||
                    child[0] === 'dimension' && ['cm', 'em', 'ex', 'pt', 'px'].indexOf(child[2][1]) !== -1) &&
                        child[1][1] === '0') {
                    node[index] = child[1];
                }
            });
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node) {
        var result = null;

        // If we see a zero with unit and it is not degree, then we don’t have an option
        if (
            nodeType === 'percentage' && node[0][1] === '0' ||
            nodeType === 'dimension' && node[0][1] === '0' && node[1][1] !== 'deg'
        ) {
            result = false;
        }

        // If we see a zero and previous node is not percentage or dimension, then we have an option
        if (
            nodeType === 'number' &&
            node[0] === '0' &&
            this._prev !== 'percentage' &&
            this._prev !== 'dimension'
        ) {
            result = true;
        }

        // Store the previous nodeType
        this._prev = nodeType;

        if (result !== null) {
            return result;
        }
    }
};

cssStyle['always-semicolon']  = {

    /**
     * Sets handler value.
     *
     * @param {String|Boolean} value Option value
     * @returns {Object|undefined}
     * TODO: This option accepts only boolean
     */
    setValue: function(value) {
        this._value = value === true;
        if (!this._value) return;
        return this;
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType === 'block') {
            for (var i = node.length; i--;) {
                var currentNode = node[i];
                var currentNodeType = currentNode[0];
                var nodeWithoutSemicolon;

                // Skip nodes that already have `;` at the end:
                if (currentNodeType === 'declDelim') break;

                // Add semicolon only after declarations and includes.
                // If current node is include, insert semicolon right into it.
                // If it's declaration, look for value node:
                if (currentNodeType === 'include') {
                    nodeWithoutSemicolon = currentNode;
                } else if (currentNodeType === 'declaration') {
                    for (var k = currentNode.length; k--;) {
                        if (currentNode[k][0] === 'value') {
                            nodeWithoutSemicolon = currentNode[k];
                            break;
                        }
                    }
                } else {
                    continue;
                }

                var space = [];
                var isBlock = false;

                // Check if there are spaces and comments at the end of the node:
                for (var j = nodeWithoutSemicolon.length; j--;) {
                    var lastNode = nodeWithoutSemicolon[j][0];
                    // If the node's last child is block, do not add semicolon:
                    // TODO: Add syntax check and run the code only for scss
                    if (lastNode === 'block') {
                        isBlock = true;
                        break;
                    } else if (['s', 'commentML', 'commentSL'].indexOf(lastNode) === -1) break;

                    space.unshift(nodeWithoutSemicolon[j]);
                }

                if (isBlock) break;

                // Temporarily remove last spaces and comments and insert `;`
                // before them:
                nodeWithoutSemicolon.splice(nodeWithoutSemicolon.length - space.length);
                node.splice.apply(node, [i + 1, 0, ['declDelim']].concat(space));
                break;
            }
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node) {
        if (nodeType === 'block') {
            for (var i = node.length; i--;) {
                var nodeItem = node[i];
                var type = nodeItem[0];
                if (type === 'declDelim') return true;

                if (type === 'declaration') return false;
            }
        }
    }
};
cssStyle['block-indent']  = {

    /**
     * Sets handler value.
     *
     * @param {String|Number} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        delete this._value;

        if (typeof value === 'number' && value === Math.abs(Math.round(value))) {
            this._value = new Array(value + 1).join(' ');
        } else if (typeof value === 'string' && value.match(/^[ \t]+$/)) {
            this._value = value;
        }

        if (typeof this._value === 'string') return this;
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node, level) {
        var value;
        var space;

        // Add right space before closing brace
        if (nodeType === 'atrulers' || nodeType === 'block') {
            value = '\n' + new Array(level + 1).join(this._value);
            if (node[node.length - 1][0] === 's') node.pop();
            node.push(['s', value]);
        }

        // Add right space before rule declaration
        if (nodeType === 'stylesheet' || nodeType === 'atrulers') {
            // Level up hack
            if (nodeType === 'atrulers') level++;

            // Prevent line break at file start
            var isFirst;
            if (nodeType === 'stylesheet') {
                var first = node[0];
                if (first[0] !== 's' || first[1].match('\n') === null) isFirst = true;
            }

            for (var i = 0; i < node.length; i++) {
                var nodeItem = node[i];
                if (nodeItem[0] === 'atruler' || nodeItem[0] === 'ruleset') {
                    value = (i < 2 && isFirst ? '' : '\n') + new Array(level + 1).join(this._value);
                    isFirst = false;

                    space = node[i - 1];
                    if (!space || space[0] !== 's') {
                        var tail = node.splice(i);
                        space = ['s', ''];
                        tail.unshift(space);
                        Array.prototype.push.apply(node, tail);
                        i++;
                    }
                    space[1] = space[1].replace(/(\n)?([\t ]+)?$/, value);
                }
            }
        }

        // Add space before block opening brace
        if (nodeType === 'simpleselector') {
            space = node[node.length - 1];
            if (space[0] === 's' && space[1].match('\n')) {
                space[1] += new Array(level + 1).join(this._value);
            }
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node, level) {
        var result = null;
        if (nodeType === 'atrulers' || nodeType === 'block') {
            if (node.length && node[node.length - 1][0] === 's' && level > 0) {
                result = node[node.length - 1][1].replace(/\s*\n/g, '');

                if (this._prev !== undefined && this._prev[0] < level) {
                    result = result.replace(result.replace(this._prev[1], ''), '');
                }
                if (this._prev === undefined || this._prev[0] !== level) {
                    this._prev = [level, result];
                }
            }
        }

        if (result !== null) {
            return result;
        }
    }

};
cssStyle['colon-space'] = {

    /**
     * Sets handler value.
     *
     * @param {Array} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        delete this._value;

        if (value.constructor !== Array) return;

        if (typeof value[0] === 'number' &&
            value[0] === Math.abs(Math.round(value[0]))) {
            value[0] = new Array(value[0] + 1).join(' ');
        } else if (typeof value[0] !== 'string' ||
            !value[0].match(/^[ \t\n]*$/)) {
            return;
        }

        if (typeof value[1] === 'number' &&
            value[1] === Math.abs(Math.round(value[1]))) {
            value[1] = new Array(value[1] + 1).join(' ');
        } else if (typeof value[1] !== 'string' ||
            !value[1].match(/^[ \t\n]*$/)) {
            return;
        }

        this._value = value;
        return this;
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType === 'property') {
            if (node[node.length - 1][0] === 's') node.pop();
            if (this._value[0] !== '') node.push(['s', this._value[0]]);
        }
        if (nodeType === 'value') {
            if (node[0][0] === 's') node.shift();
            if (this._value[1] !== '') node.unshift(['s', this._value[1]]);
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node) {
        var result = [];

        if (nodeType === 'declaration') {
            var property = node[0];
            var value = node[2];

            if (property[property.length - 1][0] === 's') {
                result[0] = property[property.length - 1][1];
            } else {
                result[0] = '';
            }

            if (value[1][0] === 's') {
                result[1] = value[1][1];
            } else {
                result[1] = '';
            }

        }
        if (result.length) {
            return result;
        }
    }
};
cssStyle['color-case'] = {

    /**
     * Sets handler value.
     *
     * @param {String} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        if (value === 'lower' || value === 'upper') {
            this._value = value;
            return this;
        }
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType === 'vhash') {
            if (this._value === 'lower') {
                node[0] = node[0].toLowerCase();
            } else if (this._value === 'upper') {
                node[0] = node[0].toUpperCase();
            }
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node) {
        if (nodeType === 'vhash') {
            if (node[0].match(/^[^A-F]*[a-f][^A-F]*$/)) {
                return 'lower';
            } else if (node[0].match(/^[^a-f]*[A-F][^a-f]*$/)) {
                return 'upper';
            }
        }
    }
};
cssStyle['color-shorthand']  = {

    /**
     * Sets handler value.
     *
     * @param {Boolean} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        if (value === true || value === false) {
            this._value = value;
            return this;
        }
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType === 'vhash') {
            if (this._value) {
                node[0] = node[0].replace(/(\w)\1(\w)\2(\w)\3/i, '$1$2$3');
            } else {
                node[0] = node[0].replace(/^(\w)(\w)(\w)$/, '$1$1$2$2$3$3');
            }
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node) {
        if (nodeType === 'vhash') {
            if (node[0].match(/^\w{3}$/)) {
                return true;
            } else if (node[0].match(/^(\w)\1(\w)\2(\w)\3$/)) {
                return false;
            }
        }
    }
};
cssStyle['combinator-space']  = {

    /**
     * Sets handler value.
     *
     * @param {Array} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        delete this._value;

        if (value.constructor !== Array) return;

        if (typeof value[0] === 'number' &&
            value[0] === Math.abs(Math.round(value[0]))) {
            value[0] = new Array(value[0] + 1).join(' ');
        } else if (typeof value[0] !== 'string' ||
            !value[0].match(/^[ \t\n]*$/)) {
            return;
        }

        if (typeof value[1] === 'number' &&
            value[1] === Math.abs(Math.round(value[1]))) {
            value[1] = new Array(value[1] + 1).join(' ');
        } else if (typeof value[1] !== 'string' ||
            !value[1].match(/^[ \t\n]*$/)) {
            return;
        }

        this._value = value;
        return this;
 
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType === 'selector') {
            for (var i = node.length; i--;) {
                var subSelector = node[i];
                for (var j = subSelector.length; j--;) {
                    if (subSelector[j][0] === 'combinator') {
                        // Working with the whitespace after the combinator
                        if (subSelector[j + 1][0] === 's') {
                            subSelector[j + 1][1] = this._value[1];
                        } else {
                            subSelector.splice(j + 1, 0, ['s', this._value[1]]);
                        }
                        // Working with the whitespace before the combinator
                        if (subSelector[j - 1][0] === 's') {
                            subSelector[j - 1][1] = this._value[0];
                        } else {
                            subSelector.splice(j, 0, ['s', this._value[0]]);
                        }
                    }
                }
            }
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node) {
        if (nodeType === 'selector') {
            var variants = {};
            var bestGuess = null;
            var maximum = 0;
            for (var i = node.length; i--;) {
                var subSelector = node[i];
                for (var j = subSelector.length; j--;) {
                    var result = [];
                    if (subSelector[j][0] === 'combinator') {
                        // Working with the whitespace after the combinator
                        if (subSelector[j + 1][0] === 's') {
                            result[1] = subSelector[j + 1][1];
                        } else {
                            result[1] = '';
                        }
                        // Working with the whitespace before the combinator
                        if (subSelector[j - 1][0] === 's') {
                            result[0] = subSelector[j - 1][1];
                        } else {
                            result[0] = '';
                        }
                    }

                    if (result.length) {
                        if (variants[result]) {
                            variants[result]++;
                        } else {
                            variants[result] = 1;
                        }
                        if (variants[result] > maximum) {
                            maximum = variants[result];
                            bestGuess = result;
                        }
                    }
                }
            }
            if (bestGuess) {
                return bestGuess;
            }
        }
    }
};
cssStyle['element-case'] = {

    /**
     * Sets handler value.
     *
     * @param {String} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        if (value === 'lower' || value === 'upper') {
            this._value = value;
            return this;
        }
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType === 'simpleselector') {
            for (var i = node.length; i--;) {
                var nodeItem = node[i];
                if (nodeItem[0] === 'ident') {
                    if (this._value === 'lower') {
                        nodeItem[1] = nodeItem[1].toLowerCase();
                    } else if (this._value === 'upper') {
                        nodeItem[1] = nodeItem[1].toUpperCase();
                    }
                }
            }
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node) {
        if (nodeType === 'simpleselector') {
            var variants = {};
            var bestGuess = null;
            var maximum = 0;
            for (var i = node.length; i--;) {
                var nodeItem = node[i];
                if (nodeItem[0] === 'ident') {
                    var result;
                    if (nodeItem[1].match(/^[a-z]+$/)) {
                        result = 'lower';
                    } else if (nodeItem[1].match(/^[A-Z]+$/)) {
                        result = 'upper';
                    }

                    if (result) {
                        if (variants[result]) {
                            variants[result]++;
                        } else {
                            variants[result] = 1;
                        }
                        if (variants[result] > maximum) {
                            maximum = variants[result];
                            bestGuess = result;
                        }
                    }
                }
            }
            if (bestGuess) {
                return bestGuess;
            }
        }
    }
};
cssStyle['eof-newline'] = {

    /**
     * Sets handler value.
     *
     * @param {Boolean} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        if (value === true || value === false) {
            this._value = value;
            return this;
        }
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType === 'stylesheet') {
            var lastChild = node[node.length - 1];
            if (lastChild[0] !== 's') {
                lastChild = ['s', ''];
                node.push(lastChild);
            }
            lastChild[1] = lastChild[1].replace(/\n$/, '');
            if (this._value) lastChild[1] += '\n';
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node) {
        if (nodeType === 'stylesheet') {
            if (node[node.length - 1][0] === 's' && node[node.length - 1][1].indexOf('\n') !== -1) {
                return true;
            } else {
                return false;
            }
        }
    }
};
cssStyle['leading-zero']  = {

    /**
     * Sets handler value.
     *
     * @param {Boolean} value Option value
     * @returns {Object|undefined}
     */
    setValue: function(value) {
        if (value === true || value === false) {
            this._value = value;
            return this;
        }
    },

    /**
     * Processes tree node.
     * @param {String} nodeType
     * @param {node} node
     */
    process: function(nodeType, node) {
        if (nodeType === 'number') {
            if (this._value) {
                if (node[0][0] === '.')
                    node[0] = '0' + node[0];
            } else {
                node[0] = node[0].replace(/^0+(?=\.)/, '');
            }
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {String} nodeType
     * @param {node} node
     */
    detect: function(nodeType, node) {
        if (nodeType === 'number') {
            if (node.toString().match(/^\.[0-9]+/)) {
                return false;
            } else if (node.toString().match(/^0\.[0-9]+/)) {
                return true;
            }
        }
    }
};


