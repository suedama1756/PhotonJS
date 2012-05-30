function assertNotNullOrUndefined(msg, value) {
    assertNotNull.apply(null, arguments);
    assertNotUndefined.apply(null, arguments);
}

function assertException(msg, callback, error, thisObj) {
    // translate arguments
    if (photon.isFunction(msg)) {
        thisObj = error;
        error = callback;
        callback = msg;
        msg = '';
    }

    try {
        callback.call(thisObj);
        fail(msg + " exception expected, but none was thrown.");
    }
    catch (e) {
        if (error instanceof Error) {
            if (!e instanceof Error) {
                fail(msg);
            }
            assertEquals(msg, error.message, e.message);
        }
        else {
            assertEquals(msg, e, error);
        }
    }
}

function assertArrayContains(msg, array, value) {
    var args = argsWithOptionalMsg_(arguments, 3);
    jstestdriver.assertCount++;

    if (photon.array.indexOf(args[1], args[2]) === -1) {
        fail(args[0] + " expected array to contain " + args[2] + ", but value was not found.");
    }
}

function assertHtml(expectedHtml, html) {
    // verify content (case insensitive as tag case gets change differently depending on browser!!)
    assertEquals(photon.string.trim(expectedHtml.toLowerCase()),
        photon.string.trim(html.toLowerCase()));
}

function assertFragmentHtml(expectedHtml, fragment) {
    assertNotNull(fragment);
    assertEquals(11, fragment.nodeType);

    // must push into a real dom element to access innerHTML
    var tempDiv = document.createElement("div");
    tempDiv.appendChild(fragment);

    this.assertHtml(expectedHtml,
        photon.string.trim(tempDiv.innerHTML));
}

function bindNodeObject(obj) {
    assertNotNullOrUndefined("obj is null or undefined in bindNodes", obj);
    for (var propertyName in obj) {
        if (obj.hasOwnProperty(propertyName)) {
            obj[propertyName] = $("#" + propertyName)[0];
            assertNotNullOrUndefined("Node with id " + propertyName + "could not be found", obj[propertyName]);
        }
    }
    return obj;
}

jstestdriver.toHtml = function (c, e) {
    var b = e.createDocumentFragment();
    var d = e.createElement("div");

    // strip out extra white space, makes it easier for us to compare html
    var lines = c.split(/\r|\n/gi);
    for (var i=0;i<lines.length; i++) {
        lines[i] = photon.string.trim(lines[i]);
    }
    c = lines.join('');

    // add BR to work around IE quirks
    d.innerHTML = "<br>" + jstestdriver.trim(
        jstestdriver.stripHtmlComments(c));
    // remove BR as it should never have been required
    d.removeChild(d.firstChild);
    while (d.firstChild) {
        b.appendChild(d.firstChild);
    }
    var a = b.childNodes.length > 1 ? b : b.firstChild;
    return a;
};

function invokeCommentDependentHtmlWriter(fn, obj) {
    // replace the stripHtmlComment method temporarly
    var old = jstestdriver.stripHtmlComments;
    try {
        jstestdriver.stripHtmlComments = function (h) {
            return h;
        };
        fn.call(obj);
    }
    finally {
        jstestdriver.stripHtmlComments = old;
    }
}

photon.testing = {};

photon.testing.mock = {};

photon.testing.mock.recordCalls = function (obj, name) {
    var originalFn = obj[name];
    var modifiedFn = function () {
        modifiedFn.log(arguments);

        if (originalFn) {
            originalFn.apply(this, arguments);
        }
    };

    photon.extend(modifiedFn, {
        getLog : function() {
            return (this.log_ = this.log_ || []);
        },
        log:function (args) {
            this.getLog().push(photon.array.toArray(args));
        },
        assertWasCalled:function (times, arg1 /* arg2, arg3... */) {
            var args = photon.array.toArray(arguments, 1);
            if (args.length === 0) {
                assertEquals("Function '" + name + "' was not called the expected number of times", times, this.getLog().length);
            } else {
                assertEquals(times, photon.array.filter(this.getLog(), function(logArgs) {
                    return compare_(logArgs, args);
                }).length);
            }
        }
    });

    obj[name] = modifiedFn;
};

timeCall = function(fn, thisObj, args) {
    var start = (new Date).getTime();
    fn.apply(thisObj, args);
    return (new Date).getTime() - start;
}


DefineTestCase = function (suiteName, testCaseName, prototype /* ... */) {
    var obj = {};

    var args = arguments;
    for (var i = 1; i < args.length; i++) {
        var arg = args[i];
        photon.array.forEach(photon.object.getOwnPropertyNames(arg), function (propertyName) {
            if (propertyName.indexOf("Should") === 0) {
                obj["test: " + propertyName] = arg[propertyName];
            } else {
                obj[propertyName] = arg[propertyName];
            }
        });
    }

    obj.setUp = function () {
        if (this.createSystemUnderTest) {
            this.systemUnderTest_ = this.createSystemUnderTest();
        }

        if (this.requiredHtmlResources) {
            if (photon.isArray(this.htmlResources)) {
                photon.array.forEach(this.htmlResources, function (htmlResource) {
                    invokeCommentDependentHtmlWriter(this.htmlResources[htmlResource], this);
                }, this);
            }
            else {
                invokeCommentDependentHtmlWriter(this.htmlResources[this.requiredHtmlResources], this);
            }
        }
        if (this.becauseOf) {
            this.becauseOf();
        }
    };

    TestCase(suiteName + ": " + testCaseName, obj);
};

DefineTestSuite = function (suiteName, testCases, defaultTestCasePrototype) {
    var testCaseNames = photon.object.getOwnPropertyNames(testCases);
    photon.array.forEach(testCaseNames, function (testCaseName) {
        var testCasePrototype = testCases[testCaseName];
        DefineTestCase.apply(null, [suiteName, testCaseName].concat(
            defaultTestCasePrototype,
            testCasePrototype));
    });
};
