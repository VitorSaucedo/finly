package com.vitorsaucedo.finly.domain.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Page<Transaction> findAllByUserId(UUID userId, Pageable pageable);

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

    Page<Transaction> findAllByUserIdAndType(UUID userId, TransactionType type, Pageable pageable);

    Page<Transaction> findAllByUserIdAndTransactionDateBetween(
            UUID userId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
            WHERE t.user.id = :userId
            AND t.type = :type
            AND MONTH(t.transactionDate) = :month
            AND YEAR(t.transactionDate) = :year
            AND t.status = 'COMPLETED'
            """)
    BigDecimal sumByUserIdAndTypeAndMonthAndYear(UUID userId, TransactionType type, int month, int year);

    @Query("""
            SELECT t FROM Transaction t
            WHERE t.user.id = :userId
            ORDER BY t.transactionDate DESC, t.createdAt DESC
            LIMIT 5
            """)
    java.util.List<Transaction> findTop5ByUserIdOrderByTransactionDateDesc(UUID userId);
}