/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class Migartion1770635109813 {
    name = 'Migartion1770635109813'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'User ID', \`code\` varchar(255) NULL, \`iconPath\` varchar(255) NULL, \`displayName\` varchar(100) NULL, \`email\` varchar(100) NOT NULL, \`state\` varchar(20) NOT NULL DEFAULT 'pending', \`role\` varchar(20) NOT NULL DEFAULT 'user', \`passwordHash\` varchar(255) NOT NULL, \`googleId\` varchar(100) NULL, \`githubId\` varchar(100) NULL, \`kakaoId\` varchar(100) NULL, \`naverId\` varchar(100) NULL, \`refreshTokenHash\` varchar(255) NULL, \`blockedUntil\` datetime NULL, \`lastSigninAt\` datetime NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`verifiedAt\` datetime NULL, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_1f7a2b11e29b1422a2622beab3\` (\`code\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`resources\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Resource ID', \`code\` varchar(255) NULL, \`name\` varchar(100) NOT NULL, \`description\` text NULL, \`type\` enum ('ruleSet', 'termSet') NOT NULL, \`imagePath\` text NULL, \`filePath\` text NULL, \`ownerId\` int UNSIGNED NOT NULL, \`ownerCode\` varchar(50) NOT NULL, \`distributors\` text NULL, \`tags\` text NULL, \`visibility\` enum ('public', 'private', 'unlisted') NOT NULL, \`downloadCount\` int UNSIGNED NOT NULL DEFAULT '0', \`favoriteCount\` int UNSIGNED NOT NULL DEFAULT '0', \`rating\` float UNSIGNED NOT NULL DEFAULT '0', \`reviews\` int UNSIGNED NOT NULL DEFAULT '0', \`version\` int UNSIGNED NOT NULL DEFAULT '1', \`verifiedAt\` datetime NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_b7ab912cd81e4b447e43d45e38\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`guild_members\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Guild ID', \`guildId\` int NOT NULL, \`guildCode\` varchar(255) NOT NULL, \`iconPath\` varchar(255) NULL, \`displayName\` varchar(255) NULL, \`userId\` int NOT NULL, \`userCode\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL, \`joinedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`guilds\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Guild ID', \`code\` varchar(255) NULL, \`ownerId\` int NOT NULL, \`colorCode\` varchar(10) NULL, \`name\` varchar(100) NOT NULL, \`description\` text NULL, \`iconPath\` varchar(255) NULL, \`state\` varchar(20) NOT NULL DEFAULT 'active', \`autoFlag\` tinyint NOT NULL DEFAULT 0, \`sceneId\` int NOT NULL DEFAULT '1', \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_d8e015ecff7b348e822ab44ea4\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX \`IDX_d8e015ecff7b348e822ab44ea4\` ON \`guilds\``);
        await queryRunner.query(`DROP TABLE \`guilds\``);
        await queryRunner.query(`DROP TABLE \`guild_members\``);
        await queryRunner.query(`DROP INDEX \`IDX_b7ab912cd81e4b447e43d45e38\` ON \`resources\``);
        await queryRunner.query(`DROP TABLE \`resources\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_1f7a2b11e29b1422a2622beab3\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }
}
