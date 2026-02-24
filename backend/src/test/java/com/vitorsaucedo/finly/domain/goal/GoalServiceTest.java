package com.vitorsaucedo.finly.domain.goal;

import com.vitorsaucedo.finly.domain.user.User;
import com.vitorsaucedo.finly.domain.user.UserService;
import com.vitorsaucedo.finly.dto.request.GoalRequest;
import com.vitorsaucedo.finly.dto.response.GoalResponse;
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
class GoalServiceTest {

    @Mock private GoalRepository goalRepository;
    @Mock private UserService userService;

    @InjectMocks
    private GoalService goalService;

    private UUID userId;
    private User user;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder()
                .id(userId)
                .name("John Doe")
                .email("john@email.com")
                .build();
    }

    @Test
    void shouldCreateGoalSuccessfully() {
        GoalRequest request = new GoalRequest(
                "Emergency Fund", new BigDecimal("10000.00"),
                new BigDecimal("1000.00"), LocalDate.now().plusYears(1), null
        );

        when(userService.getAuthenticatedUser(userId)).thenReturn(user);
        when(goalRepository.save(any())).thenAnswer(inv -> {
            Goal g = inv.getArgument(0);
            g.setId(UUID.randomUUID());
            return g;
        });

        GoalResponse response = goalService.create(request, userId);

        assertThat(response.name()).isEqualTo("Emergency Fund");
        assertThat(response.targetAmount()).isEqualByComparingTo("10000.00");
        assertThat(response.currentAmount()).isEqualByComparingTo("1000.00");
        assertThat(response.status()).isEqualTo(GoalStatus.IN_PROGRESS);
        assertThat(response.percentageCompleted()).isEqualTo(10.0);
    }

    @Test
    void shouldMarkGoalAsCompletedWhenTargetReached() {
        Goal goal = Goal.builder()
                .id(UUID.randomUUID())
                .user(user)
                .name("Emergency Fund")
                .targetAmount(new BigDecimal("1000.00"))
                .currentAmount(new BigDecimal("900.00"))
                .status(GoalStatus.IN_PROGRESS)
                .build();

        when(goalRepository.findByIdAndUserId(goal.getId(), userId)).thenReturn(Optional.of(goal));
        when(goalRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        GoalResponse response = goalService.addAmount(goal.getId(), new BigDecimal("100.00"), userId);

        assertThat(response.status()).isEqualTo(GoalStatus.COMPLETED);
        assertThat(response.currentAmount()).isEqualByComparingTo("1000.00");
    }

    @Test
    void shouldThrowWhenAddingAmountToCompletedGoal() {
        Goal goal = Goal.builder()
                .id(UUID.randomUUID())
                .user(user)
                .name("Emergency Fund")
                .targetAmount(new BigDecimal("1000.00"))
                .currentAmount(new BigDecimal("1000.00"))
                .status(GoalStatus.COMPLETED)
                .build();

        when(goalRepository.findByIdAndUserId(goal.getId(), userId)).thenReturn(Optional.of(goal));

        assertThatThrownBy(() -> goalService.addAmount(goal.getId(), new BigDecimal("100.00"), userId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Only in-progress goals can receive deposits");
    }

    @Test
    void shouldThrowWhenEditingCompletedGoal() {
        Goal goal = Goal.builder()
                .id(UUID.randomUUID())
                .user(user)
                .name("Emergency Fund")
                .targetAmount(new BigDecimal("1000.00"))
                .currentAmount(new BigDecimal("1000.00"))
                .status(GoalStatus.COMPLETED)
                .build();

        GoalRequest request = new GoalRequest("New Name", new BigDecimal("2000.00"), null, null, null);

        when(goalRepository.findByIdAndUserId(goal.getId(), userId)).thenReturn(Optional.of(goal));

        assertThatThrownBy(() -> goalService.update(goal.getId(), request, userId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Completed goals cannot be edited");
    }

    @Test
    void shouldThrowWhenGoalNotFound() {
        UUID id = UUID.randomUUID();
        when(goalRepository.findByIdAndUserId(id, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> goalService.findById(id, userId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Goal not found");
    }
}