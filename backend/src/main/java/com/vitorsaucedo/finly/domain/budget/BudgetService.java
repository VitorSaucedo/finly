package com.vitorsaucedo.finly.domain.budget;

import com.vitorsaucedo.finly.domain.category.CategoryService;
import com.vitorsaucedo.finly.domain.user.UserService;
import com.vitorsaucedo.finly.dto.request.BudgetRequest;
import com.vitorsaucedo.finly.dto.response.BudgetResponse;
import com.vitorsaucedo.finly.exception.BusinessException;
import com.vitorsaucedo.finly.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserService userService;
    private final CategoryService categoryService;

    @Transactional(readOnly = true)
    public List<BudgetResponse> findAllByMonthAndYear(UUID userId, int month, int year) {
        return budgetRepository.findAllByUserIdAndMonthAndYear(userId, month, year)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BudgetResponse findById(UUID id, UUID userId) {
        return budgetRepository.findByIdAndUserId(id, userId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
    }

    @Transactional
    public BudgetResponse create(BudgetRequest request, UUID userId) {
        if (budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(
                userId, request.categoryId(), request.month(), request.year())) {
            throw new BusinessException("Budget already exists for this category and period");
        }

        Budget budget = Budget.builder()
                .user(userService.getAuthenticatedUser(userId))
                .category(categoryService.getCategory(request.categoryId(), userId))
                .amount(request.amount())
                .spent(BigDecimal.ZERO)
                .month(request.month())
                .year(request.year())
                .status(BudgetStatus.ACTIVE)
                .build();

        return toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetResponse update(UUID id, BudgetRequest request, UUID userId) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        budget.setAmount(request.amount());
        return toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        budgetRepository.delete(budget);
    }

    @Transactional
    public void updateSpentAmount(UUID userId, UUID categoryId, int month, int year, BigDecimal amount) {
        budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(userId, categoryId, month, year)
                .ifPresent(budget -> {
                    budget.setSpent(budget.getSpent().add(amount));
                    budget.setStatus(budget.getSpent().compareTo(budget.getAmount()) >= 0
                            ? BudgetStatus.EXCEEDED : BudgetStatus.ACTIVE);
                    budgetRepository.save(budget);
                });
    }

    private BudgetResponse toResponse(Budget budget) {
        BigDecimal remaining = budget.getAmount().subtract(budget.getSpent());
        double percentageUsed = budget.getAmount().compareTo(BigDecimal.ZERO) > 0
                ? budget.getSpent()
                .divide(budget.getAmount(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue()
                : 0.0;

        return new BudgetResponse(
                budget.getId(),
                budget.getCategory().getId(),
                budget.getCategory().getName(),
                budget.getCategory().getColor(),
                budget.getAmount(),
                budget.getSpent(),
                remaining,
                percentageUsed,
                budget.getMonth(),
                budget.getYear(),
                budget.getStatus(),
                budget.getCreatedAt()
        );
    }
}