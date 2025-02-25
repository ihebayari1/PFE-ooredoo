package com.ooredoo.report_bulider;

import com.ooredoo.report_bulider.repo.RoleRepository;
import com.ooredoo.report_bulider.user.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class BuliderReportApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(BuliderReportApiApplication.class, args);
	}

	@Bean
	public CommandLineRunner runner (RoleRepository roleRepository){
		return args -> {
			if (roleRepository.findByName(("USER")).isEmpty()) {
				roleRepository.save(
						Role.builder().name("USER").build()
				);
			} else if (roleRepository.findByName("ADMIN").isEmpty()) {
				roleRepository.save(
						Role.builder().name("ADMIN").build()
				);
			}
		};
	};
}
