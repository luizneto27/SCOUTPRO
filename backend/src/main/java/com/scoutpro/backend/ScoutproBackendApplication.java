package com.scoutpro.backend;

import com.scoutpro.backend.config.security.SecurityProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode;

@SpringBootApplication
@EnableConfigurationProperties(SecurityProperties.class)
@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO)
public class ScoutproBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScoutproBackendApplication.class, args);
    }
}
