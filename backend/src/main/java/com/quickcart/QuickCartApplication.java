package com.quickcart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class QuickCartApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuickCartApplication.class, args);
        System.out.println("QuickCart Backend System is running...");
    }

    @Bean
    public CommandLineRunner databaseMigrator(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                System.out.println("Performing manual database migration...");
                jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50)");
                jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN order_id VARCHAR(50)");
                jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(50)");
                jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(50)");
                jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN tracking_number VARCHAR(100)");
                
                // Ensure users table has is_active column
                try {
                    jdbcTemplate.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE");
                } catch (Exception e) {
                    // Ignore if column already exists
                }
                
                System.out.println("Database migration completed successfully!");
            } catch (Exception e) {
                System.err.println("Migration notice: " + e.getMessage());
            }
        };
    }
}
