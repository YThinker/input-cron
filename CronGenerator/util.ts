import { CRON_KEY } from ".";

const formatFunction = (value: string, min: number, max: number) => {
  if (isNaN(+value)) {
    return String(min);
  }
  if (+value > max) {
    return String(max);
  }
  if (+value < min) {
    return String(min);
  } else {
    return value;
  }
};
export function formatPayload(value: string, min: number, max: number): string;
export function formatPayload(
  value: string[],
  min: number,
  max: number
): string[];
export function formatPayload(
  value: string | string[],
  min: number,
  max: number
) {
  if (Array.isArray(value)) {
    return value.map((item) => formatFunction(item, min, max));
  }
  return formatFunction(value, min, max);
}

export const analyzeTabDisabled = (
  key: CRON_KEY,
  disabled?: boolean | CRON_KEY[] | Partial<Record<CRON_KEY, number[]>>
) => {
  if (disabled === true) {
    return disabled;
  }
  if (Array.isArray(disabled)) {
    return disabled.includes(key);
  }
  return false;
};
export const analyzeSelectorDisabled = (
  key: CRON_KEY,
  disabled?: boolean | CRON_KEY[] | Partial<Record<CRON_KEY, number[]>>
) => {
  if (disabled === true) {
    return disabled;
  }
  if (Array.isArray(disabled)) {
    return disabled.includes(key);
  }
  if (typeof disabled === "object") {
    return disabled[key];
  }
  return false;
};
export const analyzeGroupDisabled = (
  index: number,
  disabled?: boolean | number[]
) => {
  if (disabled === true) {
    return disabled;
  }
  if (Array.isArray(disabled)) {
    return disabled.includes(index);
  }
  return false;
};
export const isEmptyRadioValue = (value: unknown) => {
  return value === '' || value === undefined || value === null
}
