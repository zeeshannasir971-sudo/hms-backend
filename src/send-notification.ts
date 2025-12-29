import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NotificationsService } from './modules/notifications/notifications.service';
import { UsersService } from './modules/users/users.service';

async function sendNotification() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const notificationsService = app.get(NotificationsService);
  const usersService = app.get(UsersService);

  try {
    // Find user by name (Zeeshan Nasir)
    const users = await usersService.findAll();
    const user = users.find(u => 
      u.firstName.toLowerCase() === 'zeeshan' && 
      u.lastName.toLowerCase() === 'nasir'
    );

    if (!user) {
      console.log('User "Zeeshan Nasir" not found in database.');
      console.log('Available users:');
      users.forEach(u => console.log(`- ${u.firstName} ${u.lastName} (${u.email})`));
      
      // Send to first user as demo
      if (users.length > 0) {
        const demoUser = users[0];
        console.log(`\nSending demo notification to: ${demoUser.firstName} ${demoUser.lastName}`);
        
        await notificationsService.createNotification({
          userId: (demoUser as any)._id,
          title: '🎉 Welcome to Hospital Management System!',
          message: `Hello ${demoUser.firstName}! This is a test notification to demonstrate our real-time notification system. You'll receive updates about appointments, queue status, medical records, and important announcements here. Stay connected!`,
          type: 'system',
          priority: 'high'
        });
        
        console.log('✅ Demo notification sent successfully!');
      }
    } else {
      console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);
      
      await notificationsService.createNotification({
        userId: (user as any)._id,
        title: '🎉 Welcome to Hospital Management System!',
        message: `Hello ${user.firstName}! This is a test notification to demonstrate our real-time notification system. You'll receive updates about appointments, queue status, medical records, and important announcements here. Stay connected!`,
        type: 'system',
        priority: 'high'
      });
      
      console.log('✅ Notification sent successfully to Zeeshan Nasir!');
    }
  } catch (error) {
    console.error('❌ Failed to send notification:', error.message);
  } finally {
    await app.close();
  }
}

sendNotification();
