import { format, parseISO } from "date-fns";

export const formatDate = (date: string): string => {
  return format(parseISO(date), "dd/MM/yyyy");
};

export const formatDateTime = (date: string): string => {
  return format(parseISO(date), "dd/MM/yyyy HH:mm");
};

export const formatMonth = (month: number, year: number): string => {
  return format(new Date(year, month - 1), "MMMM yyyy");
};
