package com.vitorsaucedo.finly.domain.installment;

import com.vitorsaucedo.finly.domain.account.AccountService;
import com.vitorsaucedo.finly.domain.category.CategoryService;
import com.vitorsaucedo.finly.domain.transaction.TransactionService;
import com.vitorsaucedo.finly.domain.transaction.TransactionStatus;
import com.vitorsaucedo.finly.domain.transaction.TransactionType;
import com.vitorsaucedo.finly.domain.user.UserService;
import com.vitorsaucedo.finly.dto.request.InstallmentRequest;
import com.vitorsaucedo.finly.dto.request.TransactionRequest;
import com.vitorsaucedo.finly.dto.response.InstallmentGroupResponse;
import com.vitorsaucedo.finly.dto.response.InstallmentResponse;
import com.vitorsaucedo.finly.exception.BusinessException;
import com.vitorsaucedo.finly.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstallmentService {

    private final InstallmentGroupRepository installmentGroupRepository;
    private final InstallmentRepository installmentRepository;
    private final AccountService accountService;
    private final CategoryService categoryService;
    private final UserService userService;
    private final TransactionService transactionService;

    @Transactional(readOnly = true)
    public Page<InstallmentGroupResponse> findAll(UUID userId, Pageable pageable) {
        return installmentGroupRepository.findAllByUserId(userId, pageable)
                .map(this::toGroupResponse);
    }

    @Transactional(readOnly = true)
    public InstallmentGroupResponse findById(UUID id, UUID userId) {
        return installmentGroupRepository.findByIdAndUserId(id, userId)
                .map(this::toGroupResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Installment group not found"));
    }

    @Transactional
    public InstallmentGroupResponse create(InstallmentRequest request, UUID userId) {
        InstallmentGroup group = InstallmentGroup.builder()
                .user(userService.getAuthenticatedUser(userId))
                .account(accountService.getAccount(request.accountId(), userId))
                .category(request.categoryId() != null
                        ? categoryService.getCategory(request.categoryId(), userId) : null)
                .description(request.description())
                .totalAmount(request.totalAmount())
                .installmentCount(request.installmentCount())
                .startDate(request.startDate())
                .notes(request.notes())
                .build();

        InstallmentGroup saved = installmentGroupRepository.save(group);

        List<Installment> installments = generateInstallments(saved, request);
        installmentRepository.saveAll(installments);

        saved.setInstallments(installments);
        return toGroupResponse(saved);
    }

    @Transactional
    public InstallmentResponse payInstallment(UUID id, UUID userId) {
        Installment installment = installmentRepository.findByIdAndGroupUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Installment not found"));

        if (installment.getStatus() == InstallmentStatus.COMPLETED) {
            throw new BusinessException("Installment already paid");
        }

        if (installment.getStatus() == InstallmentStatus.CANCELLED) {
            throw new BusinessException("Installment is cancelled");
        }

        InstallmentGroup group = installment.getGroup();

        TransactionRequest transactionRequest = new TransactionRequest(
                group.getAccount().getId(),
                group.getCategory() != null ? group.getCategory().getId() : null,
                null,
                group.getDescription() + " (" + installment.getInstallmentNumber() + "/" + group.getInstallmentCount() + ")",
                installment.getAmount(),
                TransactionType.EXPENSE,
                TransactionStatus.COMPLETED,
                LocalDate.now(),
                null
        );

        var transaction = transactionService.create(transactionRequest, userId);

        installment.setStatus(InstallmentStatus.COMPLETED);
        installment.setTransaction(transactionService.getTransaction(transaction.id(), userId));

        return toInstallmentResponse(installmentRepository.save(installment));
    }

    @Transactional
    public void cancel(UUID id, UUID userId) {
        InstallmentGroup group = installmentGroupRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Installment group not found"));

        group.getInstallments().stream()
                .filter(i -> i.getStatus() == InstallmentStatus.PENDING)
                .forEach(i -> i.setStatus(InstallmentStatus.CANCELLED));

        installmentGroupRepository.save(group);
    }

    private List<Installment> generateInstallments(InstallmentGroup group, InstallmentRequest request) {
        List<Installment> installments = new ArrayList<>();

        BigDecimal baseAmount = request.totalAmount()
                .divide(BigDecimal.valueOf(request.installmentCount()), 2, RoundingMode.DOWN);

        BigDecimal remainder = request.totalAmount()
                .subtract(baseAmount.multiply(BigDecimal.valueOf(request.installmentCount())));

        for (int i = 0; i < request.installmentCount(); i++) {
            BigDecimal amount = (i == 0) ? baseAmount.add(remainder) : baseAmount;

            installments.add(Installment.builder()
                    .group(group)
                    .installmentNumber(i + 1)
                    .amount(amount)
                    .dueDate(request.startDate().plusMonths(i))
                    .status(InstallmentStatus.PENDING)
                    .build());
        }

        return installments;
    }

    private InstallmentGroupResponse toGroupResponse(InstallmentGroup group) {
        List<Installment> installments = installmentRepository.findAllByGroupId(group.getId());

        long paidCount = installments.stream()
                .filter(i -> i.getStatus() == InstallmentStatus.COMPLETED)
                .count();

        return new InstallmentGroupResponse(
                group.getId(),
                group.getAccount().getId(),
                group.getAccount().getName(),
                group.getCategory() != null ? group.getCategory().getId() : null,
                group.getCategory() != null ? group.getCategory().getName() : null,
                group.getDescription(),
                group.getTotalAmount(),
                group.getInstallmentCount(),
                (int) paidCount,
                group.getStartDate(),
                group.getNotes(),
                installments.stream().map(this::toInstallmentResponse).toList(),
                group.getCreatedAt()
        );
    }

    private InstallmentResponse toInstallmentResponse(Installment installment) {
        return new InstallmentResponse(
                installment.getId(),
                installment.getGroup().getId(),
                installment.getTransaction() != null ? installment.getTransaction().getId() : null,
                installment.getInstallmentNumber(),
                installment.getAmount(),
                installment.getDueDate(),
                installment.getStatus(),
                installment.getCreatedAt()
        );
    }
}