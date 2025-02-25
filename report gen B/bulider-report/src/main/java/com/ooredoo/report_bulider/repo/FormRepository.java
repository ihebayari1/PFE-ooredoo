package com.ooredoo.report_bulider.repo;


import com.ooredoo.report_bulider.entity.Form;
import com.ooredoo.report_bulider.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormRepository extends JpaRepository<Form, Long> {

    List<Form> findByCreator(User user);
    List<Form> findByAssignedUsersContaining(User user);
}
