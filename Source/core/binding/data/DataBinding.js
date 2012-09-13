/**
 * Creates a new instance of the photon.binding.data.DataBinding type
 * @param {HTMLElement} target
 * @param {photon.binding.data.DataBindingExpression) expression
 * @constructor
 * @extends photon.binding.BindingBase
 */
photon.binding.data.DataBinding = function (target, expression) {
    photon.binding.data.DataBinding.base(this, target, expression);
};

photon.defineType(
    /**
     * Constructor
     */
    photon.binding.data.DataBinding,
    /**
     * Ancestor
     */
    photon.binding.BindingBase,
    /**
     * @lends photon.binding.data.DataBinding.prototype
     */
    {
        dispose : function() {
            this.superType.dispose.call(this);
            if (this.dependencyTracker_) {
                this.dependencyTracker_.dispose();
                this.dependencyTracker_ = null;
            }
        },
        beginInitialize : function() {
            photon.binding.data.DataBinding
                .superType.beginInitialize.call(this);
           this.getExpression().getPropertyHandler().beginInitialize(this);
        },
        endInitialize : function() {
            photon.binding.data.DataBinding
                .superType.endInitialize.call(this);
            this.getExpression().getPropertyHandler().endInitialize(this);
        },
        bindUpdateSourceEvent:function (eventTypes) {
            if (photon.isArray(eventTypes)) {
                eventTypes = eventTypes.join(" ");
            }
            $(this.target_).bind(eventTypes, this, this.targetChanged);
        },
        targetChanged:function (event) {
            event.data.updateSource(event);
        },
        updateSource:function () {
            var expression = this.getExpression();
            expression.setSourceValue(this.getDataContext(), null,
                this.sourceValue_ = expression.getPropertyHandler().getValue(this));
        },
        getSourceValue:function () {
            // TODO: hacky way to make template parent available, we need a generic way to make additional properties available, this could probably be best done by supplying the binding iteself
            window.$templateParent = this.templateParent_;
            return this.getExpression().getSourceValue(this.getDataContext(),
               this.dependencyTracker_);
        },
        getBindingMode:function () {
            var bindingMode = this.expression_.getMode() || photon.binding.data.DataBindingMode.Default;
            var propertyHandler = this.getExpression().getPropertyHandler();
            if (bindingMode === photon.binding.data.DataBindingMode.Default) {
                bindingMode = propertyHandler.getDefaultBindingMode ?
                    propertyHandler.getDefaultBindingMode(this) :
                    photon.binding.data.DataBindingMode.OneWay;
            }
            return bindingMode;
        },

        dataSourceChanged : function() {
            this.updateSourceValue(this.dependencyTracker_);
        },

        updateSourceValue : function(dependencyTracker) {
            var expression = this.getExpression();

            var sourceValue = expression.getSourceValue(this.getDataContext(),
                dependencyTracker);

            if (this.sourceValue_ !== sourceValue) {
                this.sourceValue_ = sourceValue;
                this.sourceValueChanged();
            }
        },

        sourceValueChanged : function() {
            this.getExpression().getPropertyHandler().setValue(this);
        },

        ensureInitialized : function() {
           if (!this.isInitialized_) {
               this.dependencyTracker_ = new photon.observable.DependencyTracker(
                   function() {
                       this.updateSourceValue(this.dependencyTracker_);
                   }, this);
               photon.addDisposable(this.target_, this.dependencyTracker_);

               var bindingMode = this.getBindingMode();
               if (bindingMode === photon.binding.data.DataBindingMode.TwoWay) {
                   this.expression_.getPropertyHandler().bindUpdateSourceTriggers(this);
               }

               this.isInitialized_ = true;
           }
        },

        bind:function () {
            this.ensureInitialized();

            // TODO: this has bitten once, really need to look into it
            var expression = this.getExpression();
            if (expression.getPropertyType() === "data" && expression.getPropertyName() === "context") {
                var target = this.getTarget();

                var localDataContext = photon.binding.DataContext.getLocalForElement(target);
                if (localDataContext && !localDataContext.isInherited) {
                    localDataContext.setName(expression.getName());
                    localDataContext.setBinding(this);
                }
                else {
                    localDataContext = photon.binding.NodeBindingInfo.getOrCreateForElement(target)
                        .getOrCreateDataContext();
                    localDataContext.setName(expression.getName());
                    localDataContext.setParent(
                        photon.binding.DataContext.getForElement(target.parentNode));

                    // TODO: Hacky, should be able to set whether the value is inherited as part of setting options
                    // on a data context. Should also look at setting options on a data context atomically.
                    localDataContext.isInherited = true;

                    // track the parent data context, when it changes update the binding
                    this.setDataContext(localDataContext.getParent());
                }
            }
            else {
                this.updateDataContext();
            }
        }
    });