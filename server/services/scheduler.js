const cron = require('node-cron');
const ScheduleTest = require('../models/scheduletest-model'); // Adjust the path to your model
const User = require('../models/user-model'); // Adjust the path to your user model
const sendEmail = require('../utils/sendEmail');

const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const allTests = await ScheduleTest.find({}); // Fetch all scheduled tests

    for (const test of allTests) {
      const { userId, testDate, testTime, reminderSent24Hours, reminderSent1Hour } = test;

      const testDateTime = new Date(testDate);
      const [hours, minutes] = testTime.split(':');
      testDateTime.setHours(hours);
      testDateTime.setMinutes(minutes);

      const timeDiff = testDateTime - now;

      // Skip past tests
      if (timeDiff <= 0) {
        console.log(`Test already passed for testId: ${test._id}`);
        continue;
      }

      // Get user details
      const user = await User.findById(userId);
      if (!user || !user.email) {
        console.log(`User not found or email missing for testId: ${test._id}`);
        continue;
      }

      // Send 24-hour reminder only if within the 24-hour window
      if (!reminderSent24Hours && timeDiff <= 86400000 && timeDiff > 3600000) {
        const formattedDate = testDateTime.toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const formattedTime = testDateTime.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        });

        await sendEmail(
          user.email,
          '24-Hour Test Reminder',
          `Your test is scheduled for ${formattedDate} at ${formattedTime}.`
        );

        test.reminderSent24Hours = true; // Update flag only after sending email
        await test.save();
        console.log(`24-hour reminder sent for testId: ${test._id}`);
      }

      // Send 1-hour reminder only if within the 1-hour window
      if (!reminderSent1Hour && timeDiff <= 3600000 && timeDiff > 0) {
        const formattedDate = testDateTime.toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const formattedTime = testDateTime.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        });

        await sendEmail(
          user.email,
          '1-Hour Test Reminder',
          `Your test is scheduled for ${formattedDate} at ${formattedTime}.`
        );

        test.reminderSent1Hour = true; // Update flag only after sending email
        await test.save();
        console.log(`1-hour reminder sent for testId: ${test._id}`);
      }

      // Skip tests that are not within the required timeframes
      if (timeDiff > 86400000 || timeDiff <= 0) {
        console.log(`No reminders sent for testId: ${test._id}, timeDiff: ${timeDiff}ms`);
      }
    }
  } catch (error) {
    console.error('Error in sending reminders:', error.message);
  }
};

// Schedule the cron job to run every minute
cron.schedule('* * * * *', () => {
  console.log('Running reminder job...');
  checkAndSendReminders();
});

module.exports = checkAndSendReminders;
