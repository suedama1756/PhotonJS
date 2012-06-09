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
                expression.getPropertyHandler().getValue(this));
        },
        getSourceValue:function () {
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
                       this.updateSourceValue(null);
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

            // TDO: this has bitten once, really need to look into it
            var expression = this.getExpression();
            if (expression.getPropertyType() === "data" && expression.getPropertyName() === "context") {
                var target = this.getTarget();
                // it is important we create the target data context before we set our data context, as changes
                // to our data context will cause the target to be updated, and if its not there!!!
                var targetDataContext = photon.binding.NodeBindingInfo.getOrCreateForElement(target)
                    .getOrCreateDataContext();
                targetDataContext.setName(this.getExpression().getName());
                this.setDataContext(photon.binding.DataContext.getForElement(target.parentNode));
                targetDataContext.setParent(this.getDataContext());
            }
            else {
                this.updateDataContext();
            }
        }
    });