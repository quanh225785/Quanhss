package com.devteria.identityservice.service;

import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.devteria.identityservice.dto.request.BookingEmailRequest;
import com.devteria.identityservice.entity.User;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmailVerify {

    JavaMailSender mailSender;
    SpringTemplateEngine templateEngine;

    @NonFinal
    @Value("${mailServer.email}")
    String fromEmail;

    @NonFinal
    @Value("${app.client-url:http://localhost:5173}")
    String clientUrl;

    /**
     * Gửi email xác thực đến người dùng với token
     * Phương thức này chạy bất đồng bộ để không block request
     */
    @Async("emailTaskExecutor")
    public void sendVerificationEmail(User user, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            // Tạo context cho template
            Context context = new Context();
            context.setVariable("name", user.getFirstName() + " " + user.getLastName());
            context.setVariable("username", user.getUsername());
            context.setVariable("verificationLink", clientUrl + "/verify?token=" + token);

            // Render template
            String htmlContent = templateEngine.process("verification", context);

            helper.setTo(user.getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Xác thực tài khoản của bạn");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Verification email sent successfully to: {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send verification email to: {}", user.getEmail(), e);
            // Log lỗi nhưng không throw exception vì chạy async
            // Có thể implement retry mechanism hoặc email queue nếu cần
        } catch (Exception e) {
            log.error("Unexpected error while sending verification email to: {}", user.getEmail(), e);
        }
    }

    /**
     * Gửi email chào mừng sau khi xác thực thành công
     * Phương thức này chạy bất đồng bộ để không block request
     */
    @Async("emailTaskExecutor")
    public void sendWelcomeEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("name", user.getFirstName() + " " + user.getLastName());
            context.setVariable("username", user.getUsername());

            String htmlContent = templateEngine.process("welcome", context);

            helper.setTo(user.getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Chào mừng bạn đến với hệ thống!");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {}", user.getEmail(), e);
            // Don't throw exception for welcome email - it's not critical
        }
    }

    /**
     * Gửi lại email xác thực
     */
    public void resendVerificationEmail(User user, String token) {
        sendVerificationEmail(user, token);
    }

    /**
     * Gửi email reset password
     */
    @Async("emailTaskExecutor")
    public void sendPasswordResetEmail(User user, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("name", user.getFirstName() + " " + user.getLastName());
            context.setVariable("username", user.getUsername());
            context.setVariable("resetLink", clientUrl + "/reset-password?token=" + token);

            String htmlContent = templateEngine.process("reset_password", context);

            helper.setTo(user.getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Đặt lại mật khẩu của bạn");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", user.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send password reset email to: {}", user.getEmail(), e);
        } catch (Exception e) {
            log.error("Unexpected error while sending password reset email to: {}", user.getEmail(), e);
        }
    }

    /**
     * Gửi email thông báo đặt tour thành công sau khi thanh toán
     * Sử dụng DTO thay cho entity để tránh LazyInitializationException khi chạy async
     */
    @Async("emailTaskExecutor")
    public void sendBookingSuccessEmail(BookingEmailRequest emailRequest) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("name", emailRequest.getRecipientName());
            context.setVariable("bookingCode", emailRequest.getBookingCode());
            context.setVariable("tourName", emailRequest.getTourName());
            context.setVariable("totalPrice", emailRequest.getTotalPrice());
            context.setVariable("startDate", emailRequest.getStartDate());
            context.setVariable("participants", emailRequest.getNumberOfParticipants());
            context.setVariable("qrCodeUrl", emailRequest.getQrCodeUrl());

            String htmlContent = templateEngine.process("booking_success", context);

            helper.setTo(emailRequest.getRecipientEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Xác nhận đặt tour thành công - " + emailRequest.getBookingCode());
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Booking success email sent successfully to: {}", emailRequest.getRecipientEmail());

        } catch (MessagingException e) {
            log.error("Failed to send booking success email to: {}", emailRequest.getRecipientEmail(), e);
        } catch (Exception e) {
            log.error("Unexpected error while sending booking success email to: {}", emailRequest.getRecipientEmail(), e);
        }
    }
}
