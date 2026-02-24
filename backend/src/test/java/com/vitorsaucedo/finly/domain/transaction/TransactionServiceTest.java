package com.vitorsaucedo.finly.domain.transaction;

import com.vitorsaucedo.finly.domain.account.Account;
import com.vitorsaucedo.finly.domain.account.AccountRepository;
import com.vitorsaucedo.finly.domain.account.AccountService;
import com.vitorsaucedo.finly.domain.account.AccountType;
import com.vitorsaucedo.finly.domain.budget.BudgetService;
import com.vitorsaucedo.finly.domain.category.Category;
import com.vitorsaucedo.finly.domain.category.CategoryService;
import com.vitorsaucedo.finly.domain.category.CategoryType;
import com.vitorsaucedo.finly.domain.user.User;
import com.vitorsaucedo.finly.domain.user.UserService;
import com.vitorsaucedo.finly.dto.request.TransactionRequest;
import com.vitorsaucedo.finly.dto.response.TransactionResponse;
import com.vitorsaucedo.finly.exception.BusinessException;
import com.vitorsaucedo.finly.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private AccountService accountService;
    @Mock private AccountRepository accountRepository;
    @Mock private CategoryService categoryService;
    @Mock private UserService userService;
    @Mock private BudgetService budgetService;

    @InjectMocks
    private TransactionService transactionService;

    private UUID userId;
    private User user;
    private Account account;
    private Category category;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        user = User.builder()
                .id(userId)
                .name("John Doe")
                .email("john@email.com")
                .build();

        account = Account.builder()
                .id(UUID.randomUUID())
                .user(user)
                .name("Checking")
                .type(AccountType.CHECKING)
                .balance(new BigDecimal("1000.00"))
                .currency("BRL")
                .build();

        category = Category.builder()
                .id(UUID.randomUUID())
                .user(user)
                .name("Food")
                .type(CategoryType.EXPENSE)
                .build();
    }

    @Test
    void shouldCreateIncomeTransactionAndUpdateBalance() {
        TransactionRequest request = new TransactionRequest(
                account.getId(), null, null,
                "Salary", new BigDecimal("3000.00"),
                TransactionType.INCOME, TransactionStatus.COMPLETED,
                LocalDate.now(), null
        );

        when(userService.getAuthenticatedUser(userId)).thenReturn(user);
        when(accountService.getAccount(account.getId(), userId)).thenReturn(account);
        when(transactionRepository.save(any())).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });

        TransactionResponse response = transactionService.create(request, userId);

        assertThat(response.amount()).isEqualByComparingTo("3000.00");
        assertThat(response.type()).isEqualTo(TransactionType.INCOME);
        assertThat(account.getBalance()).isEqualByComparingTo("4000.00");
        verify(accountRepository).save(account);
    }

    @Test
    void shouldCreateExpenseTransactionAndDeductBalance() {
        TransactionRequest request = new TransactionRequest(
                account.getId(), category.getId(), null,
                "Lunch", new BigDecimal("50.00"),
                TransactionType.EXPENSE, TransactionStatus.COMPLETED,
                LocalDate.now(), null
        );

        when(userService.getAuthenticatedUser(userId)).thenReturn(user);
        when(accountService.getAccount(account.getId(), userId)).thenReturn(account);
        when(categoryService.getCategory(category.getId(), userId)).thenReturn(category);
        when(transactionRepository.save(any())).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });

        TransactionResponse response = transactionService.create(request, userId);

        assertThat(response.amount()).isEqualByComparingTo("50.00");
        assertThat(account.getBalance()).isEqualByComparingTo("950.00");
        verify(budgetService).updateSpentAmount(eq(userId), eq(category.getId()), anyInt(), anyInt(), eq(new BigDecimal("50.00")));
    }

    @Test
    void shouldThrowWhenTransferHasNoDestinationAccount() {
        TransactionRequest request = new TransactionRequest(
                account.getId(), null, null,
                "Transfer", new BigDecimal("100.00"),
                TransactionType.TRANSFER, TransactionStatus.COMPLETED,
                LocalDate.now(), null
        );

        assertThatThrownBy(() -> transactionService.create(request, userId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Destination account is required for transfers");
    }

    @Test
    void shouldThrowWhenTransferSourceAndDestinationAreSame() {
        TransactionRequest request = new TransactionRequest(
                account.getId(), null, account.getId(),
                "Transfer", new BigDecimal("100.00"),
                TransactionType.TRANSFER, TransactionStatus.COMPLETED,
                LocalDate.now(), null
        );

        assertThatThrownBy(() -> transactionService.create(request, userId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Source and destination accounts must be different");
    }

    @Test
    void shouldThrowWhenTransactionNotFound() {
        UUID id = UUID.randomUUID();
        when(transactionRepository.findByIdAndUserId(id, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.findById(id, userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Transaction not found");
    }

    @Test
    void shouldNotUpdateBalanceWhenTransactionIsPending() {
        TransactionRequest request = new TransactionRequest(
                account.getId(), null, null,
                "Pending salary", new BigDecimal("3000.00"),
                TransactionType.INCOME, TransactionStatus.PENDING,
                LocalDate.now(), null
        );

        when(userService.getAuthenticatedUser(userId)).thenReturn(user);
        when(accountService.getAccount(account.getId(), userId)).thenReturn(account);
        when(transactionRepository.save(any())).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });

        transactionService.create(request, userId);

        assertThat(account.getBalance()).isEqualByComparingTo("1000.00");
        verify(accountRepository, never()).save(account);
    }
}