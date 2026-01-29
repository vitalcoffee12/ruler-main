/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class Migartion1769650007770 {
    name = 'Migartion1769650007770'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`term_sets\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Term Set ID', \`code\` varchar(255) NULL, \`name\` varchar(100) NOT NULL, \`description\` text NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_5b8e158e5a8a7674cacbf61140\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rule_sets\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Rule Set ID', \`code\` varchar(255) NULL, \`name\` varchar(100) NOT NULL, \`description\` text NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_f9eaf8814f302da0431fdfe9fa\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`guilds\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Guild ID', \`code\` varchar(255) NULL, \`ownerId\` int NOT NULL, \`name\` varchar(100) NOT NULL, \`description\` text NULL, \`state\` varchar(20) NOT NULL DEFAULT 'active', \`autoFlag\` tinyint NOT NULL DEFAULT 0, \`sceneId\` int NOT NULL DEFAULT '1', \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_d8e015ecff7b348e822ab44ea4\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`code\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_1f7a2b11e29b1422a2622beab3\` (\`code\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`userName\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_226bb9aa7aa8a69991209d58f5\` (\`userName\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`displayName\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`id\` \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'User ID'`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`displayName\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_226bb9aa7aa8a69991209d58f5\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`userName\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_1f7a2b11e29b1422a2622beab3\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`code\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`name\` varchar(100) NOT NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_d8e015ecff7b348e822ab44ea4\` ON \`guilds\``);
        await queryRunner.query(`DROP TABLE \`guilds\``);
        await queryRunner.query(`DROP INDEX \`IDX_f9eaf8814f302da0431fdfe9fa\` ON \`rule_sets\``);
        await queryRunner.query(`DROP TABLE \`rule_sets\``);
        await queryRunner.query(`DROP INDEX \`IDX_5b8e158e5a8a7674cacbf61140\` ON \`term_sets\``);
        await queryRunner.query(`DROP TABLE \`term_sets\``);
    }
}
