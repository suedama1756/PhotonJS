require(["exampleWidget"], function (photon) {
    function PersonScript(photon) {
        photon.Person = photon.observable.model.define({
            firstName:'',
            lastName:''
        });
    }

    function RootViewModelScript(photon) {
        photon.RootViewModel = photon.observable.model.define({
            itemToAdd:null,
            items:{
                type:'ObservableArray'
            },
            add:function () {
                if (this.itemToAdd()) {
                    this.items().push(this.itemToAdd());
                    this.itemToAdd(null);
                }
            },
            remove:function (item) {
                this.items().remove(item);
            },
            createNew:function () {
                this.itemToAdd(new photon.Person());
            },
            discardChanges:function () {
                this.itemToAdd(null);
            }
        });
    }

    function PageScript(photon) {
        $(function () {
            photon.binding.applyBindings(new photon.RootViewModel());
        });
    }

    photon.examples.initialize([
        {
            id:"example1",
            javaScript:[
                {
                    title:'Person.js',
                    code:PersonScript
                },
                {
                    title:'RootViewModel.js',
                    code:RootViewModelScript
                },
                {
                    title:'Page.js',
                    code:PageScript
                }
            ],
            html:'example1',
            css:'exampleStyles'
        }
    ]);
});

