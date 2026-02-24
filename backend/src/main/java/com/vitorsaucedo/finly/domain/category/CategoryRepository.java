package com.vitorsaucedo.finly.domain.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findAllByUserId(UUID userId);
    List<Category> findAllByIsDefaultTrue();
    Optional<Category> findByIdAndUserId(UUID id, UUID userId);
    boolean existsByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT c FROM Category c WHERE c.user.id = :userId OR c.isDefault = true")
    List<Category> findAllByUserIdOrDefault(UUID userId);
}