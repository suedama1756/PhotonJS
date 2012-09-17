var TEST_NUMBER = 1.0;
var TEST_STRING = 'TEST';
var TEST_BOOLEAN = true;
var TEST_OBJECT = {};
var TEST_FUNCTION = function() {
}

describe("photon", function () {
    describe("when querying types", function () {
        it("should identify strings", function () {
            expect(photon.isString(TEST_STRING)).toBe(true);
            expect(photon.isString(new String(TEST_STRING))).toBe(true);
        });

        it ("should identify when not a string", function() {
            expect(photon.isString(TEST_BOOLEAN)).toBe(false);
            expect(photon.isString(TEST_NUMBER)).toBe(false);
            expect(photon.isString(TEST_OBJECT)).toBe(false);
            expect(photon.isString(TEST_FUNCTION())).toBe(false);
        });

        it("should identify numbers", function () {
            expect(photon.isNumber(TEST_NUMBER)).toBe(true);
            expect(photon.isNumber(new Number(TEST_NUMBER))).toBe(true);
        });

        it ("should identify when not a number", function() {
            expect(photon.isNumber(TEST_BOOLEAN)).toBe(false);
            expect(photon.isNumber(TEST_STRING)).toBe(false);
            expect(photon.isNumber(TEST_OBJECT)).toBe(false);
            expect(photon.isNumber(TEST_FUNCTION())).toBe(false);
        });

        it("should identify booleans", function () {
            expect(photon.isBoolean(TEST_BOOLEAN)).toBe(true);
            expect(photon.isBoolean(new Boolean(TEST_BOOLEAN))).toBe(true);
        });

        it ("should identify when not a boolean", function() {
            expect(photon.isBoolean(TEST_NUMBER)).toBe(false);
            expect(photon.isBoolean(TEST_STRING)).toBe(false);
            expect(photon.isBoolean(TEST_OBJECT)).toBe(false);
            expect(photon.isBoolean(TEST_FUNCTION())).toBe(false);
        });


    });
});