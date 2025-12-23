package com.devteria.identityservice.configuration;

import java.util.concurrent.TimeUnit;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
@EnableCaching
public class CacheConfiguration {

    /**
     * Configure cache manager with multiple caches
     * - vietmapTiles: Cache tiles for 7 days
     * - trendingTours: Cache trending tours for 1 hour
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("vietmapTiles", "trendingTours");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(1000) // Maximum number of entries to cache
                .expireAfterWrite(1, TimeUnit.HOURS) // Default: Cache for 1 hour
                .recordStats()); // Enable cache statistics for monitoring
        return cacheManager;
    }
}
