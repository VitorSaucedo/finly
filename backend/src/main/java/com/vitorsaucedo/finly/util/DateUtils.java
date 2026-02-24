package com.vitorsaucedo.finly.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtils {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private DateUtils() {}

    public static String formatDate(LocalDate date) {
        if (date == null) return null;
        return date.format(DATE_FORMATTER);
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.format(DATE_TIME_FORMATTER);
    }

    public static LocalDate firstDayOfMonth(int month, int year) {
        return LocalDate.of(year, month, 1);
    }

    public static LocalDate lastDayOfMonth(int month, int year) {
        return LocalDate.of(year, month, 1).withDayOfMonth(
                LocalDate.of(year, month, 1).lengthOfMonth()
        );
    }

    public static boolean isCurrentMonth(int month, int year) {
        LocalDate now = LocalDate.now();
        return now.getMonthValue() == month && now.getYear() == year;
    }

    public static boolean isOverdue(LocalDate dueDate) {
        if (dueDate == null) return false;
        return dueDate.isBefore(LocalDate.now());
    }
}