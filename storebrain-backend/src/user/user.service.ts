import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/user.dto';
import { hash } from 'bcrypt';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });
    if (user) throw new ConflictException('username duplicated');

    const newUser = await this.prisma.user.create({
      data: {
        ...dto,
        password: await hash(dto.password, 10),
      },
    });

    const { password, ...result } = newUser;
    return result;
  }

  async findByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: {
        username: username,
        password: {
          not: null,
        },
      },
    });
  }

  async findByUsernameWithRoles(username: string) {
    return await this.prisma.user.findUnique({
      where: {
        username: username,
        password: {
          not: null,
        },
      },
      include: {
        roles: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });
  }

  async findById(id: number) {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByIdWithPermissions(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken,
      },
    });
  }
}
