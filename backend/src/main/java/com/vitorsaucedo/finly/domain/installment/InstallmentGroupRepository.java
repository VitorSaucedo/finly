package com.vitorsaucedo.finly.domain.installment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InstallmentGroupRepository extends JpaRepository<InstallmentGroup, UUID> {
    Page<InstallmentGroup> findAllByUserId(UUID userId, Pageable pageable);
    Optional<InstallmentGroup> findByIdAndUserId(UUID id, UUID userId);
}