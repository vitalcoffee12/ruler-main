/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class Migartion1770098872527 {
    name = 'Migartion1770098872527'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`guild_members\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Guild ID', \`guildId\` int NOT NULL, \`guildCode\` varchar(255) NOT NULL, \`userId\` int NOT NULL, \`userCode\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL, \`joinedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`guild_members\``);
    }
}
