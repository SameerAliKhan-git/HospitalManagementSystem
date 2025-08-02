const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendAppointmentConfirmation(user, appointment) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Appointment Confirmation',
            html: `
                <h1>Appointment Confirmation</h1>
                <p>Dear ${user.name},</p>
                <p>Your appointment has been confirmed for:</p>
                <p>Date: ${appointment.dateTime.toLocaleDateString()}</p>
                <p>Time: ${appointment.dateTime.toLocaleTimeString()}</p>
                <p>Doctor: ${appointment.doctorName}</p>
                <p>Please arrive 15 minutes before your scheduled time.</p>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    async sendAppointmentReminder(user, appointment) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Appointment Reminder',
            html: `
                <h1>Appointment Reminder</h1>
                <p>Dear ${user.name},</p>
                <p>This is a reminder for your upcoming appointment:</p>
                <p>Date: ${appointment.dateTime.toLocaleDateString()}</p>
                <p>Time: ${appointment.dateTime.toLocaleTimeString()}</p>
                <p>Doctor: ${appointment.doctorName}</p>
                <p>Please arrive 15 minutes before your scheduled time.</p>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    async sendPasswordReset(user, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>Dear ${user.name},</p>
                <p>You have requested to reset your password. Click the link below to reset it:</p>
                <p><a href="${resetUrl}">Reset Password</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    async sendWelcome(user) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Welcome to HMS',
            html: `
                <h1>Welcome to HMS</h1>
                <p>Dear ${user.name},</p>
                <p>Thank you for registering with our Hospital Management System.</p>
                <p>We're excited to have you as a member of our healthcare community.</p>
                <p>You can now:</p>
                <ul>
                    <li>Book appointments with our doctors</li>
                    <li>View your medical history</li>
                    <li>Access your test results</li>
                    <li>And much more!</li>
                </ul>
                <p>If you have any questions, feel free to contact us.</p>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }
}

module.exports = new EmailService();
