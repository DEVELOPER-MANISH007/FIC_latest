export const isValidMobile = (value: string): boolean => /^[6-9]\d{9}$/.test(value.replace(/\D/g, ""));

export const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isNonEmpty = (value: string): boolean => value.trim().length > 0;

