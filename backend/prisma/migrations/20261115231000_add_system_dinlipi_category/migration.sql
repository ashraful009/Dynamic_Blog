-- Add isSystem column to categories table
ALTER TABLE `categories` ADD COLUMN `isSystem` BOOLEAN NOT NULL DEFAULT false;

-- Shift existing top-level non-system categories down by 1 so দিনলিপি sits at displayOrder 0
UPDATE `categories`
SET `displayOrder` = `displayOrder` + 1
WHERE `parentId` IS NULL
  AND `slug` <> 'dinlipi'
  AND `name` <> 'দিনলিপি';

-- Mark existing দিনলিপি category as protected system category pinned first
UPDATE `categories`
SET `isSystem` = true,
    `parentId` = NULL,
    `showInHeader` = true,
    `displayOrder` = 0,
    `slug` = 'dinlipi',
    `name` = 'দিনলিপি',
    `updatedAt` = NOW(3)
WHERE `slug` = 'dinlipi' OR `name` = 'দিনলিপি';

-- Create দিনলিপি if it does not already exist
INSERT INTO `categories` (`id`, `name`, `slug`, `showInHeader`, `displayOrder`, `isSystem`, `createdAt`, `updatedAt`)
SELECT UUID(), 'দিনলিপি', 'dinlipi', true, 0, true, NOW(3), NOW(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'dinlipi' OR `name` = 'দিনলিপি'
);
