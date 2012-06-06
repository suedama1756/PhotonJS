photon.defineType(
    photon.binding.data.DataTemplateProperty = function () {
    },
    photon.binding.data.Property,
    {
        getValue:function (binding) {
            return binding.template;
        },
        templatesEqual:function (x, y) {
            if (x === y || (photon.isNullOrUndefined(x) && photon.isNullOrUndefined(y))) {
                return true;
            }

            if (photon.isNullOrUndefined(x) || photon.isNullOrUndefined(y)) {
                return false;
            }

            return x.name === y.name && x.data === y.data && x.each === y.each;
        },
        getFragment:function (name) {
            var templateCache =  photon.templating.getCache();

            var result = templateCache.findFragment(name);
            if (!result) {
                templateCache.addElement(name);
                result = templateCache.findFragment(name);
            }

            return result;
        },

        insertEachBefore:function (parentElement, newElement, referenceElement,
            data, parentDataContext)
        {
            var nodesAppended = [];
            var fragment = document.createDocumentFragment();
            photon.array.forEach(photon.observable.unwrap(data), function (item, index, data) {
                var contentToAppend = (index < data.length - 1) ?
                    newElement.cloneNode(true) :
                    newElement;
                nodesAppended = nodesAppended.concat(
                    this.insertBefore(fragment, contentToAppend, null, item, parentDataContext));
            }, this);
            parentElement.insertBefore(fragment, referenceElement);
            return nodesAppended;
        },

        insertBefore : function(parentElement, newElement, referenceElement,
            data, parentDataContext) {
            var nodesAppended = [];
            if (newElement.nodeType === 11) {
                var childNodes = newElement.childNodes;
                for (var i= 0, n=childNodes.length; i<n; i++) {
                    nodesAppended.push(childNodes[i]);
                }
            } else {
                nodesAppended.push(newElement);
            }
            parentElement.insertBefore(newElement, referenceElement);

            // need to apply bindings after we've been attached to the dom, this is still inefficient when we have multiple levels of flow, need
            // to work on a post apply tree callback mechanism
            photon.array.forEach(nodesAppended, function(node) {
                if (node.nodeType === 1) {
                    photon.binding.applyBindings(data, node, parentDataContext);
                }
            });

            photon.templating.afterRender(nodesAppended);
            return nodesAppended;
        },

        insertBefore2 : function(parentElement, newElement, referenceElement) {
            var nodesAppended = [];
            if (newElement.nodeType === 11) {
                var childNodes = newElement.childNodes;
                for (var i= 0, n=childNodes.length; i<n; i++) {
                    nodesAppended.push(childNodes[i]);
                }
            } else {
                nodesAppended.push(newElement);
            }
            parentElement.insertBefore(newElement, referenceElement);

            // need to apply bindings after we've been attached to the dom, this is still inefficient when we have multiple levels of flow, need
            // to work on a post apply tree callback mechanism
            photon.array.forEach(nodesAppended, function(node) {
                if (node.nodeType === 1) {
                    photon.binding.updateBindings(node);
                }
            });

            photon.templating.afterRender(nodesAppended);
            return nodesAppended;
        },



        collectionChanged:function (event) {
            this.setValue(event.data, true);
        },
        setValue:function (binding, force) {
            var oldValue = binding.template;
            var newValue = binding.getSourceValue();
            if (!force && this.templatesEqual(oldValue, newValue)) {
                return;
            }
            binding.template = newValue;

            var target = binding.getTarget(),
                fragment = this.getFragment(newValue.name);

            // we know the parent, we don't need to look for it, so set it explicitly, faster!!
            var parentDataContext = photon.binding.DataContext.getForElement(target);
            if (newValue.each) {
                // TODO: If the template has changed we will need to re-render everything!!
                if (!this.renderer_) {
                    this.renderer_ = new photon.templating.ItemsRenderer(
                        target, photon.templating.RenderTarget.NextSibling, photon.templating.getCache().getTemplate(newValue.name)
                    );
                    photon.addDisposable(target, this.renderer_);
                }
                this.renderer_.setData(newValue.each);
            }
            else {
                photon.dom.empty(target);
                this.insertBefore(target, fragment, null, newValue.data, parentDataContext);
            }
        }
    });

