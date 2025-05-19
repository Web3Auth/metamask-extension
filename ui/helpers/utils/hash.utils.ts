import { keccak256 } from 'ethereumjs-util';

export const getKeccak256HashAsHexString = (value: string) => {
  const buffer = Buffer.from(value, 'utf8');
  return keccak256(buffer).toString('hex');
};
