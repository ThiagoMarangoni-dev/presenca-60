package br.com.fiap.presenca60.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDate;

// Um registro de presença: em que dia e onde o usuário trabalhou
@Entity
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private AttendanceType type;

    private String note;

    @ManyToOne
    @JsonIgnore // não manda os dados do usuário junto em cada registro
    private User user;

    public Long getId() { return id; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public AttendanceType getType() { return type; }
    public void setType(AttendanceType type) { this.type = type; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
