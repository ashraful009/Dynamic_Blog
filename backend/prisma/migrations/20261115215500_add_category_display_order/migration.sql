-- AlterTable
ALTER TABLE `categories` ADD COLUMN `displayOrder` INTEGER NOT NULL DEFAULT 0;

-- Backfill existing rows with initial alphabetical order per parent group
UPDATE `categories` AS c
JOIN (
  SELECT
    `id`,
    ROW_NUMBER() OVER (PARTITION BY `parentId` ORDER BY `name` ASC) - 1 AS `rn`
  FROM `categories`
) AS ranked ON c.`id` = ranked.`id`
SET c.`displayOrder` = ranked.`rn`;
