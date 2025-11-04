package com.ooredoo.report_builder.repo;

import com.ooredoo.report_builder.entity.Enterprise;
import com.ooredoo.report_builder.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnterpriseRepository extends JpaRepository<Enterprise, Integer> {
    Optional<Enterprise> findByEnterpriseName(String name);

    boolean existsByEnterpriseName(String name);

    // Fetch all users in the enterprise (directly assigned + in sectors/zones/regions)
    @Query("""
                SELECT DISTINCT u FROM User u
                LEFT JOIN u.enterprise e
                WHERE e.id = :enterpriseId
            """)
    List<User> findAllUsersInEnterpriseFull(@Param("enterpriseId") Integer enterpriseId);

    @Query("""
                SELECT DISTINCT u FROM User u
                LEFT JOIN u.enterprise e
                WHERE e.id = :enterpriseId
            """)
    Page<User> findAllUsersInEnterpriseFull(@Param("enterpriseId") Integer enterpriseId, Pageable pageable);

    // Fetch enterprise with its users
    @EntityGraph(attributePaths = {"users"})
    Optional<Enterprise> findWithUsersById(Integer id);

    // Fetch enterprise with its sectors
    /*@EntityGraph(attributePaths = {"sector"})
    Optional<Enterprise> findWithSectorsById(Integer id);*/

    // Search enterprises by name
    @Query("SELECT e FROM Enterprise e WHERE " +
            "LOWER(e.enterpriseName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Enterprise> searchEnterprises(@Param("query") String query);

    @Query("SELECT e FROM Enterprise e WHERE " +
            "LOWER(e.enterpriseName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Enterprise> searchEnterprises(@Param("query") String query, Pageable pageable);

    // Optimized query to fetch all enterprises with manager and users in one query
    @Query("SELECT DISTINCT e FROM Enterprise e " +
           "LEFT JOIN FETCH e.manager m " +
           "LEFT JOIN FETCH m.role " +
           "LEFT JOIN FETCH e.usersInEnterprise u " +
           "LEFT JOIN FETCH u.role")
    List<Enterprise> findAllWithDetails();

    // Optimized query to fetch enterprise by ID with manager and users in one query
    @Query("SELECT DISTINCT e FROM Enterprise e " +
           "LEFT JOIN FETCH e.manager m " +
           "LEFT JOIN FETCH m.role " +
           "LEFT JOIN FETCH e.usersInEnterprise u " +
           "LEFT JOIN FETCH u.role " +
           "WHERE e.id = :id")
    Optional<Enterprise> findByIdWithDetails(@Param("id") Integer id);
}