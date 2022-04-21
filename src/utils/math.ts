export const arrayFromRange = (min: number, max: number) => {
    if (min > max) {
        throw new RangeError("Min must be lesser than max");
    }

    if (!Number.isInteger(min) || !Number.isInteger(max)) {
        throw new TypeError("Expected both min and max to be valid integers");
    }

    const arrayOfNumbers: number[] = [];

    for (let i = min; i < max; i++) {
        arrayOfNumbers.push(i);
    }

    return arrayOfNumbers;
};
