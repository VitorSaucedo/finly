package com.vitorsaucedo.finly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@ConfigurationPropertiesScan
public class FinlyApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinlyApplication.class, args);
	}

}
