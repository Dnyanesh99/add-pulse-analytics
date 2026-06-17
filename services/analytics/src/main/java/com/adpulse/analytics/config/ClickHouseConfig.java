package com.adpulse.analytics.config;

import com.clickhouse.jdbc.ClickHouseDataSource;
import java.sql.SQLException;
import java.util.Properties;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.simple.JdbcClient;

@Configuration
public class ClickHouseConfig {

  @Value("${clickhouse.url}")
  private String url;

  @Value("${clickhouse.user}")
  private String user;

  @Value("${clickhouse.password}")
  private String password;

  @Bean(name = "clickhouseDataSource")
  public DataSource clickhouseDataSource() throws SQLException {
    Properties properties = new Properties();
    properties.setProperty("user", user);
    properties.setProperty("password", password);
    return new ClickHouseDataSource(url, properties);
  }
  
  @Bean(name = "clickhouseJdbcClient")  
  public JdbcClient clickhouseJdbcClient(
    @Qualifier("clickhouseDataSource") DataSource clickhouseDataSource) {
   return JdbcClient.create(clickhouseDataSource);
  }
}
