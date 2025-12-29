import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DepartmentsService } from './modules/departments/departments.service';
import { AuthService } from './modules/auth/auth.service';
import { DoctorsService } from './modules/doctors/doctors.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const departmentsService = app.get(DepartmentsService);
  const authService = app.get(AuthService);
  const doctorsService = app.get(DoctorsService);

  // Create sample departments
  const departments = [
    {
      name: 'Cardiology',
      description: 'Heart and cardiovascular system care',
      isActive: true,
      location: 'Building A, Floor 2',
      contactNumber: '+1-555-0101'
    },
    {
      name: 'Neurology',
      description: 'Brain and nervous system disorders',
      isActive: true,
      location: 'Building B, Floor 3',
      contactNumber: '+1-555-0102'
    },
    {
      name: 'Orthopedics',
      description: 'Bone, joint, and muscle care',
      isActive: true,
      location: 'Building A, Floor 1',
      contactNumber: '+1-555-0103'
    },
    {
      name: 'Pediatrics',
      description: 'Children and adolescent healthcare',
      isActive: true,
      location: 'Building C, Floor 1',
      contactNumber: '+1-555-0104'
    },
    {
      name: 'General Medicine',
      description: 'Primary healthcare and general consultations',
      isActive: true,
      location: 'Building A, Floor 1',
      contactNumber: '+1-555-0105'
    },
    {
      name: 'Emergency',
      description: 'Emergency and urgent care services',
      isActive: true,
      location: 'Building A, Ground Floor',
      contactNumber: '+1-555-0911'
    }
  ];

  try {
    // Create departments
    const createdDepartments = [];
    for (const dept of departments) {
      const existing = await departmentsService.findAll();
      const existingDept = existing.find(d => d.name === dept.name);
      
      if (!existingDept) {
        const created = await departmentsService.create(dept);
        createdDepartments.push(created);
        console.log(`Created department: ${dept.name}`);
      } else {
        createdDepartments.push(existingDept);
        console.log(`Department already exists: ${dept.name}`);
      }
    }

    // Create sample doctors for each department
    const sampleDoctors = [
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'dr.sarah.wilson@hospital.com',
        password: 'password123',
        phone: '+1-555-1001',
        role: 'doctor',
        dateOfBirth: '1980-05-15',
        gender: 'female',
        address: '123 Medical Plaza, City, State',
        emergencyContact: '+1-555-1002',
        specialization: 'Cardiology',
        licenseNumber: 'MD001',
        experience: 12,
        consultationFee: 200,
        departmentName: 'Cardiology'
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'dr.michael.chen@hospital.com',
        password: 'password123',
        phone: '+1-555-1003',
        role: 'doctor',
        dateOfBirth: '1975-08-22',
        gender: 'male',
        address: '456 Medical Plaza, City, State',
        emergencyContact: '+1-555-1004',
        specialization: 'Neurology',
        licenseNumber: 'MD002',
        experience: 15,
        consultationFee: 250,
        departmentName: 'Neurology'
      },
      {
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'dr.emily.rodriguez@hospital.com',
        password: 'password123',
        phone: '+1-555-1005',
        role: 'doctor',
        dateOfBirth: '1982-03-10',
        gender: 'female',
        address: '789 Medical Plaza, City, State',
        emergencyContact: '+1-555-1006',
        specialization: 'Orthopedics',
        licenseNumber: 'MD003',
        experience: 10,
        consultationFee: 180,
        departmentName: 'Orthopedics'
      },
      {
        firstName: 'James',
        lastName: 'Thompson',
        email: 'dr.james.thompson@hospital.com',
        password: 'password123',
        phone: '+1-555-1007',
        role: 'doctor',
        dateOfBirth: '1978-11-05',
        gender: 'male',
        address: '321 Medical Plaza, City, State',
        emergencyContact: '+1-555-1008',
        specialization: 'Pediatrics',
        licenseNumber: 'MD004',
        experience: 14,
        consultationFee: 160,
        departmentName: 'Pediatrics'
      },
      {
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'dr.lisa.anderson@hospital.com',
        password: 'password123',
        phone: '+1-555-1009',
        role: 'doctor',
        dateOfBirth: '1985-07-18',
        gender: 'female',
        address: '654 Medical Plaza, City, State',
        emergencyContact: '+1-555-1010',
        specialization: 'General Medicine',
        licenseNumber: 'MD005',
        experience: 8,
        consultationFee: 120,
        departmentName: 'General Medicine'
      },
      {
        firstName: 'Robert',
        lastName: 'Kim',
        email: 'dr.robert.kim@hospital.com',
        password: 'password123',
        phone: '+1-555-1011',
        role: 'doctor',
        dateOfBirth: '1979-12-03',
        gender: 'male',
        address: '987 Medical Plaza, City, State',
        emergencyContact: '+1-555-1012',
        specialization: 'Emergency Medicine',
        licenseNumber: 'MD006',
        experience: 13,
        consultationFee: 220,
        departmentName: 'Emergency'
      }
    ];

    // Create doctors and assign to departments
    for (const doctorData of sampleDoctors) {
      try {
        // Find the department
        const department = createdDepartments.find(d => d.name === doctorData.departmentName);
        if (!department) {
          console.log(`Department not found for doctor: ${doctorData.firstName} ${doctorData.lastName}`);
          continue;
        }

        // Check if doctor already exists
        const existingDoctors = await doctorsService.findAll();
        const existingDoctor = existingDoctors.find(d => 
          d.licenseNumber === doctorData.licenseNumber
        );

        if (!existingDoctor) {
          // Create doctor user account
          const doctorUser = await authService.register({
            firstName: doctorData.firstName,
            lastName: doctorData.lastName,
            email: doctorData.email,
            password: doctorData.password,
            phone: doctorData.phone,
            role: doctorData.role,
            dateOfBirth: doctorData.dateOfBirth,
            gender: doctorData.gender,
            address: doctorData.address,
            emergencyContact: doctorData.emergencyContact,
            specialization: doctorData.specialization,
            licenseNumber: doctorData.licenseNumber,
            experience: doctorData.experience.toString(),
            consultationFee: doctorData.consultationFee.toString(),
            departmentId: department.id
          });

          console.log(`Created doctor: Dr. ${doctorData.firstName} ${doctorData.lastName} (${doctorData.departmentName})`);
        } else {
          console.log(`Doctor already exists: Dr. ${doctorData.firstName} ${doctorData.lastName}`);
        }
      } catch (error) {
        console.error(`Failed to create doctor ${doctorData.firstName} ${doctorData.lastName}:`, error.message);
      }
    }
    
    // Create three hard-coded admin accounts
    const adminAccounts = [
      {
        firstName: 'Admin',
        lastName: 'One',
        email: 'admin1@hospital.com',
        password: 'AdminPass123!',
        phone: '+1-555-0001',
        role: 'admin',
        dateOfBirth: '1980-01-01',
        gender: 'male',
        address: 'Hospital Administration Building',
        emergencyContact: '+1-555-0002'
      },
      {
        firstName: 'Admin',
        lastName: 'Two',
        email: 'admin2@hospital.com',
        password: 'AdminPass456!',
        phone: '+1-555-0003',
        role: 'admin',
        dateOfBirth: '1975-06-15',
        gender: 'female',
        address: 'Hospital Administration Building',
        emergencyContact: '+1-555-0004'
      },
      {
        firstName: 'Admin',
        lastName: 'Three',
        email: 'admin3@hospital.com',
        password: 'AdminPass789!',
        phone: '+1-555-0005',
        role: 'admin',
        dateOfBirth: '1985-12-20',
        gender: 'other',
        address: 'Hospital Administration Building',
        emergencyContact: '+1-555-0006'
      }
    ];

    for (const adminAccount of adminAccounts) {
      try {
        await authService.register(adminAccount);
        console.log(`Created admin account: ${adminAccount.firstName} ${adminAccount.lastName} (${adminAccount.email})`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`Admin account already exists: ${adminAccount.firstName} ${adminAccount.lastName}`);
        } else {
          console.error(`Failed to create admin account ${adminAccount.firstName}:`, error.message);
        }
      }
    }

    // Create a test patient user (Zeeshan Nasir) for notification testing
    const testPatients = [
      {
        firstName: 'Zeeshan',
        lastName: 'Nasir',
        email: 'zeeshan.nasir@test.com',
        password: 'password123',
        phone: '+1-555-9999',
        role: 'patient',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        address: '123 Test Street, Test City, Test State',
        emergencyContact: '+1-555-9998'
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@test.com',
        password: 'password123',
        phone: '+1-555-8888',
        role: 'patient',
        dateOfBirth: '1985-03-22',
        gender: 'female',
        address: '456 Oak Avenue, Test City, Test State',
        emergencyContact: '+1-555-8887'
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@test.com',
        password: 'password123',
        phone: '+1-555-7777',
        role: 'patient',
        dateOfBirth: '1992-07-10',
        gender: 'male',
        address: '789 Pine Road, Test City, Test State',
        emergencyContact: '+1-555-7776'
      }
    ];

    for (const testPatient of testPatients) {
      try {
        await authService.register(testPatient);
        console.log(`Created test patient: ${testPatient.firstName} ${testPatient.lastName}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`Test patient already exists: ${testPatient.firstName} ${testPatient.lastName}`);
        } else {
          console.error(`Failed to create test patient ${testPatient.firstName}:`, error.message);
        }
      }
    }
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

seed();