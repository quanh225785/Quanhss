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
     * Configure cache manager for Vietmap tiles
     * - Cache tiles for 7 days (tiles rarely change)
     * - Maximum 1000 tiles in memory (~50MB assuming 50KB per tile)
     * - Evict based on LRU (Least Recently Used)
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("vietmapTiles");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(1000) // Maximum number of tiles to cache
                .expireAfterWrite(7, TimeUnit.DAYS) // Cache for 7 days
                .recordStats()); // Enable cache statistics for monitoring
        return cacheManager;
    }
}
