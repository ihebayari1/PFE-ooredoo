package com.ooredoo.report_bulider;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class BuliderReportApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(BuliderReportApiApplication.class, args);
	}

}
