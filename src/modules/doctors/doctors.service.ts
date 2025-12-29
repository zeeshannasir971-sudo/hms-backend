import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from '../../common/schemas/doctor.schema';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
  ) {}

  async findAll(): Promise<Doctor[]> {
    return this.doctorModel
      .find({ isAvailable: true })
      .populate('userId', 'firstName lastName email phone')
      .populate('departmentId', 'name description')
      .exec();
  }

  async findOne(id: string): Promise<Doctor> {
    return this.doctorModel
      .findById(id)
      .populate('userId', 'firstName lastName email phone')
      .populate('departmentId', 'name')
      .exec();
  }

  async findByDepartment(departmentId: string): Promise<Doctor[]> {
    return this.doctorModel
      .find({ departmentId, isAvailable: true })
      .populate('userId', 'firstName lastName email phone')
      .exec();
  }

  async update(id: string, updateData: any): Promise<Doctor> {
    console.log('Updating doctor:', { id, updateData });
    
    const doctor = await this.doctorModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'firstName lastName email phone')
      .populate('departmentId', 'name')
      .exec();

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    console.log('Doctor updated successfully:', doctor);
    return doctor;
  }
}
