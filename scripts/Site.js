require(["photon", "jquery"], function (photon, $) {
    var cache = photon.templating.getCache();
    cache.addResourceUrl([bootstrapper.baseUrl + "Templates/PageTemplates.html"], function () {
        var NavigationBar = function (initialValues) {
            NavigationBar.base(this, initialValues);

            var item = photon.array.find(this.items().unwrap(), function (item) {
                return location.pathname.toLowerCase().indexOf(item.href.toLowerCase()) !== -1;
            });

            this.activeItem(item);
        }

        photon.observable.model.define(NavigationBar, {
            items:{
                type:'ObservableArray'
            },
            activeItem:null
        });

        var navigationBar = new NavigationBar({
            items:[
                {
                    title:'Home',
                    href:'Main.html'
                },
                {
                    title:'Live Examples',
                    href:'examples/ClassBinding.html'
                }
            ]});

        $(function () {
            photon.binding.applyBindings(navigationBar, $("#navigationBar")[0], 'navigationBar');
            $("body").show();
        });
    });
});
