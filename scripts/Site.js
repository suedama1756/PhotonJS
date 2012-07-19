require(["photon", "jquery", "bootstrapDropDown"], function (photon, $) {
    var cache = photon.templating.getCache();
    cache.addResourceUrl([bootstrapper.baseUrl + "templates/page-templates.html"], function () {
        var NavigationBar = function (initialValues) {
            NavigationBar.base(this, initialValues);

            function findItem(items, path) {
                return photon.array.find(items, function (item) {
                    if (item.children) {
                        return findItem(item.children, path) != null;
                    }
                    return path.toLowerCase().indexOf(item.href.toLowerCase()) !== -1;
                });
            }

            var item = findItem(this.items().unwrap(), location.pathname);
            this.activeItem(item);
        };

        photon.observable.model.define(NavigationBar, {
            items:{
                type:'ObservableArray'
            },
            activeItem:null
        });

        var navigationBar = new NavigationBar({
            items:[
                {
                    id:"home",
                    title:'Home',
                    href:'main.html'
                },
                {
                    id:"liveExamples",
                    title:'Live Examples',
                    children:[
                        {
                            id:'basicBinding',
                            title:'Basic Binding',
                            href:'examples/SimpleBinding.html'
                        },
                        {   id:'selectBinding',
                            title:'Select Properties',
                            href:'examples/SelectProperties.html'
                        },
                        {
                            id:'cssClassBinding',
                            title:'CSS Class Binding',
                            href:'examples/ClassBinding.html'
                        },
                        {
                            id:'flowBinding',
                            title:'Flow Binding',
                            href:'examples/FlowBinding.html'
                        }
                    ]
                }
            ]});

        $(function () {
            photon.binding.applyBindings(navigationBar, $("#navigationBar")[0], 'navigationBar');
            $("body").show();
            $('.dropdown-toggle').dropdown();
        });
    });
});
