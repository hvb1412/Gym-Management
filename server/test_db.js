import sequelize from './src/configs/database.js';
import { Member, Feedback } from './src/models/index.js';

async function test() {
  try {
    await sequelize.authenticate();
    const member = await Member.findOne();
    if (!member) {
      console.log('No member');
      process.exit(0);
    }
    console.log('Found member:', member.memberId);
    
    const fb = await Feedback.create({
      memberId: member.memberId,
      feedbackType: 'Thiết bị',
      feedbackContent: 'Test direct DB'
    });
    console.log('Success:', fb.toJSON());
    process.exit(0);
  } catch (e) {
    console.error('Error creating feedback:', e);
    process.exit(1);
  }
}
test();
