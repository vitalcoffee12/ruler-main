import { UserState, type User } from "@/api/user/userModel";
import { OAUTH_PROVIDERS } from "@/common/constants";
import AppDataSource from "@/dataSource.js";
import { UserEntity } from "@/entities/userEntity";

export class UserRepository {
  private entityManager;
  constructor() {
    this.entityManager = AppDataSource.manager;
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.entityManager.find(UserEntity);
    return users;
  }

  async findById(id: number): Promise<UserEntity | null> {
    const user = await this.entityManager.findOne(UserEntity, {
      where: { id },
    });
    return user || null;
  }

  async create(userData: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const newUser: User = {
      name: userData.name,
      email: userData.email,
      state: UserState.enum.pending,
      role: "user",
      passwordHash: userData.passwordHash,
      refreshTokenHash: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.entityManager.save(UserEntity, newUser);

    return newUser;
  }

  async activate(id: number): Promise<boolean> {
    const user = await this.findById(id);
    if (user) {
      user.state = UserState.enum.active;
      user.verifiedAt = new Date();
      await this.entityManager.save(UserEntity, user);
      return true;
    }
    return false;
  }

  async disable(id: number): Promise<boolean> {
    const user = await this.findById(id);
    if (user) {
      user.state = UserState.enum.disabled;
      await this.entityManager.save(UserEntity, user);
      return true;
    }
    return false;
  }

  async block(id: number, blockedUntil: Date): Promise<boolean> {
    const user = await this.findById(id);
    if (user) {
      user.blockedUntil = blockedUntil;
      await this.entityManager.save(UserEntity, user);
      return true;
    }
    return false;
  }

  async updatePassword(id: number, newPasswordHash: string): Promise<boolean> {
    const user = await this.findById(id);
    if (user) {
      user.passwordHash = newPasswordHash;
      await this.entityManager.save(UserEntity, user);
      return true;
    }

    return false;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.entityManager.findOne(UserEntity, {
      where: { email },
    });
    return user || null;
  }

  async updateRefreshToken(
    id: number,
    refreshTokenHash: string
  ): Promise<boolean> {
    const user = await this.findById(id);
    if (user) {
      user.refreshTokenHash = refreshTokenHash;
      await this.entityManager.save(UserEntity, user);
      return true;
    }
    return false;
  }

  async signIn(id: number, refreshTokenHash: string): Promise<void> {
    const user = await this.findById(id);
    if (user) {
      user.lastSigninAt = new Date();
      await this.entityManager.save(UserEntity, user);
    }
  }

  async findByOAuthId(
    provider: OAUTH_PROVIDERS,
    oauthId: string
  ): Promise<UserEntity | null> {
    let user: UserEntity | null = null;
    if (provider === OAUTH_PROVIDERS.GOOGLE) {
      user = await this.entityManager.findOne(UserEntity, {
        where: { googleId: oauthId },
      });
    } else if (provider === OAUTH_PROVIDERS.GITHUB) {
      user = await this.entityManager.findOne(UserEntity, {
        where: { githubId: oauthId },
      });
    } else if (provider === OAUTH_PROVIDERS.KAKAO) {
      user = await this.entityManager.findOne(UserEntity, {
        where: { kakaoId: oauthId },
      });
    } else if (provider === OAUTH_PROVIDERS.NAVER) {
      user = await this.entityManager.findOne(UserEntity, {
        where: { naverId: oauthId },
      });
    }
    return user || null;
  }

  async updateOAuthId(
    id: number,
    provider: OAUTH_PROVIDERS,
    oauthId: string
  ): Promise<boolean> {
    const user = await this.findById(id);
    if (user) {
      if (provider === "google") {
        user.googleId = oauthId;
      } else if (provider === "kakao") {
        user.kakaoId = oauthId;
      } else if (provider === "naver") {
        user.naverId = oauthId;
      }
      await this.entityManager.save(UserEntity, user);
      return true;
    }
    return false;
  }
}
