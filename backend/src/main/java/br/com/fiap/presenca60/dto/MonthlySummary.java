package br.com.fiap.presenca60.dto;

import java.time.LocalDate;

public record MonthlySummary(
        String month,
        LocalDate referenceDate,
        int eligibleDays,
        int officeDays,
        int requiredDays,
        int remainingDays,
        Double attendancePercent,
        int targetPercent,
        boolean targetReached
) {
}
