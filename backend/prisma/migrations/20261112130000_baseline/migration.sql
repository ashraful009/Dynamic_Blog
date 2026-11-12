-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `avatar` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `excerpt` TEXT NULL,
    `coverImage` VARCHAR(191) NULL,
    `metaTitle` VARCHAR(160) NULL,
    `metaDescription` VARCHAR(320) NULL,
    `ogImage` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `readTime` INTEGER NULL,
    `displayOrder` INTEGER NULL,
    `views` INTEGER NOT NULL DEFAULT 0,
    `authorId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `posts_slug_key`(`slug`),
    INDEX `posts_slug_idx`(`slug`),
    INDEX `posts_status_idx`(`status`),
    INDEX `posts_authorId_idx`(`authorId`),
    INDEX `posts_categoryId_idx`(`categoryId`),
    INDEX `posts_isFeatured_idx`(`isFeatured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media` (
    `id` VARCHAR(191) NOT NULL,
    `publicId` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `secureUrl` TEXT NOT NULL,
    `format` VARCHAR(191) NOT NULL,
    `type` ENUM('IMAGE', 'VIDEO') NOT NULL,
    `hlsUrl` TEXT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `bytes` INTEGER NULL,
    `alt` VARCHAR(255) NULL,
    `postId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `media_publicId_key`(`publicId`),
    INDEX `media_postId_idx`(`postId`),
    INDEX `media_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'ফেরদৌস আনাম জীবন',
    `siteSubtitle` VARCHAR(191) NULL DEFAULT 'লেখালেখি',
    `navLinks` JSON NOT NULL,
    `headerCtaText` VARCHAR(191) NULL DEFAULT 'Subscribe',
    `headerCtaLink` VARCHAR(191) NULL DEFAULT '#subscribe',
    `readMoreBtnText` VARCHAR(191) NULL DEFAULT 'READ MORE',
    `heroCoordText` VARCHAR(191) NULL,
    `heroTitle` TEXT NOT NULL,
    `heroSubtitle` TEXT NULL,
    `heroPrimaryBtnText` VARCHAR(191) NULL DEFAULT 'Browse the index',
    `heroPrimaryBtnLink` VARCHAR(191) NULL DEFAULT '#index',
    `heroSecondaryBtnText` VARCHAR(191) NULL DEFAULT 'Get new notes by email',
    `heroSecondaryBtnLink` VARCHAR(191) NULL DEFAULT '#subscribe',
    `heroPanelLabel` VARCHAR(191) NULL DEFAULT 'N 41.203 / E 6.004',
    `heroImage` TEXT NULL,
    `sidebarNewsletterLabel` VARCHAR(191) NULL DEFAULT 'নতুন লেখা মেইলে পেতে সাবস্ক্রাইব করুনঃ',
    `newsletterTitle` TEXT NULL,
    `newsletterSubtitle` TEXT NULL,
    `newsletterPlaceholder` VARCHAR(191) NULL DEFAULT 'Type your email...',
    `newsletterBtnText` VARCHAR(191) NULL DEFAULT 'Subscribe',
    `newsletterNote` VARCHAR(191) NULL DEFAULT 'By subscribing you agree to our Terms of Use and Privacy Policy.',
    `footerMark` VARCHAR(191) NULL,
    `footerLinks` JSON NOT NULL,
    `sidebarAboutTitle` VARCHAR(191) NULL,
    `sidebarAboutImage` TEXT NULL,
    `sidebarAboutText` TEXT NULL,
    `sidebarAboutLinkText` VARCHAR(191) NULL DEFAULT 'এই লিংক থেকে',
    `sidebarAboutLinkUrl` VARCHAR(191) NULL DEFAULT '/category/prokashito-boi',
    `sidebarAboutSignoff` VARCHAR(191) NULL DEFAULT '– ফেরদৌস আনাম জীবন',
    `sidebarGoodreadsTitle` VARCHAR(191) NULL DEFAULT 'গুডরিডসের পড়াশোনা',
    `sidebarGoodreadsBooks` JSON NOT NULL,
    `sidebarRecentTitle` VARCHAR(191) NULL DEFAULT 'সাম্প্রতিক লেখা',
    `sidebarRecentCount` INTEGER NOT NULL DEFAULT 5,
    `sidebarCategoriesTitle` VARCHAR(191) NULL DEFAULT 'বিষয় নির্বাচন',
    `sidebarTagsTitle` VARCHAR(191) NULL DEFAULT 'যা নিয়ে লিখছি, যাদের নিয়ে লিখছি',
    `sidebarCustomHtml` TEXT NULL,
    `showSidebarAbout` BOOLEAN NOT NULL DEFAULT true,
    `showSidebarNewsletter` BOOLEAN NOT NULL DEFAULT true,
    `showSidebarGoodreads` BOOLEAN NOT NULL DEFAULT true,
    `showSidebarRecent` BOOLEAN NOT NULL DEFAULT true,
    `showSidebarCategories` BOOLEAN NOT NULL DEFAULT true,
    `showSidebarTags` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscribers` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `subscribers_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `showInHeader` BOOLEAN NOT NULL DEFAULT false,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_name_key`(`name`),
    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tags_name_key`(`name`),
    UNIQUE INDEX `tags_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `authorName` VARCHAR(191) NOT NULL,
    `authorEmail` VARCHAR(191) NULL,
    `postId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `comments_postId_idx`(`postId`),
    INDEX `comments_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `about_page` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `name` VARCHAR(191) NOT NULL DEFAULT 'ফেরদৌস আনাম জীবন',
    `designation` VARCHAR(191) NOT NULL DEFAULT 'কথাসাহিত্যিক ও গবেষক',
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `biography` TEXT NOT NULL,
    `profileImage` TEXT NULL,
    `signatureImage` TEXT NULL,
    `skills` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PostTags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PostTags_AB_unique`(`A`, `B`),
    INDEX `_PostTags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PostCategories` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PostCategories_AB_unique`(`A`, `B`),
    INDEX `_PostCategories_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostTags` ADD CONSTRAINT `_PostTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostTags` ADD CONSTRAINT `_PostTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostCategories` ADD CONSTRAINT `_PostCategories_A_fkey` FOREIGN KEY (`A`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostCategories` ADD CONSTRAINT `_PostCategories_B_fkey` FOREIGN KEY (`B`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

