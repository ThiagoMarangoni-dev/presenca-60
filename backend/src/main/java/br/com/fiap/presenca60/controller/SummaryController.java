package br.com.fiap.presenca60.controller;

import br.com.fiap.presenca60.dto.MonthlySummary;
import br.com.fiap.presenca60.model.User;
import br.com.fiap.presenca60.service.SummaryService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("/summary")
@CrossOrigin(origins = "*")
public class SummaryController {

    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @GetMapping
    public MonthlySummary summary(@AuthenticationPrincipal User user, @RequestParam String month) {
        try {
            if (!month.matches("[0-9]{4}-[0-9]{2}")) throw new IllegalArgumentException();
            YearMonth requestedMonth = YearMonth.parse(month);
            if (requestedMonth.getYear() < 1) throw new IllegalArgumentException();
            return summaryService.summarize(user, requestedMonth);
        } catch (DateTimeParseException | IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o mês no formato YYYY-MM", e);
        }
    }
}
