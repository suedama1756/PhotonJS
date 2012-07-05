/**
 *  @namespace 'photon.binding.data.properties'
 */
provide('photon.binding.data.properties');

photon.extend(photon.binding.data.properties,
    /**
     * @lends photon.binding.data.properties
     */
    {
        'null':{},
        'property':new photon.binding.data.Property(),
        'property.value':new photon.binding.data.InputProperty(),
        'property.checked':new photon.binding.data.InputProperty(),
        'property.focus':new photon.binding.data.FocusProperty(),
        'style':new photon.binding.data.StyleProperty(),
        'attribute':new photon.binding.data.AttributeProperty(),
        'data.context':new photon.binding.data.DataContextProperty(),
        'data.template':new photon.binding.data.DataTemplateProperty(),
        'class':new photon.binding.data.ClassProperty()
    }
);

