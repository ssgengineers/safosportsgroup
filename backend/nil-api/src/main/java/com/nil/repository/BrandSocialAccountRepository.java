package com.nil.repository;

import com.nil.entity.BrandSocialAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for BrandSocialAccount entity operations.
 */
@Repository
public interface BrandSocialAccountRepository extends JpaRepository<BrandSocialAccount, UUID> {

    /**
     * Find all social accounts for a brand profile.
     */
    List<BrandSocialAccount> findByBrandProfileId(UUID brandProfileId);

    /**
     * Find social account by brand profile and platform.
     */
    BrandSocialAccount findByBrandProfileIdAndPlatform(UUID brandProfileId, com.nil.entity.enums.SocialPlatform platform);
}

