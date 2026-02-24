package com.vitorsaucedo.finly.domain.budget;

import com.vitorsaucedo.finly.domain.category.Category;
import com.vitorsaucedo.finly.domain.category.CategoryService;
import com.vitorsaucedo.finly.domain.category.CategoryType;
import com.vitorsaucedo.finly.domain.user.User;
import com.vitorsaucedo.finly.domain.user.UserService;
import com.vitorsaucedo.finly.dto.request.BudgetRequest;
import com.vitorsaucedo.finly.dto.response.BudgetResponse;
import com.vitorsaucedo.finly.exception.BusinessException;
import com.vitorsaucedo.finly.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock private BudgetRepository budgetRepository;
    @Mock private UserService userService;
    @Mock private CategoryService categoryService;

    @InjectMocks
    private BudgetService budgetService;

    private UUID userId;
    private User user;
    private Category category;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        user = User.builder()
                .id(userId)
                .name("John Doe")
                .email("john@email.com")
                .build();

        category = Category.builder()
                .id(UUID.randomUUID())
                .user(user)
                .name("Food")
                .type(CategoryType.EXPENSE)
                .color("#FF0000")
                .build();
    }

    @Test
    void shouldCreateBudgetSuccessfully() {
        BudgetRequest request = new BudgetRequest(category.getId(), new BigDecimal("500.00"), 1, 2026);

        when(budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(userId, category.getId(), 1, 2026))
                .thenReturn(false);
        when(userService.getAuthenticatedUser(userId)).thenReturn(user);
        when(categoryService.getCategory(category.getId(), userId)).thenReturn(category);
        when(budgetRepository.save(any())).thenAnswer(inv -> {
            Budget b = inv.getArgument(0);
            b.setId(UUID.randomUUID());
            return b;
        });

        BudgetResponse response = budgetService.create(request, userId);

        assertThat(response.amount()).isEqualByComparingTo("500.00");
        assertThat(response.spent()).isEqualByComparingTo("0.00");
        assertThat(response.percentageUsed()).isEqualTo(0.0);
        assertThat(response.status()).isEqualTo(BudgetStatus.ACTIVE);
    }

    @Test
    void shouldThrowWhenBudgetAlreadyExists() {
        BudgetRequest request = new BudgetRequest(category.getId(), new BigDecimal("500.00"), 1, 2026);

        when(budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(userId, category.getId(), 1, 2026))
                .thenReturn(true);

        assertThatThrownBy(() -> budgetService.create(request, userId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Budget already exists for this category and period");
    }

    @Test
    void shouldUpdateSpentAmountAndSetExceededStatus() {
        Budget budget = Budget.builder()
                .id(UUID.randomUUID())
                .user(user)
                .category(category)
                .amount(new BigDecimal("500.00"))
                .spent(new BigDecimal("450.00"))
                .month(1)
                .year(2026)
                .status(BudgetStatus.ACTIVE)
                .build();

        when(budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(userId, category.getId(), 1, 2026))
                .thenReturn(Optional.of(budget));

        budgetService.updateSpentAmount(userId, category.getId(), 1, 2026, new BigDecimal("100.00"));

        assertThat(budget.getSpent()).isEqualByComparingTo("550.00");
        assertThat(budget.getStatus()).isEqualTo(BudgetStatus.EXCEEDED);
        verify(budgetRepository).save(budget);
    }

    @Test
    void shouldNotExceedStatusWhenSpentIsBelowAmount() {
        Budget budget = Budget.builder()
                .id(UUID.randomUUID())
                .user(user)
                .category(category)
                .amount(new BigDecimal("500.00"))
                .spent(new BigDecimal("100.00"))
                .month(1)
                .year(2026)
                .status(BudgetStatus.ACTIVE)
                .build();

        when(budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(userId, category.getId(), 1, 2026))
                .thenReturn(Optional.of(budget));

        budgetService.updateSpentAmount(userId, category.getId(), 1, 2026, new BigDecimal("50.00"));

        assertThat(budget.getSpent()).isEqualByComparingTo("150.00");
        assertThat(budget.getStatus()).isEqualTo(BudgetStatus.ACTIVE);
    }

    @Test
    void shouldThrowWhenBudgetNotFound() {
        UUID id = UUID.randomUUID();
        when(budgetRepository.findByIdAndUserId(id, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> budgetService.findById(id, userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Budget not found");
    }
}