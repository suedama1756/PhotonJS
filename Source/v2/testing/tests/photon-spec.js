var TEST_NUMBER = 1.0;
var TEST_STRING = 'TEST';
var TEST_BOOLEAN = true;
var TEST_OBJECT = {};
var TEST_FUNCTION = function () {
};

function createMasqueradingType(masqueradingAs) {
    function Type() {
    }

    Type.prototype.toString = function () {
        return Object.prototype.toString.call(masqueradingAs);
    };

    return new Type();
}

describe("photon", function () {
    describe("when querying types", function () {
        it("should identify strings", function () {
            expect(photon.isString(TEST_STRING)).toBe(true);
            expect(photon.isString(new String(TEST_STRING))).toBe(true);
        });

        it("should identify when not a string", function () {
            expect(photon.isString(TEST_BOOLEAN)).toBe(false);
            expect(photon.isString(TEST_NUMBER)).toBe(false);
            expect(photon.isString(TEST_OBJECT)).toBe(false);
            expect(photon.isString(TEST_FUNCTION())).toBe(false);
        });

        it("should distinguish between strings and types masquerading as strings", function () {
            expect(photon.isString(createMasqueradingType(TEST_STRING))).toBe(false);
        });

        it("should identify numbers", function () {
            expect(photon.isNumber(TEST_NUMBER)).toBe(true);
            expect(photon.isNumber(new Number(TEST_NUMBER))).toBe(true);
        });

        it("should identify when not a number", function () {
            expect(photon.isNumber(TEST_BOOLEAN)).toBe(false);
            expect(photon.isNumber(TEST_STRING)).toBe(false);
            expect(photon.isNumber(TEST_OBJECT)).toBe(false);
            expect(photon.isNumber(TEST_FUNCTION())).toBe(false);
        });

        it("should distinguish between numbers and types masquerading as numbers", function () {
            expect(photon.isString(createMasqueradingType(TEST_NUMBER))).toBe(false);
        });

        it("should identify booleans", function () {
            expect(photon.isBoolean(TEST_BOOLEAN)).toBe(true);
            expect(photon.isBoolean(new Boolean(TEST_BOOLEAN))).toBe(true);
        });

        it("should identify when not a boolean", function () {
            expect(photon.isBoolean(TEST_NUMBER)).toBe(false);
            expect(photon.isBoolean(TEST_STRING)).toBe(false);
            expect(photon.isBoolean(TEST_OBJECT)).toBe(false);
            expect(photon.isBoolean(TEST_FUNCTION())).toBe(false);
        });

        it("should distinguish between booleans and types masquerading as booleans", function () {
            expect(photon.isString(createMasqueradingType(TEST_BOOLEAN))).toBe(false);
        });


        it("should identify when a function", function () {
            expect(photon.isFunction(TEST_FUNCTION)).toBe(true);
            expect(photon.isFunction(new Function("return 1;"))).toBe(true);
        });

        it("should identify when not a function", function () {
            expect(photon.isFunction(TEST_NUMBER)).toBe(false);
            expect(photon.isFunction(TEST_STRING)).toBe(false);
            expect(photon.isFunction(TEST_OBJECT)).toBe(false);
            expect(photon.isFunction(TEST_BOOLEAN)).toBe(false);
        });
    });

    describe("when querying whether undefined", function () {
        it("should identify when undefined", function () {
            var undefinedValue;
            expect(photon.isUndefined(undefinedValue)).toBe(true);
        });

        it("should identify when not undefined", function () {
            expect(photon.isUndefined({})).toBe(false);
        });

        it("should not confuse null with undefined", function () {
            expect(photon.isUndefined(null)).toBe(false);
        });
    });

    describe("when querying whether null or undefined", function () {
        it("should identify when null or undefined", function () {
            var undefinedValue;
            expect(photon.isNullOrUndefined(undefinedValue)).toBe(true);
            expect(photon.isNullOrUndefined(null)).toBe(true);
        });

        it("should identify when not null or undefined", function () {
            expect(photon.isNullOrUndefined({})).toBe(false);
        });

        it("should not confuse falsy values with null or undefined", function () {
            expect(photon.isNullOrUndefined(0)).toBe(false);
        });
    });

    describe("when extending", function () {

    });
});
