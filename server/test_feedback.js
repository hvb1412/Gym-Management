import jwt from 'jsonwebtoken';
import { Account, Member } from './src/models/index.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function test() {
  try {
    const member = await Member.findOne({ include: [Account] });
    if (!member) {
        console.log("No member found");
        return;
    }
    
    const token = jwt.sign(
        { accountId: member.Account.accountId, role: 'member' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
    
    const res = await fetch('http://127.0.0.1:5000/api/v1/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ feedbackType: 'Thiết bị', feedbackContent: 'Test content' })
    });
    
    const text = await res.text();
    console.log(res.status, text);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
test();
