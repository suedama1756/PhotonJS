photon.templating.ConditionalRenderer = function (referenceElement, renderTarget, template) {
    photon.templating.ConditionalRenderer.base(this, referenceElement, renderTarget, template);
};

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
                this.renderedNodes_ = this.renderTarget_ === photon.templating.RenderTarget.Child ?
                    this.template_.insertBefore(referenceElement, null) :
                    this.template_.insertBefore(referenceElement.parentNode, referenceElement.nextSibling, referenceElement);
            }
            else if (renderedNodes) {
                photon.array.forEach(renderedNodes,
                    photon.dom.removeAndClean);
                this.renderedNodes_ = null;
            }
        }
    });
