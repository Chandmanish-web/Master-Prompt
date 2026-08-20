const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Task = require('./models/Task');
const Team = require('./models/Team');

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
    await clearCollection('teams');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@worktrack.com',
      password: 'password123',
      role: 'admin',
    });

    const manager = await User.create({
      name: 'Pranav Manager',
      email: 'pranav@worktrack.com',
      password: 'password123',
      role: 'manager',
    });

    const employeeData = [];
    for (let i = 1; i <= 100; i += 1) {
      employeeData.push({
        name: `Employee ${i}`,
        email: `employee${i}@worktrack.com`,
        password: 'password123',
        role: 'employee',
        managerId: manager._id,
      });
    }

    const employees = await User.insertMany(employeeData);

    const teams = await Team.create(
      Array.from({ length: 5 }, (_, index) => ({
        name: `WorkTrack Team ${index + 1}`,
        description: `Delivery team ${index + 1} with live task ownership and member visibility.`,
        manager: manager._id,
        members: employees.slice(index * 20, (index + 1) * 20).map((employee) => employee._id),
      }))
    );

    const priorities = ['Low', 'Medium', 'High'];
    const statuses = ['Assigned', 'In Progress', 'Submitted', 'Reviewed'];
    const taskTemplates = [
      'Complete the weekly status report and upload it to the team drive.',
      'Review the client onboarding checklist and confirm any missing items.',
      'Update the project documentation with the latest feature details.',
      'Follow up on open tickets and provide status updates by end of day.',
      'Prepare a short summary of current blockers for the next stand-up.',
    ];

    const tasks = await Task.create(
      employees.slice(0, teams.length).map((employee, index) => {
        const template = taskTemplates[index % taskTemplates.length];
        const status = statuses[index % statuses.length];
        const priority = priorities[index % priorities.length];
        const team = teams[index % teams.length];
        const deadline = new Date(Date.now() + (3 + (index % 14)) * 24 * 60 * 60 * 1000);

        const task = {
          title: `Task ${index + 1} assigned by Pranav`,
          description: template,
          assignedTo: employee._id,
          assignedBy: manager._id,
          deadline,
          priority,
          status,
          teamId: team._id,
        };

        if (status === 'Submitted') {
          task.submission = {
            text: 'Completed work uploaded for review.',
            fileUrl: `https://example.com/submission-${index + 1}.pdf`,
            submittedAt: new Date(),
          };
        }

        if (status === 'Reviewed') {
          task.review = {
            rating: (index % 5) + 1,
            feedback: 'Review completed, the work is satisfactory.',
            reviewedAt: new Date(),
          };
        }

        return task;
      })
    );

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

    console.log(`Seeded ${1 + 1 + employees.length} users, ${teams.length} teams, ${tasks.length} tasks, ${attendanceRecords.length} attendance records`);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
