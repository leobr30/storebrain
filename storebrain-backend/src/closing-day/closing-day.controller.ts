import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ClosingDayService } from './closing-day.service';
import { ClosingDayComment } from '@prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';

import { CurrentUserType } from 'src/auth/dto/current-user.dto';
import { CurrentUser } from 'src/decorators/user.decorator';
@Controller('closing-day')
export class ClosingDayController {
    constructor(private readonly closingDayService: ClosingDayService) {}

    @Get()
    async getClosingDay() {
        return this.closingDayService.getClosingDay();
    }

    @Put(":id/comment")
    async createComment(@Param("id") id: number,@Body() comment: CreateCommentDto, @CurrentUser() user: CurrentUserType) {
        return this.closingDayService.createComment(id, comment, user.sub);
    }
}
