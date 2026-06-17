package com.scoutpro.backend.config;

import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        FluentConfiguration configuration = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .defaultSchema("public")
                .schemas("public")
                .baselineOnMigrate(true)
                .baselineVersion("0");

        return configuration.load();
    }
}
