package com.devteria.identityservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.devteria.identityservice.entity.User;

import java.nio.charset.StandardCharsets;

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
     */
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
            throw new RuntimeException("Could not send verification email", e);
        }
    }

    /**
     * Gửi email chào mừng sau khi xác thực thành công
     */
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
}
