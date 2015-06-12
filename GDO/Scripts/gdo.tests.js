///<reference path="~/Scripts/jasmine/jasmine.js"/>
///<reference path="~/Scripts/gdo.net.js"/>

describe("test", function () {
    var test = new test();

    it("should multiple two positive numbers", function () {
        var result = test.multiple(2, 5);

        expect(result).toBe(10);
    });
});
