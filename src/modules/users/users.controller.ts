import { Controller, Get, Put, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { FileUploadService } from '../../common/services/file-upload.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('patients')
  async findAllPatients() {
    try {
      const patients = await this.usersService.findAllPatients();
      return { success: true, data: patients };
    } catch (error) {
      console.error('Controller error fetching patients:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Put('profile')
  updateProfile(@Request() req, @Body() updateData: any) {
    return this.usersService.updateProfile(req.user.userId, updateData);
  }

  @Post('profile/picture')
  @UseInterceptors(FileInterceptor('profilePicture', FileUploadService.getMulterConfig()))
  async uploadProfilePicture(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const profilePictureUrl = `/uploads/profile-pictures/${file.filename}`;
      const updatedUser = await this.usersService.updateProfilePicture(req.user.userId, profilePictureUrl);
      
      return {
        success: true,
        message: 'Profile picture updated successfully',
        profilePictureUrl,
        user: updatedUser
      };
    } catch (error) {
      // Clean up uploaded file if database update fails
      FileUploadService.deleteFile(file.path);
      throw new BadRequestException('Failed to update profile picture');
    }
  }
}