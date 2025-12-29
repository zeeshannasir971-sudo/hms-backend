import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard-summary')
  getDashboardSummary() {
    return this.reportsService.getDashboardSummary();
  }

  @Get('doctor-dashboard/:doctorId')
  getDoctorDashboard(@Param('doctorId') doctorId: string) {
    return this.reportsService.getDoctorDashboard(doctorId);
  }

  @Get('appointment-volume')
  getAppointmentVolumeReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.reportsService.getAppointmentVolumeReport(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('patient-statistics')
  getPatientVisitStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.reportsService.getPatientVisitStatistics(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('doctor-performance')
  getDoctorPerformanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.reportsService.getDoctorPerformanceReport(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('queue-analytics')
  getQueueAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.reportsService.getQueueAnalytics(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('revenue')
  getRevenueReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.reportsService.getRevenuReport(
      new Date(startDate),
      new Date(endDate)
    );
  }
}