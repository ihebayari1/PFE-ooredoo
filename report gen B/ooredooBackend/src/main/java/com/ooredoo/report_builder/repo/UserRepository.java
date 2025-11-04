package com.ooredoo.report_builder.repo;

import com.ooredoo.report_builder.enums.UserType;
import com.ooredoo.report_builder.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    //List<User> findAvailableHeads(UserType userType);
    List<User> findByUserType(UserType userType);
    Page<User> findByUserType(UserType userType, Pageable pageable);

    Optional<User> findByEmail(String email);
    
    // Eagerly fetch user with role for authentication
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE u.email = :email")
    Optional<User> findByEmailWithRole(@Param("email") String email);

    List<User> findByEnabledTrue();
    Page<User> findByEnabledTrue(Pageable pageable);

    // Find users available to be heads (not already assigned as heads) - Optimized with EXISTS
    @Query("SELECT DISTINCT u FROM User u " +
            "WHERE u.userType = :userType " +
            "AND NOT EXISTS (SELECT 1 FROM Region r WHERE r.headOfRegion.id = u.id) " +
            "AND NOT EXISTS (SELECT 1 FROM Zone z WHERE z.headOfZone.id = u.id) " +
            "AND NOT EXISTS (SELECT 1 FROM Sector s WHERE s.headOfSector.id = u.id) " +
            "AND NOT EXISTS (SELECT 1 FROM POS p WHERE p.headOfPOS.id = u.id)")
    List<User> findAvailableHeads(@Param("userType") UserType userType);

    @Query("SELECT DISTINCT u FROM User u " +
            "WHERE u.userType = :userType " +
            "AND NOT EXISTS (SELECT 1 FROM Region r WHERE r.headOfRegion.id = u.id) " +
            "AND NOT EXISTS (SELECT 1 FROM Zone z WHERE z.headOfZone.id = u.id) " +
            "AND NOT EXISTS (SELECT 1 FROM Sector s WHERE s.headOfSector.id = u.id) " +
            "AND NOT EXISTS (SELECT 1 FROM POS p WHERE p.headOfPOS.id = u.id)")
    Page<User> findAvailableHeads(@Param("userType") UserType userType, Pageable pageable);

    // Find users available to be heads by role name (not already assigned as heads) - Optimized with EXISTS
    @Query("SELECT DISTINCT u FROM User u JOIN u.role r " +
            "WHERE r.name = :roleName " +
            "AND NOT EXISTS (SELECT 1 FROM Region reg WHERE reg.headOfRegion.id = u.id) " +
            "AND NOT EXISTS (SELECT 1 FROM Zone z WHERE z.headOfZone.id = u.id) " +
            "AND NOT EXISTS (SELECT 1 FROM Sector s WHERE s.headOfSector.id = u.id) " +
            "AND NOT EXISTS (SELECT 1 FROM POS p WHERE p.headOfPOS.id = u.id)")
    List<User> findAvailableHeadsByRole(@Param("roleName") String roleName);

    @Query("SELECT DISTINCT u FROM User u JOIN u.role r " +
            "WHERE r.name = :roleName " +
            "AND NOT EXISTS (SELECT 1 FROM Region reg WHERE reg.headOfRegion.id = u.id) " +
            "AND NOT EXISTS (SELECT 1 FROM Zone z WHERE z.headOfZone.id = u.id) " +
            "AND NOT EXISTS (SELECT 1 FROM Sector s WHERE s.headOfSector.id = u.id) " +
            "AND NOT EXISTS (SELECT 1 FROM POS p WHERE p.headOfPOS.id = u.id)")
    Page<User> findAvailableHeadsByRole(@Param("roleName") String roleName, Pageable pageable);

    List<User> findByEnterpriseId(Integer enterpriseId);
    Page<User> findByEnterpriseId(Integer enterpriseId, Pageable pageable);

    List<User> findByPosId(Integer posId);
    Page<User> findByPosId(Integer posId, Pageable pageable);

    // --- New for finding all under a Zone (including Regions) ---
  /*  @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN u.zone z
        LEFT JOIN z.regions r
        WHERE z.id = :zoneId OR r.id IN (
            SELECT r2.id FROM Region r2 WHERE r2.zone.id = :zoneId
        )
    """)
    List<User> findAllUsersInZoneWithRegions(@Param("zoneId") Integer zoneId);
*/
    // --- New for finding all under a Sector (including Zones & Regions) ---
    @Query("""
                SELECT DISTINCT u FROM User u
                JOIN u.pos p
                JOIN p.sector s
                JOIN s.zone z
                JOIN z.region r
                WHERE r.id = :regionId
            """)
    List<User> findAllUsersInRegionFull(@Param("regionId") Integer regionId);

    // Search users by name or email
    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.first_Name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.last_Name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(CONCAT(u.first_Name, ' ', u.last_Name)) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> searchUsers(@Param("query") String query);

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.first_Name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.last_Name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(CONCAT(u.first_Name, ' ', u.last_Name)) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);

    // Paginated version of findAllUsersInRegionFull
    @Query("""
                SELECT DISTINCT u FROM User u
                JOIN u.pos p
                JOIN p.sector s
                JOIN s.zone z
                JOIN z.region r
                WHERE r.id = :regionId
            """)
    Page<User> findAllUsersInRegionFull(@Param("regionId") Integer regionId, Pageable pageable);

    // Find users by role name - optimized query for filtering by role
    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN FETCH u.role r " +
           "WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);

    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN FETCH u.role r " +
           "WHERE r.name = :roleName")
    Page<User> findByRoleName(@Param("roleName") String roleName, Pageable pageable);

}
