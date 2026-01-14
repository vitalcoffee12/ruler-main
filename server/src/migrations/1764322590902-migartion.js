/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class Migartion1764322590902 {
    name = 'Migartion1764322590902'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`email\` varchar(100) NOT NULL, \`state\` varchar(20) NOT NULL DEFAULT 'pending', \`role\` varchar(20) NOT NULL DEFAULT 'user', \`passwordHash\` varchar(255) NOT NULL, \`googleId\` varchar(100) NULL, \`githubId\` varchar(100) NULL, \`kakaoId\` varchar(100) NULL, \`naverId\` varchar(100) NULL, \`refreshTokenHash\` varchar(255) NULL, \`blockedUntil\` datetime NULL, \`lastSigninAt\` datetime NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`verifiedAt\` datetime NULL, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }
}
