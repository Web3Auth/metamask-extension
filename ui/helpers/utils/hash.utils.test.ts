import { getKeccak256HashAsHexString } from "./hash.utils";

describe('Hash utils', () => {
  test('should return same hash for same input', () => {
    const hash1 = getKeccak256HashAsHexString('test');
    const hash2 = getKeccak256HashAsHexString('test');
    expect(hash1).toBe(hash2);
  });

  test('should return different hash for different input', () => {
    const hash1 = getKeccak256HashAsHexString('test');
    const hash2 = getKeccak256HashAsHexString('test2');
    expect(hash1).not.toBe(hash2);
  });
});