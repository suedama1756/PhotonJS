photon.defineType(
    /**
     * @param {photon.templating.TemplateCacheEntry} [parent]
     */
    photon.templating.TemplateCacheEntry = function (parent, key) {
        this.parent_ = null;
        if (parent) {
            parent.addChild(this);
        }

        if (key) {
            this.key_ = key;
        }
    },
    /**
     * lends : photon.templating.TemplateCacheEntry.prototype
     */
    {
        /**
         * Releases resources associated with the entry
         */
        dispose:function () {
            var children = this.children_;
            if (children) {
                for (var i = 0, n = children.length; i < n; i++) {
                    children[i].dispose();
                }
            }
        },
        /**
         * Gets the entries key
         * @return {*}
         */
        getKey:function () {
            return this.key_;
        },
        /**
         * Adds a child entry
         * @param {photon.templating.TemplateCacheEntry} value
         */
        addChild:function (value) {
            value.parent_ = this;

            var children = this.children_;
            if (children) {
                children.push(value);
            } else {
                /**
                 * Stores child entries
                 * @type {Array}
                 * @private
                 */
                this.children_ = [value];
            }
        },
        /**
         * Gets a child entry by index
         * @param {Number} index
         * @return {photon.templating.TemplateCacheEntry}
         */
        getChild:function (index) {
            return this.children_ ? this.children_[index] : 0;
        },
        /**
         * Gets the number of child entries contained by the entry
         * @return {Number}
         */
        getChildCount:function () {
            return this.children_ ? this.children_.length : 0;
        },
        /**
         * Gets the entries parent
         * @return {photon.templating.TemplateCacheEntry}
         */
        getParent:function () {
            return this.parent_;
        },
        /**
         * Sets the template associated with the entry
         * @param {String|DocumentFragment} value
         */
        setTemplate:function (value) {
            if (this.html_ || this.fragment_) {
                throw new Error("Template cannot be modified once set.");
            }

            if (photon.isDocumentFragment(value)) {
                /**
                 * @type {DocumentFragment}
                 * @private
                 */
                this.fragment_ = value;
            } else {
                /**
                 * @type {String}
                 * @private
                 */
                this.html_ = value;
            }
        },
        /**
         * Gets the template as a html string.
         * @return {String}
         */
        getHtml:function () {
            if (!this.html_) {
                if (!this.fragment_) {
                    return null;
                }
                this.html_ = photon.dom.getHtml(this.fragment_);
            }
            return this.html_;
        },
        /**
         * Gets the template as a document fragment
         * @return {DocumentFragment}
         */
        getFragment:function () {
            if (!this.fragment_) {
                if (!this.html_) {
                    return null;
                }

                // parse html
                var fragmentOrNode = photon.dom.htmlToFragmentOrNode(this.html_);

                // if not already a fragment then wrap in fragment
                var fragment = fragmentOrNode;
                if (!photon.isDocumentFragment(fragmentOrNode)) {
                    fragment = document.createDocumentFragment();
                    fragment.appendChild(fragmentOrNode);
                }

                // set template fragment
                this.fragment_ = fragment;
            }

            // always return a copy
            return this.fragment_.cloneNode(true);
        }
    });
