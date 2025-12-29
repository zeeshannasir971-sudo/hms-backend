import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../../common/schemas/user.schema';
import { Patient, PatientSchema } from '../../common/schemas/patient.schema';
import { FileUploadService } from '../../common/services/file-upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  providers: [UsersService, FileUploadService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}