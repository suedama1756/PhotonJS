test = {};
test.namespace1 = {};

/**
 * @exports method1 as test.namespace1.method1
 * @name method1
 * @return {Number}
 */
var method1 = function() {
    return 1;
};
test.namespace1 = method1;
test.namespace2.method1 = function() {
    alert(test.namespace1.method1());
}


