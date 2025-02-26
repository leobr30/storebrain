import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/auth.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';

//20S
const EXPIRE_TIME = 20 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
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
    const user = await this.userService.findByUsernameWithRoles(dto.username);

    if (user && (await compare(dto.password, user.password!))) {
      const { password, refreshToken, ...result } = user;
      return result;
    }

    throw new UnauthorizedException();
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findByIdWithPermissions(userId);
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const refreshTokenMatches = await compare(refreshToken, user.refreshToken);

    if (!refreshTokenMatches) throw new UnauthorizedException();
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
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
          name,
          permissions,
        },
        {
          secret: process.env.jwtSecretKey,
          expiresIn: '15min',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
          name,
          permissions,
        },
        {
          secret: process.env.jwtRefreshTokenKey,
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

    await this.userService.updateRefreshToken(userId, hashedRefreshToken);
  }
}
