photon.defineType(
    photon.templating.TemplateCache = function () {
        /**
         * Template storage
         * @private
         */
        this.entries_ = {};
    },
    /**
     * @lends photon.templating.TemplateCache.prototype
     */
    {
        resourceDelimiterRegEx:/<!--\s*Template:\s*([\w\.]*)\s*-->/,
        /**
         * Gets an entry by name, an exception is thrown if the entry cannot be found.
         * @private
         * @returns {photon.templating.TemplateCacheEntry}
         */
        getEntry:function (name) {
            return assert(this.entries_[name],
                "No template could be found with key '{0}'.", name);
        },
        /**
         * Finds an entry by name;
         * @param name
         * @return {photon.templating.TemplateCacheEntry}
         */
        findEntry:function(name) {
            return this.entries_[name];
        },
        /**
         * Removes the template with the specified name
         * @param {string} name
         * @returns {boolean} true; if the template was removed; otherwise, false.
         */
        remove:function (name) {
            var entry = this.entries_[name];
            if (entry) {
                entry.dispose();
            }
            return delete this.entries_[name];
        },
        /**
         * Clears the cache
         */
        clear:function () {
            photon.array.forEach(photon.object.getOwnPropertyNames(this.entries_), function (name) {
                this.remove(name);
            }, this);
        },
        /**
         * Gets the template with the specified name as a html fragment, an exception is thrown if the template does not exist.
         *
         * A clone of the fragment stored in the cache is returned each time this method is called.
         *
         * @param {String} name The name of the template to find.
         * @returns {String} The template
         */
        getFragment:function (name) {
            return this.getEntry(name).getFragment();
        },
        /**
         * Finds the template with the specified name, no exception is thrown if the template does not exist.
         *
         * A clone of the fragment stored in the cache is returned each time this method is called.
         *
         * @param {String} name The name of the template to find.
         * @returns {String} The template
         */
        findFragment:function (name) {
            var result = this.entries_[name];
            return result ? result.getFragment() : null;
        },
        /**
         * Gets the template with the specified name as a html string, an exception is thrown if the template does not exist.
         *
         * @param {String} name The name of the template to find.
         * @returns {String} The template
         */
        getHtml:function (name) {
            return this.getEntry(name).getHtml();
        },
        /**
         * Finds the template with the specified name, no exception is thrown if the template does not exist.
         *
         * @param {String} name The name of the template to find.
         * @returns {String} The template
         */
        findHtml:function (name) {
            var result = this.entries_[name];
            return result ? result.template : null;
        },
        /**
         * Adds a template to the cache.
         * @param {string} name The template name
         * @param {string} html The template
         */
        addHtml:function (name, html) {
            // always remove
            this.remove(name);

            // wrap in "div" to ensure query selectors and work!!
            var templateElement = photon.dom.wrap(
                photon.dom.htmlToFragmentOrNode(html), "div");

            var childEntries = photon.templating.prepareFlowTemplates(
                templateElement);

            var entry = new photon.templating.TemplateCacheEntry(null, name);
            if (childEntries.length > 0) {
                entry.setTemplate(templateElement.innerHTML);
                photon.array.forEach(childEntries, function (childEntry) {
                    this.addChild(childEntry);
                }, entry);
            }
            else {
                entry.setTemplate(html);
            }

            this.entries_[name] = entry;
        },
        /**
         * Adds an a template to the cache based on an element's inner HTML. If no name is supplied the elements
         * id is used to identify the template in the cache.
         *
         * @param {HTMLElement|String} elementOrId The element, or id of the element to get
         * the template from.
         * @param {String} [name] Alternative name to use for the template.
         */
        addElement:function (elementOrId, name) {
            var element = photon.isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
            assert(element,
                "Invalid element specification {0}.", elementOrId);
            assert(name ? name : name = element.id,
                "A name must be specified if the element does not have an id.");
            this.addHtml(name, element.innerHTML);
        },
        /**
         * Adds templates to the cache based on a "resource" element's inner HTML. "Resource" elements define multiple
         * templates delimited by comments in the form: &lt;!-- Template:<Name> --&gt;
         *
         * Example:
         * <script id="person">
         *      &lt;!-- Template:firstName --&gt;
         *      <span>firstName: <span data-bind="firstName"></span></span>
         *      &lt;!-- Template:surname --&gt;
         *      <span>surname: <span data-bind="surname"></span></span>
         * </script>
         *
         * If no name parameter is supplied the elements id is used as the base name for the templates. The above
         * example will add two templates, person.firstName, and person.surname.
         *
         * @param {HTMLElement|String} elementOrId The element, or id of the element to get
         * the template from.
         * @param {String} [name] Alternative base name to use for the template.
         */
        addResourceElement:function (elementOrId, name) {
            var element = photon.isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
            assert(element,
                "Invalid element specification {0}.", elementOrId);
            this.addResourceHtml(name || element.id, element.innerHTML);
        },
        /**
         * Adds templates to the cache from "resource" html snippet. "Resource" html snippets define multiple
         * templates delimited by comments in the form: &lt;!-- Template:<Name> --&gt;
         *
         * Example:
         *      &lt;!-- Template:firstName --&gt;
         *      <span>firstName: <span data-bind="firstName"></span></span>
         *      &lt;!-- Template:surname --&gt;
         *      <span>surname: <span data-bind="surname"></span></span>
         *
         * @param {string} name The root name to use for templates loaded from the resource. Names will be
         * added in the form 'rootName.<name>'.
         * @param {string} html A resource containing templates.
         * @param {RegExp} [templateDelimiter] Optional delimiter for overriding the default regex used to
         * split the templates.
         */
        addResourceHtml:function (name, html, templateDelimiter) {
            html = photon.string.trim(html);
            var templateParts = photon.string.split(html,
                templateDelimiter || this.resourceDelimiterRegEx);

            if (templateParts.length === 1) {
                this.addHtml(name, templateParts[0]);
            }
            else {
                name = name ? name + "." : "";
                for (var i = templateParts[0] ? 0 : 1, n = templateParts.length; i < n; i += 2) {
                    if (i === n) {
                        break;
                    }
                    this.addHtml(name + templateParts[i],
                        photon.string.trim(templateParts[i + 1]));
                }
            }
        },
        /**
         * Adds template resources from a url
         * @param {String|Array} resourceUrl
         * @param {Function} callback
         * @param {RegExp} [templateSplitRegEx]
         */
        addResourceUrl:function (resourceUrl, callback, templateSplitRegEx) {
            var self = this;

            if (!photon.isArray(resourceUrl)) {
                resourceUrl = [resourceUrl];
            }

            var completedSynchronously = true;

            var event = {
                isSuccess:true
            };

            function complete(success) {
                event.isSuccess = event.isSuccess && success;
                if (!(--remaining) && callback) {
                    event.completedSynchronously = completedSynchronously;
                    callback(event);
                }
            }

            function getTemplate(url) {
                $.ajax({
                    type:"GET",
                    url:url
                })
                    .done(function (template) {
                        var isSuccess = true;
                        try {
                            $(template).filter('script').each(function (i, x) {
                                self.addResourceHtml(x.id, $(x).html(), templateSplitRegEx);
                            });
                        } catch (e) {
                            isSuccess = false;
                            if (!callback) {
                                throw e;
                            }
                        }

                        complete(isSuccess);
                    })
                    .fail(function () {
                        complete(false);
                    });
            }

            // load templates
            var remaining = resourceUrl.length;
            for (var i = 0, n = remaining; i < n; i++) {
                getTemplate(resourceUrl[i]);
            }

            // if this variable is written before the callbacks are complete then we didn't complete synchronously
            completedSynchronously = false;
        }
    });

/**
 * The default template cache
 * @type {photon.templating.TemplateCache}
 */
var templateCache = new photon.templating.TemplateCache();

/**
 * Gets the default template cache
 * @return {photon.templating.TemplateCache}
 */
photon.templating.getCache = function () {
    return templateCache;
};
