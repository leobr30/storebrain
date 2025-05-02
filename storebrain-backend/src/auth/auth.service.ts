import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { ConfigService } from '@nestjs/config';

//20S
const EXPIRE_TIME = 20 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async login(dto: LoginDto) {
    console.log('🟡 Tentative de login avec :', dto.username);
    const user = await this.validateUser(dto);
    console.log('🟢 Utilisateur validé :', user);
    const permissions = [
      ...new Set(
        ...user.roles.map((role) =>
          role.permissions.map((permission) => ({
            action: permission.permission.action,
            subject: permission.permission.subject,
          })),
        ),
      ),
    ];
    const tokens = await this.getTokens(
      user.id,
      user.username!,
      user.name!,
      permissions,
    );
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      user: { ...user },
      tokens,
      permissions,
    };

  }

  async validateUser(dto: LoginDto) {
    console.log('🔍 Vérification de l’utilisateur dans la BDD :', dto.username);
    const user = await this.userService.findByUsernameWithRoles(dto.username);

    if (!user) {
      console.warn('🔴 Utilisateur non trouvé');
    } else {
      console.log('🟢 Utilisateur trouvé, vérification du mot de passe...');
    }

    if (user && (await compare(dto.password, user.password!))) {
      const { password, refreshToken, ...result } = user;
      return result;
    }

    console.warn('🔴 Mot de passe incorrect ou utilisateur inexistant');

    throw new UnauthorizedException();
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findByIdWithPermissions(userId);
    if (!user || !user.refreshToken) {
      console.warn('🔴 Utilisateur introuvable ou pas de refreshToken');
      throw new UnauthorizedException();
    }



    const refreshTokenMatches = await compare(refreshToken, user.refreshToken);

    if (!refreshTokenMatches) {
      console.warn('🔴 Refresh token invalide');
      throw new UnauthorizedException();
    }
    const permissions = [
      ...new Set(
        ...user.roles.map((role) =>
          role.permissions.map((permission) => ({
            action: permission.permission.action,
            subject: permission.permission.subject,
          })),
        ),
      ),
    ];
    const tokens = await this.getTokens(
      user.id,
      user.username!,
      user.name!,
      permissions,
    );
    await this.updateRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  async getTokens(
    userId: number,
    username: string,
    name: string,
    permissions: { action: string; subject: string }[],
  ) {
    const jwtSecret = this.configService.get<string>('jwtSecretKey');
    const jwtRefreshSecret = this.configService.get<string>('jwtRefreshTokenKey');

    console.log(`🔐 Génération des tokens pour l'utilisateur : ${username}`);
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, username, name, permissions },
        {
          secret: jwtSecret,
          expiresIn: '15min',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, username, name, permissions },
        {
          secret: jwtRefreshSecret,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await hash(refreshToken, 10);
    console.log(`🔄 Mise à jour du refreshToken pour userId: ${userId}`);
    await this.userService.updateRefreshToken(userId, hashedRefreshToken);
  }
}
