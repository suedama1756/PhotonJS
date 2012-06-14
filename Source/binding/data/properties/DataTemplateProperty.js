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
                if (!this.renderer_ || !this.renderer_.getReferenceElement()) {
                    this.renderer_ = new photon.templating.ItemsRenderer(
                        target, photon.templating.RenderTarget.NextSibling, photon.templating.getCache().getTemplate(newValue.name)
                    );
                    photon.addDisposable(target, this.renderer_);
                }
                this.renderer_.setData(newValue.each);
            }
            else {
                photon.dom.empty(target);
                photon.templating.insertBeforeAndApplyBindings(target, fragment, null, newValue.data, parentDataContext);
            }
        }
    });

