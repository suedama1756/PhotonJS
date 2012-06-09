photon.templating.ConditionalRenderer = function (referenceElement, renderTarget, template) {
    photon.templating.ConditionalRenderer.base(this, referenceElement, renderTarget, template);
}

photon.defineType(photon.templating.ConditionalRenderer,
    photon.templating.Renderer,
    /**
     * @lends photon.templating.Renderer.prototype
     */
    {
        refresh:function () {
            var renderedNodes = this.renderedNodes_, referenceElement = this.referenceElement_;
            if (this.data_) {
                if (renderedNodes) {
                    return;
                }

                var fragment = this.template_.getFragment();
                this.renderedNodes_ = this.renderTarget_ === photon.templating.RenderTarget.Child ?
                    photon.binding.data.properties["data.template"].insertBefore2(referenceElement, fragment, null) :
                    photon.binding.data.properties["data.template"].insertBefore2(referenceElement.parentNode, fragment, referenceElement.nextSibling);
            }
            else if (renderedNodes) {
                photon.array.forEach(renderedNodes,
                    photon.dom.removeAndClean);
                this.renderedNodes_ = null;
            }
        }
    });
