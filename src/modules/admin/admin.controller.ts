import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Body, 
  Param, 
  Query,
  UseGuards 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // System Settings
  @Get('settings')
  getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  @Put('settings/:key')
  updateSystemSetting(@Param('key') key: string, @Body('value') value: string) {
    return this.adminService.updateSystemSetting(key, value);
  }

  @Post('settings')
  createSystemSetting(@Body() settingData: any) {
    return this.adminService.createSystemSetting(settingData);
  }

  // User Management
  @Get('users')
  getAllUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.adminService.getAllUsers(page, limit);
  }

  @Get('users/pending')
  getPendingUsers() {
    return this.adminService.getPendingUsers();
  }

  @Put('users/:id/approve')
  approveUser(@Param('id') userId: string, @Body('adminId') adminId: string) {
    return this.adminService.approveUser(userId, adminId);
  }

  @Put('users/:id/reject')
  rejectUser(
    @Param('id') userId: string, 
    @Body('adminId') adminId: string,
    @Body('reason') reason: string
  ) {
    return this.adminService.rejectUser(userId, adminId, reason);
  }

  @Put('users/:id/role')
  updateUserRole(
    @Param('id') userId: string, 
    @Body('role') role: string,
    @Body('permissions') permissions: any
  ) {
    return this.adminService.updateUserRole(userId, role, permissions);
  }

  @Put('users/:id/deactivate')
  deactivateUser(@Param('id') userId: string) {
    return this.adminService.deactivateUser(userId);
  }

  @Put('users/:id/activate')
  activateUser(@Param('id') userId: string) {
    return this.adminService.activateUser(userId);
  }

  @Post('users')
  createUser(@Body() userData: any) {
    return this.adminService.createUser(userData);
  }

  @Put('users/:id')
  updateUser(@Param('id') userId: string, @Body() updateData: any) {
    return this.adminService.updateUser(userId, updateData);
  }

  @Put('patients/:id')
  updatePatient(@Param('id') patientId: string, @Body() updateData: any) {
    return this.adminService.updatePatient(patientId, updateData);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  // Appointment Types
  @Get('appointment-types')
  getAppointmentTypes() {
    return this.adminService.getAppointmentTypes();
  }

  @Post('appointment-types')
  createAppointmentType(@Body() appointmentTypeData: any) {
    return this.adminService.createAppointmentType(appointmentTypeData);
  }

  @Put('appointment-types/:id')
  updateAppointmentType(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.updateAppointmentType(id, updateData);
  }

  @Delete('appointment-types/:id')
  deleteAppointmentType(@Param('id') id: string) {
    return this.adminService.deleteAppointmentType(id);
  }

  // Staff Management
  @Get('staff')
  getAllStaff() {
    return this.adminService.getAllStaff();
  }

  @Post('staff')
  createStaff(@Body() staffData: any) {
    return this.adminService.createStaff(staffData);
  }

  @Put('staff/:id')
  updateStaff(@Param('id') id: string, @Body() updateData: any) {
    return this.adminService.updateStaff(id, updateData);
  }

  // Audit Logs
  @Get('audit-logs')
  getAuditLogs(@Query('page') page: number = 1, @Query('limit') limit: number = 50) {
    return this.adminService.getAuditLogs(page, limit);
  }

  // System Statistics
  @Get('statistics')
  getSystemStatistics() {
    return this.adminService.getSystemStatistics();
  }

  // System Maintenance
  @Post('maintenance')
  performSystemMaintenance() {
    return this.adminService.performSystemMaintenance();
  }

  @Get('export/:dataType')
  exportSystemData(@Param('dataType') dataType: string) {
    return this.adminService.exportSystemData(dataType);
  }
}