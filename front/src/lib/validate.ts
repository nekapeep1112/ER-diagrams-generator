export const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v.trim());
export const isMinLength = (v: string, min: number) => v.trim().length >= min;
export const matches = (a: string, b: string) => a === b;
