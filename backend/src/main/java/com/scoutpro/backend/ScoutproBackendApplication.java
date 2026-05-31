package com.scoutpro.backend;

import com.scoutpro.backend.config.security.SecurityProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(SecurityProperties.class)
public class ScoutproBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScoutproBackendApplication.class, args);
    }
}
