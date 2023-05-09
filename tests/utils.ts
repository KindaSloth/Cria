import { describe, it, expect } from 'vitest';
import { take, takeWhile, dropFromString } from '../src/utils';

describe.concurrent('Utils suite', () => {
    it('Should take 4 chars of the string', () => {
        const string = "aaaabbbb";
        const t = take(string, 4);

        expect(t).toBe("aaaa");
    });

    it('Should take until char is equal to \'c\'', () => {
        const test = takeWhile("cccccab", (c) => c === "c");

        expect(test).toBe('ccccc');
        expect(test.length).toBe(5);
    });

    it('Should remove the first 3 chars of the string \"minga\"', () => {
        const test = dropFromString("minga", 3);

        expect(test).toBe("ga");
        expect(test.length).toBe(2);
    });
})