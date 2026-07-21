const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Task = require('./models/Task');

const clearCollection = async (collectionName) => {
  try {
    const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
    if (collections.length) {
      await mongoose.connection.db.collection(collectionName).deleteMany({});
    }
  } catch (error) {
    if (error.codeName !== 'NamespaceNotFound') {
      throw error;
    }
  }
};

const seed = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('Seed script skipped in production environment.');
    return;
  }

  await connectDB();

  try {
    await clearCollection('users');
    await clearCollection('attendances');
    await clearCollection('tasks');
    await clearCollection('leaves');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@worktrack.com',
      password: 'password123',
      role: 'admin',
    });

    const manager = await User.create({
      name: 'Manager One',
      email: 'manager@worktrack.com',
      password: 'password123',
      role: 'manager',
    });

    const employees = await Promise.all([
      User.create({
        name: 'Employee One',
        email: 'employee1@worktrack.com',
        password: 'password123',
        role: 'employee',
        managerId: manager._id,
      }),
      User.create({
        name: 'Employee Two',
        email: 'employee2@worktrack.com',
        password: 'password123',
        role: 'employee',
        managerId: manager._id,
      }),
      User.create({
        name: 'Employee Three',
        email: 'employee3@worktrack.com',
        password: 'password123',
        role: 'employee',
        managerId: manager._id,
      }),
    ]);

    const tasks = await Task.create([
      {
        title: 'Prepare launch checklist',
        description: 'Draft the rollout checklist for the upcoming release.',
        assignedTo: employees[0]._id,
        assignedBy: manager._id,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'High',
        status: 'Assigned',
      },
      {
        title: 'Review customer feedback',
        description: 'Summarize top issues and share recommended fixes.',
        assignedTo: employees[1]._id,
        assignedBy: manager._id,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        status: 'In Progress',
      },
      {
        title: 'Submit monthly report',
        description: 'Upload the report and include supporting notes.',
        assignedTo: employees[2]._id,
        assignedBy: manager._id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'Low',
        status: 'Submitted',
        submission: {
          text: 'Monthly report attached and shared with the team.',
          fileUrl: 'https://example.com/report.pdf',
          submittedAt: new Date(),
        },
      },
    ]);

    const attendanceDates = [0, -1, -2, -3];
    const attendanceRecords = [];

    for (const employee of employees) {
      attendanceDates.forEach((offset, index) => {
        const date = new Date();
        date.setDate(date.getDate() + offset);
        date.setHours(9, 0, 0, 0);

        attendanceRecords.push({
          userId: employee._id,
          date,
          checkIn: new Date(date.getTime() + 60 * 60 * 1000),
          checkOut: new Date(date.getTime() + 7 * 60 * 60 * 1000),
          status: index === 0 ? 'Present' : index === 1 ? 'Late' : index === 2 ? 'Absent' : 'Present',
        });
      });
    }

    await Attendance.create(attendanceRecords);

    console.log(`Seeded ${1 + 1 + employees.length} users, ${tasks.length} tasks, ${attendanceRecords.length} attendance records`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
