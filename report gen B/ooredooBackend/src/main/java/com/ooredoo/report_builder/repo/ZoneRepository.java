package com.ooredoo.report_builder.repo;

import com.ooredoo.report_builder.entity.Zone;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, Integer> {
    Optional<Zone> findByZoneName(String name);

    boolean existsByZoneName(String name);

    List<Zone> findByRegionId(Integer regionId);
    Page<Zone> findByRegionId(Integer regionId, Pageable pageable);

    boolean existsByHeadOfZoneId(Integer headOfZoneId);
    //List<Zone> findByHeadOfZoneIsNull();
    //Optional<Zone> findByManagerId(Integer headOfZoneId);

}