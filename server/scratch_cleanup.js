const mongoose = require('mongoose');
require('dotenv').config();
require('./src/models/House');
const Activity = require('./src/models/Activity');
const WeeklyMark = require('./src/models/WeeklyMark');

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoclub');
  console.log('Connected');

  const validActivities = await Activity.find().select('_id').lean();
  const validActivityIds = validActivities.map((a) => a._id.toString());

  const orphanMarks = await WeeklyMark.find({
    activityId: { $nin: validActivityIds.map((id) => new mongoose.Types.ObjectId(id)) }
  });

  console.log('Orphan marks count to delete:', orphanMarks.length);
  for (const m of orphanMarks) {
    console.log('Deleting orphan mark:', m._id, 'for week:', m.weekNumber, 'marks:', m.marks);
  }

  const deleteRes = await WeeklyMark.deleteMany({
    activityId: { $nin: validActivityIds.map((id) => new mongoose.Types.ObjectId(id)) }
  });
  console.log('Orphan marks deleted count:', deleteRes.deletedCount);

  const remaining = await WeeklyMark.find().populate('houseId').populate('activityId');
  console.log('--- REMAINING VALID MARKS ---');
  for (const m of remaining) {
    console.log({
      id: m._id,
      houseName: m.houseId?.name,
      week: m.weekNumber,
      activityName: m.activityId?.name,
      marks: m.marks,
      maxMarks: m.maxMarks
    });
  }

  await mongoose.disconnect();
}

cleanup().catch(console.error);
