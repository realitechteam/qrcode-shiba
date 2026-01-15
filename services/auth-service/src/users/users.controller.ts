import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get("me")
    async getMe(@CurrentUser("id") userId: string) {
        const user = await this.usersService.findById(userId);
        if (user) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    @Patch("me")
    async updateMe(
        @CurrentUser("id") userId: string,
        @Body() updateUserDto: UpdateUserDto
    ) {
        const user = await this.usersService.update(userId, updateUserDto);
        const { passwordHash, ...result } = user;
        return result;
    }

    @Delete("me")
    async deleteMe(@CurrentUser("id") userId: string) {
        await this.usersService.delete(userId);
        return { message: "Account deleted successfully" };
    }
}
