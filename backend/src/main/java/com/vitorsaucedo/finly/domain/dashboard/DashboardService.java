package com.vitorsaucedo.finly.domain.dashboard;

import com.vitorsaucedo.finly.domain.account.AccountService;
import com.vitorsaucedo.finly.domain.budget.BudgetService;
import com.vitorsaucedo.finly.domain.goal.GoalService;
import com.vitorsaucedo.finly.domain.transaction.TransactionRepository;
import com.vitorsaucedo.finly.domain.transaction.TransactionType;
import com.vitorsaucedo.finly.dto.response.DashboardResponse;
import com.vitorsaucedo.finly.dto.response.TransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AccountService accountService;
    private final BudgetService budgetService;
    private final GoalService goalService;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(UUID userId) {
        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        BigDecimal totalBalance = accountService.findAll(userId)
                .stream()
                .map(a -> a.balance())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalIncome = transactionRepository
                .sumByUserIdAndTypeAndMonthAndYear(userId, TransactionType.INCOME, month, year);

        BigDecimal totalExpenses = transactionRepository
                .sumByUserIdAndTypeAndMonthAndYear(userId, TransactionType.EXPENSE, month, year);

        BigDecimal netBalance = totalIncome.subtract(totalExpenses);

        List<TransactionResponse> recentTransactions = transactionRepository
                .findTop5ByUserIdOrderByTransactionDateDesc(userId)
                .stream()
                .map(t -> new TransactionResponse(
                        t.getId(),
                        t.getAccount().getId(),
                        t.getAccount().getName(),
                        t.getCategory() != null ? t.getCategory().getId() : null,
                        t.getCategory() != null ? t.getCategory().getName() : null,
                        t.getDestinationAccount() != null ? t.getDestinationAccount().getId() : null,
                        t.getDestinationAccount() != null ? t.getDestinationAccount().getName() : null,
                        t.getDescription(),
                        t.getAmount(),
                        t.getType(),
                        t.getStatus(),
                        t.getTransactionDate(),
                        t.getNotes(),
                        t.getCreatedAt()
                ))
                .toList();

        return new DashboardResponse(
                totalBalance,
                totalIncome,
                totalExpenses,
                netBalance,
                accountService.findAll(userId),
                budgetService.findAllByMonthAndYear(userId, month, year),
                goalService.findAll(userId),
                recentTransactions
        );
    }
}