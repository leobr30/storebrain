import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserType } from 'src/auth/dto/current-user.dto'; // Change the path

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): CurrentUserType => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
