package com.vitorsaucedo.finly.domain.installment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstallmentRepository extends JpaRepository<Installment, UUID> {
    List<Installment> findAllByGroupId(UUID groupId);
    Optional<Installment> findByIdAndGroupUserId(UUID id, UUID userId);
    List<Installment> findAllByGroupUserIdAndDueDateBetween(UUID userId, LocalDate start, LocalDate end);
    List<Installment> findAllByGroupUserIdAndStatus(UUID userId, InstallmentStatus status);
}