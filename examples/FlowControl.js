require(["exampleWidget"], function (exampleWidget) {
    function PersonScript(photon, example) {
        example.Person = photon.observable.model.define({
            firstName:'',
            lastName:''
        });
    }

    function RootModelScript(photon, example) {
        example.PersonCollection = photon.observable.model.define({
            itemToAdd:null,
            items:{
                type:'Collection'
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
                this.itemToAdd(new example.Person());
            },
            discardChanges:function () {
                this.itemToAdd(null);
            }
        });
    }

    function PageScript(photon, example) {
        $(function () {
            photon.binding.applyBindings(new example.PersonCollection());
        });
    }

    exampleWidget.add([
        {
            id:"example1",
            javaScript:[
                {
                    title:'Person.js',
                    code:PersonScript,
                    isRunnable:true
                },
                {
                    title:'PersonCollection.js',
                    code:RootModelScript,
                    isRunnable:true
                },
                {
                    title:'Page.js',
                    code:PageScript,
                    isRunnable:true
                }
            ],
            html:'example1',
            css:'exampleStyles'
        }
    ]);
});

