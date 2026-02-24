package com.vitorsaucedo.finly.domain.transaction;

import com.vitorsaucedo.finly.domain.account.Account;
import com.vitorsaucedo.finly.domain.account.AccountRepository;
import com.vitorsaucedo.finly.domain.account.AccountService;
import com.vitorsaucedo.finly.domain.budget.BudgetService;
import com.vitorsaucedo.finly.domain.category.CategoryService;
import com.vitorsaucedo.finly.domain.user.UserService;
import com.vitorsaucedo.finly.dto.request.TransactionRequest;
import com.vitorsaucedo.finly.dto.response.TransactionResponse;
import com.vitorsaucedo.finly.exception.BusinessException;
import com.vitorsaucedo.finly.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final CategoryService categoryService;
    private final AccountRepository accountRepository;
    private final UserService userService;
    private final BudgetService budgetService;

    @Transactional(readOnly = true)
    public Page<TransactionResponse> findAll(UUID userId, Pageable pageable) {
        return transactionRepository.findAllByUserId(userId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TransactionResponse findById(UUID id, UUID userId) {
        return transactionRepository.findByIdAndUserId(id, userId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }

    @Transactional
    public TransactionResponse create(TransactionRequest request, UUID userId) {
        validateTransactionRequest(request, userId);

        Account account = accountService.getAccount(request.accountId(), userId);

        Transaction transaction = Transaction.builder()
                .user(userService.getAuthenticatedUser(userId))
                .account(account)
                .category(request.categoryId() != null
                        ? categoryService.getCategory(request.categoryId(), userId) : null)
                .destinationAccount(request.destinationAccountId() != null
                        ? accountService.getAccount(request.destinationAccountId(), userId) : null)
                .description(request.description())
                .amount(request.amount())
                .type(request.type())
                .status(request.status())
                .transactionDate(request.transactionDate())
                .notes(request.notes())
                .build();

        updateAccountBalance(transaction, account);

        if (transaction.getType() == TransactionType.TRANSFER) {
            updateDestinationAccountBalance(transaction);
        }

        Transaction saved = transactionRepository.save(transaction);

        if (saved.getStatus() == TransactionStatus.COMPLETED
                && saved.getType() == TransactionType.EXPENSE
                && saved.getCategory() != null) {
            budgetService.updateSpentAmount(
                    userId,
                    saved.getCategory().getId(),
                    saved.getTransactionDate().getMonthValue(),
                    saved.getTransactionDate().getYear(),
                    saved.getAmount()
            );
        }

        return toResponse(saved);
    }

    @Transactional
    public TransactionResponse update(UUID id, TransactionRequest request, UUID userId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        reverseAccountBalance(transaction);

        transaction.setAccount(accountService.getAccount(request.accountId(), userId));
        transaction.setCategory(request.categoryId() != null
                ? categoryService.getCategory(request.categoryId(), userId) : null);
        transaction.setDestinationAccount(request.destinationAccountId() != null
                ? accountService.getAccount(request.destinationAccountId(), userId) : null);
        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setStatus(request.status());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setNotes(request.notes());

        updateAccountBalance(transaction, transaction.getAccount());

        if (transaction.getType() == TransactionType.TRANSFER) {
            updateDestinationAccountBalance(transaction);
        }

        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        reverseAccountBalance(transaction);
        transactionRepository.delete(transaction);
    }

    private void validateTransactionRequest(TransactionRequest request, UUID userId) {
        if (request.type() == TransactionType.TRANSFER && request.destinationAccountId() == null) {
            throw new BusinessException("Destination account is required for transfers");
        }

        if (request.type() == TransactionType.TRANSFER
                && request.accountId().equals(request.destinationAccountId())) {
            throw new BusinessException("Source and destination accounts must be different");
        }
    }

    private void updateAccountBalance(Transaction transaction, Account account) {
        if (transaction.getStatus() != TransactionStatus.COMPLETED) return;

        if (transaction.getType() == TransactionType.INCOME) {
            account.setBalance(account.getBalance().add(transaction.getAmount()));
        } else {
            account.setBalance(account.getBalance().subtract(transaction.getAmount()));
        }

        accountRepository.save(account);
    }

    private void updateDestinationAccountBalance(Transaction transaction) {
        if (transaction.getStatus() != TransactionStatus.COMPLETED) return;

        Account destination = transaction.getDestinationAccount();
        destination.setBalance(destination.getBalance().add(transaction.getAmount()));
        accountRepository.save(destination);
    }

    private void reverseAccountBalance(Transaction transaction) {
        if (transaction.getStatus() != TransactionStatus.COMPLETED) return;

        Account account = transaction.getAccount();

        if (transaction.getType() == TransactionType.INCOME) {
            account.setBalance(account.getBalance().subtract(transaction.getAmount()));
        } else {
            account.setBalance(account.getBalance().add(transaction.getAmount()));
        }

        accountRepository.save(account);

        if (transaction.getType() == TransactionType.TRANSFER
                && transaction.getDestinationAccount() != null) {
            Account destination = transaction.getDestinationAccount();
            destination.setBalance(destination.getBalance().subtract(transaction.getAmount()));
            accountRepository.save(destination);
        }
    }

    public Transaction getTransaction(UUID id, UUID userId) {
        return transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }

    private TransactionResponse toResponse(Transaction t) {
        return new TransactionResponse(
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
        );
    }
}