import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from '../../common/schemas/appointment.schema';
import { Patient, PatientDocument } from '../../common/schemas/patient.schema';
import { Doctor, DoctorDocument } from '../../common/schemas/doctor.schema';
import { Queue, QueueDocument } from '../../common/schemas/queue.schema';
import { Department, DepartmentDocument } from '../../common/schemas/department.schema';
import { User, UserDocument } from '../../common/schemas/user.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Queue.name) private queueModel: Model<QueueDocument>,
    @InjectModel(Department.name) private departmentModel: Model<DepartmentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getAppointmentVolumeReport(startDate: Date, endDate: Date): Promise<any> {
    const appointments = await this.appointmentModel.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          },
          totalAppointments: { $sum: "$count" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const totalAppointments = await this.appointmentModel.countDocuments({
      appointmentDate: { $gte: startDate, $lte: endDate }
    });

    const completedAppointments = await this.appointmentModel.countDocuments({
      appointmentDate: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });

    const cancelledAppointments = await this.appointmentModel.countDocuments({
      appointmentDate: { $gte: startDate, $lte: endDate },
      status: 'cancelled'
    });

    return {
      period: { startDate, endDate },
      summary: {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(2) : 0,
        cancellationRate: totalAppointments > 0 ? (cancelledAppointments / totalAppointments * 100).toFixed(2) : 0
      },
      dailyBreakdown: appointments
    };
  }

  async getPatientVisitStatistics(startDate: Date, endDate: Date): Promise<any> {
    const patientStats = await this.appointmentModel.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: "$patientId",
          visitCount: { $sum: 1 },
          lastVisit: { $max: "$appointmentDate" }
        }
      },
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          averageVisitsPerPatient: { $avg: "$visitCount" },
          patientsWithMultipleVisits: {
            $sum: { $cond: [{ $gt: ["$visitCount", 1] }, 1, 0] }
          }
        }
      }
    ]);

    const newPatients = await this.patientModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const departmentStats = await this.appointmentModel.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $group: {
          _id: '$department.name',
          visitCount: { $sum: 1 }
        }
      },
      { $sort: { visitCount: -1 } }
    ]);

    return {
      period: { startDate, endDate },
      patientStatistics: patientStats[0] || {
        totalPatients: 0,
        averageVisitsPerPatient: 0,
        patientsWithMultipleVisits: 0
      },
      newPatients,
      departmentStatistics: departmentStats
    };
  }

  async getDoctorPerformanceReport(startDate: Date, endDate: Date): Promise<any> {
    const doctorStats = await this.appointmentModel.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $unwind: '$doctor'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor.userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$doctorId',
          doctorName: { $first: { $concat: ['$user.firstName', ' ', '$user.lastName'] } },
          specialization: { $first: '$doctor.specialization' },
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          completionRate: {
            $multiply: [
              { $divide: ['$completedAppointments', '$totalAppointments'] },
              100
            ]
          }
        }
      },
      { $sort: { totalAppointments: -1 } }
    ]);

    return {
      period: { startDate, endDate },
      doctorPerformance: doctorStats
    };
  }

  async getQueueAnalytics(startDate: Date, endDate: Date): Promise<any> {
    const queueStats = await this.queueModel.aggregate([
      {
        $match: {
          checkedInAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          averageWaitTime: { $avg: '$estimatedWaitTime' },
          totalPatientsQueued: { $sum: 1 },
          averagePosition: { $avg: '$position' }
        }
      }
    ]);

    const dailyQueueStats = await this.queueModel.aggregate([
      {
        $match: {
          checkedInAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$checkedInAt" } },
          patientsQueued: { $sum: 1 },
          averageWaitTime: { $avg: '$estimatedWaitTime' }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    return {
      period: { startDate, endDate },
      summary: queueStats[0] || {
        averageWaitTime: 0,
        totalPatientsQueued: 0,
        averagePosition: 0
      },
      dailyBreakdown: dailyQueueStats
    };
  }

  async getDashboardSummary(): Promise<any> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      currentQueue,
      totalDepartments
    ] = await Promise.all([
      this.patientModel.countDocuments(),
      this.doctorModel.countDocuments({ isAvailable: true }),
      this.appointmentModel.countDocuments({
        appointmentDate: { $gte: startOfDay, $lt: endOfDay }
      }),
      this.queueModel.countDocuments({ status: { $in: ['waiting', 'in-consultation'] } }),
      this.departmentModel.countDocuments({ isActive: true })
    ]);

    const recentAppointments = await this.appointmentModel
      .find({ appointmentDate: { $gte: startOfDay, $lt: endOfDay } })
      .populate('patientId')
      .populate('doctorId')
      .sort({ appointmentDate: -1 })
      .limit(5);

    return {
      summary: {
        totalPatients,
        totalDoctors,
        todayAppointments,
        currentQueue,
        totalDepartments
      },
      recentAppointments
    };
  }

  async getDoctorDashboard(doctorId: string): Promise<any> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [
      todayAppointments,
      completedToday,
      currentQueue,
      pendingConsultations,
      recentAppointments
    ] = await Promise.all([
      this.appointmentModel.countDocuments({
        doctorId,
        appointmentDate: { $gte: startOfDay, $lt: endOfDay }
      }),
      this.appointmentModel.countDocuments({
        doctorId,
        appointmentDate: { $gte: startOfDay, $lt: endOfDay },
        status: 'completed'
      }),
      this.queueModel.countDocuments({
        doctorId,
        status: 'waiting'
      }),
      this.queueModel.countDocuments({
        doctorId,
        status: 'in-consultation'
      }),
      this.appointmentModel
        .find({
          doctorId,
          appointmentDate: { $gte: startOfDay, $lt: endOfDay }
        })
        .populate('patientId', 'firstName lastName')
        .sort({ appointmentDate: -1 })
        .limit(5)
    ]);

    const queuePatients = await this.queueModel
      .find({ doctorId, status: { $in: ['waiting', 'in-consultation'] } })
      .populate('patientId', 'firstName lastName')
      .sort({ position: 1 });

    return {
      stats: {
        todayAppointments,
        completedToday,
        currentQueue,
        pendingConsultations
      },
      appointments: recentAppointments,
      queuePatients
    };
  }

  async getRevenuReport(startDate: Date, endDate: Date): Promise<any> {
    // This would integrate with a billing system
    // For now, returning mock data structure
    return {
      period: { startDate, endDate },
      totalRevenue: 0,
      revenueByDepartment: [],
      revenueByDoctor: [],
      paymentMethods: []
    };
  }
}