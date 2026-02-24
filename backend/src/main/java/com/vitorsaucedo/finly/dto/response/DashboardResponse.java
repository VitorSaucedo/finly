package com.vitorsaucedo.finly.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal totalBalance,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal netBalance,
        List<AccountResponse> accounts,
        List<BudgetResponse> budgets,
        List<GoalResponse> goals,
        List<TransactionResponse> recentTransactions
) {}