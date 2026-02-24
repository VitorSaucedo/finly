package com.vitorsaucedo.finly.domain.account;

import com.vitorsaucedo.finly.domain.user.UserService;
import com.vitorsaucedo.finly.dto.request.AccountRequest;
import com.vitorsaucedo.finly.dto.response.AccountResponse;
import com.vitorsaucedo.finly.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<AccountResponse> findAll(UUID userId) {
        return accountRepository.findAllByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse findById(UUID id, UUID userId) {
        return accountRepository.findByIdAndUserId(id, userId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    @Transactional
    public AccountResponse create(AccountRequest request, UUID userId) {
        Account account = Account.builder()
                .user(userService.getAuthenticatedUser(userId))
                .name(request.name())
                .type(request.type())
                .balance(request.balance())
                .currency(request.currency())
                .build();

        return toResponse(accountRepository.save(account));
    }

    @Transactional
    public AccountResponse update(UUID id, AccountRequest request, UUID userId) {
        Account account = accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        account.setName(request.name());
        account.setType(request.type());
        account.setCurrency(request.currency());

        return toResponse(accountRepository.save(account));
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Account account = accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        accountRepository.delete(account);
    }

    public Account getAccount(UUID id, UUID userId) {
        return accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    private AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getType(),
                account.getBalance(),
                account.getCurrency(),
                account.getCreatedAt()
        );
    }
}