import { RangePreset } from "types";

export type DateRange = [Date, Date];

export const isRangePreset = (value: any): value is RangePreset =>
  ["Day", "Week", "Month", "Year"].includes(value);

export const presetToDateRange = (preset: RangePreset): DateRange => {
  const now = new Date();
  const start = new Date();

  switch (preset) {
    case "Day":
      start.setHours(0, 0, 0, 0);
      break;
    case "Week":
      start.setDate(now.getDate() - 7);
      break;
    case "Month":
      start.setMonth(now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      break;
    case "Year":
      start.setFullYear(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      break;
  }
  return [start, now];
};
