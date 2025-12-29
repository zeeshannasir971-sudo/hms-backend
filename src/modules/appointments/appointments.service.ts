import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from '../../common/schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = new this.appointmentModel(createAppointmentDto);
    const savedAppointment = await appointment.save();
    
    // Populate the appointment for notification
    const populatedAppointment = await this.appointmentModel
      .findById(savedAppointment._id)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('departmentId')
      .exec();
    
    // Send appointment booking confirmation notification
    if (populatedAppointment) {
      await this.sendAppointmentBookingNotification(populatedAppointment);
    }
    
    return savedAppointment;
  }

  private async sendAppointmentBookingNotification(appointment: any): Promise<void> {
    try {
      // Get the user ID from the patient
      const patientUserId = appointment.patientId?.userId?._id || appointment.patientId?.userId;
      const doctorName = appointment.doctorId?.userId?.firstName && appointment.doctorId?.userId?.lastName
        ? `${appointment.doctorId.userId.firstName} ${appointment.doctorId.userId.lastName}`
        : 'Doctor';
      const departmentName = appointment.departmentId?.name || 'Department';
      const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString();
      const timeSlot = appointment.timeSlot;
      const appointmentType = appointment.appointmentType || 'consultation';

      const title = '📅 New Appointment Booked';
      const message = `Your ${appointmentType} appointment with Dr. ${doctorName} (${departmentName}) has been scheduled for ${appointmentDate} at ${timeSlot}. Please wait for staff confirmation.`;

      if (patientUserId) {
        await this.notificationsService.createNotification({
          userId: patientUserId,
          title,
          message,
          type: 'appointment',
          priority: 'medium',
          relatedEntityId: appointment._id,
          relatedEntityType: 'appointment'
        });
      }
    } catch (error) {
      console.error('Failed to send appointment booking notification:', error);
    }
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel
      .find()
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('departmentId', 'name')
      .exec();
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentModel
      .find({ patientId })
      .populate('doctorId', 'firstName lastName specialization')
      .populate('departmentId', 'name')
      .exec();
  }

  async findByDoctor(doctorId: string): Promise<Appointment[]> {
    return this.appointmentModel
      .find({ doctorId })
      .populate('patientId', 'firstName lastName')
      .populate('departmentId', 'name')
      .exec();
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findById(id)
      .populate('patientId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName specialization')
      .populate('departmentId', 'name')
      .exec();
    
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const existingAppointment = await this.appointmentModel
      .findById(id)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('departmentId')
      .exec();
    
    if (!existingAppointment) {
      throw new NotFoundException('Appointment not found');
    }

    const appointment = await this.appointmentModel
      .findByIdAndUpdate(id, updateAppointmentDto, { new: true })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('departmentId')
      .exec();
    
    // Send notification if status changed
    if (updateAppointmentDto.status && updateAppointmentDto.status !== existingAppointment.status) {
      await this.sendStatusChangeNotification(appointment, updateAppointmentDto.status);
    }
    
    return appointment;
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Appointment not found');
    }
  }

  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel
      .findByIdAndUpdate(id, { status: 'cancelled' }, { new: true })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email'
        }
      })
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      })
      .populate('departmentId')
      .exec();
    
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    
    // Send cancellation notification
    await this.sendStatusChangeNotification(appointment, 'cancelled');
    
    return appointment;
  }

  private async sendStatusChangeNotification(appointment: any, newStatus: string): Promise<void> {
    try {
      // Get the user ID from the patient
      let patientUserId = null;
      
      if (appointment.patientId?.userId) {
        // If userId is populated as an object
        patientUserId = appointment.patientId.userId._id || appointment.patientId.userId.id;
      } else if (appointment.patientId?.userId) {
        // If userId is just an ID string
        patientUserId = appointment.patientId.userId;
      }
      
      const doctorName = appointment.doctorId?.userId?.firstName && appointment.doctorId?.userId?.lastName
        ? `${appointment.doctorId.userId.firstName} ${appointment.doctorId.userId.lastName}`
        : 'Doctor';
      const departmentName = appointment.departmentId?.name || 'Department';
      const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString();
      const timeSlot = appointment.timeSlot;

      let title = '';
      let message = '';
      let priority = 'medium';

      switch (newStatus) {
        case 'confirmed':
          title = '✅ Appointment Confirmed';
          message = `Your appointment with Dr. ${doctorName} (${departmentName}) on ${appointmentDate} at ${timeSlot} has been confirmed by our staff. Please arrive 15 minutes early.`;
          priority = 'high';
          break;
        case 'cancelled':
          title = '❌ Appointment Cancelled';
          message = `Your appointment with Dr. ${doctorName} (${departmentName}) on ${appointmentDate} at ${timeSlot} has been cancelled. Please contact us to reschedule.`;
          priority = 'high';
          break;
        case 'completed':
          title = '✅ Appointment Completed';
          message = `Your appointment with Dr. ${doctorName} on ${appointmentDate} has been completed. Thank you for visiting us.`;
          priority = 'medium';
          break;
        case 'rescheduled':
          title = '📅 Appointment Rescheduled';
          message = `Your appointment with Dr. ${doctorName} has been rescheduled. Please check your appointments for the new date and time.`;
          priority = 'high';
          break;
        default:
          title = '📋 Appointment Status Updated';
          message = `Your appointment status has been updated to: ${newStatus}`;
      }

      if (patientUserId && title && message) {
        await this.notificationsService.createNotification({
          userId: patientUserId,
          title,
          message,
          type: 'appointment',
          priority,
          relatedEntityId: appointment._id,
          relatedEntityType: 'appointment'
        });
      }
    } catch (error) {
      console.error('Failed to send appointment notification:', error);
      // Don't throw error to avoid breaking the appointment update
    }
  }

  async getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
    const appointmentDate = new Date(date);
    const existingAppointments = await this.appointmentModel
      .find({
        doctorId,
        appointmentDate,
        status: { $in: ['scheduled', 'confirmed'] }
      })
      .select('timeSlot')
      .exec();

    const bookedSlots = existingAppointments.map(apt => apt.timeSlot);
    
    // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  }
}