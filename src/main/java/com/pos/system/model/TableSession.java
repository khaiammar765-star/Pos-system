package com.pos.system.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "table_sessions")
@Getter
@Setter
@NoArgsConstructor
public class TableSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer tableNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.OPEN;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime openedAt;

    private LocalDateTime closedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "tableSession", fetch = FetchType.LAZY)
    private List<Sale> orders = new ArrayList<>();
}
