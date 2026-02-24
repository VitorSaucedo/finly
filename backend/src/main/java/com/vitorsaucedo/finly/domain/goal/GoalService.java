package com.vitorsaucedo.finly.domain.goal;

import com.vitorsaucedo.finly.domain.user.UserService;
import com.vitorsaucedo.finly.dto.request.GoalRequest;
import com.vitorsaucedo.finly.dto.response.GoalResponse;
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
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<GoalResponse> findAll(UUID userId) {
        return goalRepository.findAllByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public GoalResponse findById(UUID id, UUID userId) {
        return goalRepository.findByIdAndUserId(id, userId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
    }

    @Transactional
    public GoalResponse create(GoalRequest request, UUID userId) {
        Goal goal = Goal.builder()
                .user(userService.getAuthenticatedUser(userId))
                .name(request.name())
                .targetAmount(request.targetAmount())
                .currentAmount(request.currentAmount() != null ? request.currentAmount() : BigDecimal.ZERO)
                .deadline(request.deadline())
                .status(GoalStatus.IN_PROGRESS)
                .notes(request.notes())
                .build();

        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponse update(UUID id, GoalRequest request, UUID userId) {
        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (goal.getStatus() == GoalStatus.COMPLETED) {
            throw new BusinessException("Completed goals cannot be edited");
        }

        goal.setName(request.name());
        goal.setTargetAmount(request.targetAmount());
        goal.setDeadline(request.deadline());
        goal.setNotes(request.notes());

        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponse addAmount(UUID id, BigDecimal amount, UUID userId) {
        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (goal.getStatus() != GoalStatus.IN_PROGRESS) {
            throw new BusinessException("Only in-progress goals can receive deposits");
        }

        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        goalRepository.delete(goal);
    }

    private GoalResponse toResponse(Goal goal) {
        BigDecimal remaining = goal.getTargetAmount().subtract(goal.getCurrentAmount());
        double percentageCompleted = goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                ? goal.getCurrentAmount()
                .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue()
                : 0.0;

        return new GoalResponse(
                goal.getId(),
                goal.getName(),
                goal.getTargetAmount(),
                goal.getCurrentAmount(),
                remaining,
                percentageCompleted,
                goal.getDeadline(),
                goal.getStatus(),
                goal.getNotes(),
                goal.getCreatedAt()
        );
    }
}