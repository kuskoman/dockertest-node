import { arrayFromRange } from "./math";

describe("math utils", () => {
    describe(arrayFromRange.name, () => {
        it("should throw an error when min is greater than max", () => {
            expect(() => arrayFromRange(5, 1)).toThrow(RangeError);
        });

        it("should throw an error when at least one of numbers is not integer", () => {
            expect(() => arrayFromRange(1, 1.4)).toThrow(TypeError);
            expect(() => arrayFromRange(1.3, 1.4)).toThrow(TypeError);
            expect(() => arrayFromRange(1, Infinity)).toThrow(TypeError);
            expect(() => arrayFromRange(1, NaN)).toThrow(TypeError);
        });

        it("should return number range excluding max for valid input", () => {
            expect(arrayFromRange(1, 3)).toStrictEqual([1, 2]);
        });
    });
});
