import { sendVerificationEmail } from './config/email.js';

console.log('🧪 Testing Maintenance Verification Email...\n');

const testEmail = async () => {
  try {
    console.log('📧 Sending test email to: ugwanezav@gmail.com');
    console.log('🔢 Test code: 123456\n');
    
    const result = await sendVerificationEmail('ugwanezav@gmail.com', '123456');
    
    console.log('\n✅ SUCCESS! Email sent!');
    console.log('📬 Message ID:', result.messageId);
    console.log('\n📧 Check ugwanezav@gmail.com inbox (and spam folder)');
    console.log('⏰ Email should arrive within 1-2 minutes\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FAILED to send email!');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔑 Authentication Failed!');
      console.error('Possible issues:');
      console.error('1. App password is incorrect');
      console.error('2. 2-Step Verification not enabled on Gmail');
      console.error('3. App password was revoked');
      console.error('\n📝 To fix:');
      console.error('1. Go to: https://myaccount.google.com/security');
      console.error('2. Enable 2-Step Verification');
      console.error('3. Go to: https://myaccount.google.com/apppasswords');
      console.error('4. Generate new app password');
      console.error('5. Update server/config/email.js');
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      console.error('\n🌐 Network Error!');
      console.error('1. Check internet connection');
      console.error('2. Check firewall settings');
      console.error('3. Try again');
    } else {
      console.error('\n❓ Unknown error:', error);
    }
    
    process.exit(1);
  }
};

console.log('⏳ Connecting to Gmail SMTP server...\n');
testEmail();
