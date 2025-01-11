const cron = require('node-cron');
const ScheduleTest = require('../models/scheduletest-model'); // Adjust the path to your model
const User = require('../models/user-model'); // Adjust the path to your user model
const sendEmail = require('../utils/sendEmail');

const sendReminderEmail = async (user, test, reminderType) => {
  const { testDate, testTime } = test;

  // Combine testDate and testTime into a full Date object
  const testDateTime = new Date(testDate);
  const [hours, minutes] = testTime.split(':');

  // Convert hours and minutes to integers before setting
  testDateTime.setHours(parseInt(hours, 10)); // Ensure hours are set correctly
  testDateTime.setMinutes(parseInt(minutes, 10)); // Ensure minutes are set correctly

  // Format the date and time correctly
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

  const reminderSubject = `${reminderType} Test Reminder ⏰`;
  const reminderMessage = `
    Dear ${user.firstName},

    The countdown is on! Your test starts in just ${reminderType === '1-Hour' ? '1 hour' : '24 hours'}. Get ready to show what you’ve learned and make the most of your preparation.

    Here are your test details:

    Scheduled Date: ${formattedDate}  
    Scheduled Time: ${formattedTime}  

    Instructions:  
    - Be ready at least 10 minutes before the test starts.
    - Check your internet connection to ensure it's stable for an uninterrupted experience.
    - Make sure you’re in a quiet, distraction-free environment.

    👉 Access Your Test  
    You’re all set to go! Take a deep breath and do your best. We’re confident you’ll do great.

    If you have any last-minute questions or need help, don’t hesitate to reach out.

    Best of luck,  
    The Edumocks Team  
    [https://edumocks.com/]`;

  await sendEmail(user.email, reminderSubject, reminderMessage);
};

const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const allTests = await ScheduleTest.find({}); // Fetch all scheduled tests

    for (const test of allTests) {
      const { userId, testDate, testTime, reminderSent24Hours, reminderSent1Hour } = test;

      // Combine testDate and testTime into a full Date object
      const testDateTime = new Date(testDate);
      const [hours, minutes] = testTime.split(':');

      // Convert hours and minutes to integers before setting
      testDateTime.setHours(parseInt(hours, 10)); // Ensure hours are set correctly
      testDateTime.setMinutes(parseInt(minutes, 10)); // Ensure minutes are set correctly

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
        await sendReminderEmail(user, test, '24-Hour');

        test.reminderSent24Hours = true; // Update flag only after sending email
        await test.save();
        console.log(`24-hour reminder sent for testId: ${test._id}`);
      }

      // Send 1-hour reminder only if within the 1-hour window
      if (!reminderSent1Hour && timeDiff <= 3600000 && timeDiff > 0) {
        await sendReminderEmail(user, test, '1-Hour');

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
