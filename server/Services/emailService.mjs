import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jomob21018@gmail.com',
    pass: 'epni sauj wgyh ggzu'
  }
});

export const sendOTPEmail = async (email, otp) => {
  try {
    console.log('Sending OTP to:', email);
    console.log('OTP:', otp);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    
    const mailOptions = {
      from: 'jomob21018@gmail.com',
      to: email,
      subject: '🏋️ FitZone - Verify Your Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%); padding: 40px 30px; text-align: center;">
              <div style="background: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 36px; color: white;">🔐</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Email Verification</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Your Fitness Journey Starts Here</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px;">Welcome to FitZone!</h2>
                <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
                  You're just one step away from unlocking your fitness potential. Please verify your email address to complete your registration.
                </p>
              </div>
              
              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border: 2px solid #d1d5db; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #374151; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Your Verification Code:</p>
                <div style="background: white; border: 2px solid #4f46e5; border-radius: 8px; padding: 20px; display: inline-block; margin: 10px 0;">
                  <span style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                </div>
                <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 14px;">
                  ⏰ This code expires in 10 minutes
                </p>
              </div>
              
              <!-- Features -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">🎉 What's waiting for you:</h3>
                <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                  <li>Personalized workout plans</li>
                  <li>Custom nutrition guidance</li>
                  <li>Progress tracking tools</li>
                  <li>Expert fitness tips</li>
                </ul>
              </div>
              
              <!-- Steps -->
              <div style="margin: 30px 0;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Complete Your Registration:</h3>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                  <div style="display: flex; align-items: center; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #4f46e5;">
                    <span style="background: #4f46e5; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">1</span>
                    <span style="color: #374151; font-size: 14px;">Return to the registration page</span>
                  </div>
                  <div style="display: flex; align-items: center; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #4f46e5;">
                    <span style="background: #4f46e5; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">2</span>
                    <span style="color: #374151; font-size: 14px;">Enter the 6-digit verification code above</span>
                  </div>
                  <div style="display: flex; align-items: center; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #4f46e5;">
                    <span style="background: #4f46e5; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">3</span>
                    <span style="color: #374151; font-size: 14px;">Start your fitness journey!</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                <strong>FitZone</strong><br>
                Transform Your Body, Transform Your Life
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                If you didn't create an account, please ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, otp) => {
  try {
    console.log('Sending Password Reset OTP to:', email);
    console.log('Reset OTP:', otp);
    
    const mailOptions = {
      from: 'jomob21018@gmail.com',
      to: email,
      subject: '🔐 FitZone - Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%); padding: 40px 30px; text-align: center;">
              <div style="background: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 36px; color: white;">🔒</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Password Reset</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Secure Account Recovery</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px;">Password Reset Request</h2>
                <p style="color: #6b7280; margin: 0; font-size: 16px; line-height: 1.5;">
                  A password reset has been requested for your FitZone account. Use the code below to reset your password.
                </p>
              </div>
              
              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fca5a5; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #991b1b; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Your Reset Code:</p>
                <div style="background: white; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; display: inline-block; margin: 10px 0;">
                  <span style="font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                </div>
                <p style="color: #7f1d1d; margin: 15px 0 0 0; font-size: 14px;">
                  ⏰ This code expires in 10 minutes
                </p>
              </div>
              
              <!-- Security Warning -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">🚨 Security Alert:</h3>
                <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                  <li>If you didn't request this, secure your account immediately</li>
                  <li>Never share this code with anyone</li>
                  <li>Change your password to something strong and unique</li>
                </ul>
              </div>
              
              <!-- Steps -->
              <div style="margin: 30px 0;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Reset Your Password:</h3>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                  <div style="display: flex; align-items: center; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #dc2626;">
                    <span style="background: #dc2626; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">1</span>
                    <span style="color: #374151; font-size: 14px;">Go to the password reset page</span>
                  </div>
                  <div style="display: flex; align-items: center; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #dc2626;">
                    <span style="background: #dc2626; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">2</span>
                    <span style="color: #374151; font-size: 14px;">Enter the 6-digit reset code above</span>
                  </div>
                  <div style="display: flex; align-items: center; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #dc2626;">
                    <span style="background: #dc2626; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">3</span>
                    <span style="color: #374151; font-size: 14px;">Create a new secure password</span>
                  </div>
                  <div style="display: flex; align-items: center; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #dc2626;">
                    <span style="background: #dc2626; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 15px;">4</span>
                    <span style="color: #374151; font-size: 14px;">Login with your new credentials</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
                <strong>FitZone</strong><br>
                Secure Fitness Management System
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                If you didn't request this password reset, please contact support immediately and secure your account.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Password reset email failed:', error);
    throw error;
  }
};