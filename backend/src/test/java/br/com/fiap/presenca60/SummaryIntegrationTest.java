package br.com.fiap.presenca60;

import br.com.fiap.presenca60.dto.MonthlySummary;
import br.com.fiap.presenca60.model.Attendance;
import br.com.fiap.presenca60.model.AttendanceType;
import br.com.fiap.presenca60.model.User;
import br.com.fiap.presenca60.repository.AttendanceRepository;
import br.com.fiap.presenca60.repository.UserRepository;
import br.com.fiap.presenca60.security.TokenService;
import br.com.fiap.presenca60.service.SummaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:summary-tests;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.h2.console.enabled=false"
})
@AutoConfigureMockMvc
@Import(SummaryIntegrationTest.FixedTimeConfig.class)
@Transactional
class SummaryIntegrationTest {

    @Autowired private SummaryService summaryService;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TokenService tokenService;
    @Autowired private MockMvc mvc;

    private User user;

    @BeforeEach
    void createUser() {
        user = createUser("current@example.test", 60);
    }

    @Test
    void emptyMonthHasZeroPresenceAndItsFullTarget() {
        MonthlySummary summary = summary("2026-02");

        assertThat(summary.eligibleDays()).isEqualTo(20);
        assertThat(summary.officeDays()).isZero();
        assertThat(summary.attendancePercent()).isEqualTo(0.0);
        assertThat(summary.requiredDays()).isEqualTo(12);
        assertThat(summary.remainingDays()).isEqualTo(12);
        assertThat(summary.targetReached()).isFalse();
    }

    @Test
    void sixPresencesOutOfTwentyDaysAreThirtyPercent() {
        addOfficeDays(user, "2026-02", 6);

        MonthlySummary summary = summary("2026-02");

        assertThat(summary.eligibleDays()).isEqualTo(20);
        assertThat(summary.officeDays()).isEqualTo(6);
        assertThat(summary.attendancePercent()).isEqualTo(30.0);
        assertThat(summary.targetPercent()).isEqualTo(60);
        assertThat(summary.requiredDays()).isEqualTo(12);
        assertThat(summary.remainingDays()).isEqualTo(6);
        assertThat(summary.targetReached()).isFalse();
    }

    @Test
    void roundsRequiredDaysUpAndPercentToOneDecimal() {
        addAttendance(user, "2026-11-02", AttendanceType.OFFICE);

        MonthlySummary summary = summary("2026-11");

        assertThat(summary.eligibleDays()).isEqualTo(21);
        assertThat(summary.requiredDays()).isEqualTo(13);
        assertThat(summary.attendancePercent()).isEqualTo(4.8);
        assertThat(summary.remainingDays()).isEqualTo(12);
    }

    @Test
    void countsTodayButExcludesFutureAndWeekendPresences() {
        addAttendance(user, "2026-11-20", AttendanceType.OFFICE);
        addAttendance(user, "2026-11-23", AttendanceType.OFFICE);
        addAttendance(user, "2026-11-14", AttendanceType.OFFICE);
        addAttendance(user, "2026-11-15", AttendanceType.OFFICE);

        MonthlySummary summary = summary("2026-11");

        assertThat(summary.officeDays()).isEqualTo(1);
        // At this instant UTC is already November 21; São Paulo is still November 20.
        assertThat(summary.referenceDate()).isEqualTo(LocalDate.of(2026, 11, 20));
    }

    @Test
    void futureMonthHasNoCompletedPresences() {
        addAttendance(user, "2026-12-01", AttendanceType.OFFICE);

        MonthlySummary summary = summary("2026-12");

        assertThat(summary.officeDays()).isZero();
        assertThat(summary.attendancePercent()).isEqualTo(0.0);
        assertThat(summary.targetReached()).isFalse();
    }

    @Test
    void discountsWeekdayAbsencesIncludingPlannedOnesButNotWeekends() {
        addAttendance(user, "2026-11-16", AttendanceType.ABSENCE);
        addAttendance(user, "2026-11-23", AttendanceType.ABSENCE);
        addAttendance(user, "2026-11-14", AttendanceType.ABSENCE);
        addAttendance(user, "2026-11-15", AttendanceType.ABSENCE);

        MonthlySummary summary = summary("2026-11");

        assertThat(summary.eligibleDays()).isEqualTo(19);
        assertThat(summary.requiredDays()).isEqualTo(12);
    }

    @Test
    void remoteWorkDoesNotCountAsPresenceOrReduceEligibleDays() {
        addAttendance(user, "2026-11-16", AttendanceType.REMOTE);

        MonthlySummary summary = summary("2026-11");

        assertThat(summary.eligibleDays()).isEqualTo(21);
        assertThat(summary.officeDays()).isZero();
    }

    @ParameterizedTest
    @ValueSource(ints = {12, 13, 20})
    void reachingOrExceedingTargetHasNoRemainingDays(int presences) {
        addOfficeDays(user, "2026-02", presences);

        MonthlySummary summary = summary("2026-02");

        assertThat(summary.targetReached()).isTrue();
        assertThat(summary.remainingDays()).isZero();
        assertThat(summary.attendancePercent()).isEqualTo(presences * 5.0);
    }

    @Test
    void usesTheUpdatedTarget() {
        addOfficeDays(user, "2026-02", 12);
        assertThat(summary("2026-02").targetReached()).isTrue();

        user.setTargetPercent(80);
        userRepository.save(user);
        MonthlySummary summary = summary("2026-02");

        assertThat(summary.targetPercent()).isEqualTo(80);
        assertThat(summary.requiredDays()).isEqualTo(16);
        assertThat(summary.remainingDays()).isEqualTo(4);
        assertThat(summary.attendancePercent()).isEqualTo(60.0);
        assertThat(summary.targetReached()).isFalse();
    }

    @Test
    void excludesRecordsFromOtherMonths() {
        addAttendance(user, "2026-01-30", AttendanceType.OFFICE);
        addAttendance(user, "2026-03-02", AttendanceType.ABSENCE);

        MonthlySummary summary = summary("2026-02");

        assertThat(summary.eligibleDays()).isEqualTo(20);
        assertThat(summary.officeDays()).isZero();
    }

    @Test
    void monthWithOnlyAbsencesHasNoPercentageOrReachedTarget() throws Exception {
        YearMonth month = YearMonth.of(2026, 11);
        month.atDay(1).datesUntil(month.atEndOfMonth().plusDays(1))
                .filter(SummaryIntegrationTest::isWeekDay)
                .forEach(date -> addAttendance(user, date.toString(), AttendanceType.ABSENCE));

        MonthlySummary summary = summary("2026-11");

        assertThat(summary.eligibleDays()).isZero();
        assertThat(summary.requiredDays()).isZero();
        assertThat(summary.remainingDays()).isZero();
        assertThat(summary.attendancePercent()).isNull();
        assertThat(summary.targetReached()).isFalse();
        mvc.perform(get("/summary").param("month", "2026-11").header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attendancePercent").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.targetReached").value(false));
    }

    @Test
    void respondsWithTheAuthenticatedUsersSummaryOnly() throws Exception {
        User other = createUser("other@example.test", 80);
        addOfficeDays(user, "2026-02", 6);
        addOfficeDays(other, "2026-02", 10);
        addAttendance(other, "2026-02-27", AttendanceType.ABSENCE);

        mvc.perform(get("/summary").param("month", "2026-02").header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.month").value("2026-02"))
                .andExpect(jsonPath("$.referenceDate").value("2026-11-20"))
                .andExpect(jsonPath("$.eligibleDays").value(20))
                .andExpect(jsonPath("$.officeDays").value(6))
                .andExpect(jsonPath("$.attendancePercent").value(30.0))
                .andExpect(jsonPath("$.targetPercent").value(60))
                .andExpect(jsonPath("$.requiredDays").value(12))
                .andExpect(jsonPath("$.remainingDays").value(6))
                .andExpect(jsonPath("$.targetReached").value(false));

        mvc.perform(get("/summary").param("month", "2026-02").header("Authorization", bearer(other)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eligibleDays").value(19))
                .andExpect(jsonPath("$.officeDays").value(10))
                .andExpect(jsonPath("$.targetPercent").value(80));
    }

    @Test
    void newRequestsReflectEditsDeletesAndTargetChanges() throws Exception {
        Attendance attendance = addAttendance(user, "2026-02-02", AttendanceType.OFFICE);
        assertThat(summary("2026-02").officeDays()).isEqualTo(1);

        attendance.setType(AttendanceType.ABSENCE);
        attendanceRepository.save(attendance);
        assertThat(summary("2026-02").officeDays()).isZero();
        assertThat(summary("2026-02").eligibleDays()).isEqualTo(19);

        attendanceRepository.delete(attendance);
        user.setTargetPercent(80);
        userRepository.save(user);

        mvc.perform(get("/summary").param("month", "2026-02").header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eligibleDays").value(20))
                .andExpect(jsonPath("$.officeDays").value(0))
                .andExpect(jsonPath("$.targetPercent").value(80))
                .andExpect(jsonPath("$.requiredDays").value(16));
    }

    @Test
    void requiresAuthentication() throws Exception {
        mvc.perform(get("/summary").param("month", "2026-02"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/summary").param("month", "2026-02").header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest
    @ValueSource(strings = {"2026-13", "2026-00", "2026-1", "2026-11-01", "0000-01", "invalid", ""})
    void rejectsInvalidMonths(String month) throws Exception {
        mvc.perform(get("/summary").param("month", month).header("Authorization", bearer(user)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void requiresMonthParameter() throws Exception {
        mvc.perform(get("/summary").header("Authorization", bearer(user)))
                .andExpect(status().isBadRequest());
    }

    private MonthlySummary summary(String month) {
        return summaryService.summarize(user, YearMonth.parse(month));
    }

    private User createUser(String email, int targetPercent) {
        User created = new User();
        created.setName("Teste");
        created.setEmail(email);
        created.setPassword("unused-by-summary-tests");
        created.setTargetPercent(targetPercent);
        return userRepository.save(created);
    }

    private Attendance addAttendance(User owner, String date, AttendanceType type) {
        Attendance attendance = new Attendance();
        attendance.setUser(owner);
        attendance.setDate(LocalDate.parse(date));
        attendance.setType(type);
        return attendanceRepository.save(attendance);
    }

    private void addOfficeDays(User owner, String monthText, int count) {
        YearMonth month = YearMonth.parse(monthText);
        month.atDay(1).datesUntil(month.atEndOfMonth().plusDays(1))
                .filter(SummaryIntegrationTest::isWeekDay)
                .limit(count)
                .forEach(date -> addAttendance(owner, date.toString(), AttendanceType.OFFICE));
    }

    private String bearer(User owner) {
        return "Bearer " + tokenService.generateToken(owner.getEmail());
    }

    private static boolean isWeekDay(LocalDate date) {
        return date.getDayOfWeek() != DayOfWeek.SATURDAY && date.getDayOfWeek() != DayOfWeek.SUNDAY;
    }

    @TestConfiguration
    static class FixedTimeConfig {
        @Bean
        @Primary
        Clock testClock() {
            return Clock.fixed(Instant.parse("2026-11-21T02:30:00Z"), ZoneId.of("America/Sao_Paulo"));
        }
    }
}
