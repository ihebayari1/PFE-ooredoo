package com.ooredoo.report_bulider.services.services.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.HashMap;
import java.util.Map;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.springframework.mail.javamail.MimeMessageHelper.MULTIPART_MODE_MIXED;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEnngine;

    public EmailService(JavaMailSender mailSender, SpringTemplateEngine templateEnngine) {
        this.mailSender = mailSender;
        this.templateEnngine = templateEnngine;
    }

    @Async
    public void sendEmail(
            String to,
            String username,
            EmailTemplateName emailTemplate,
            String confirmationUrl,
            String activationCode,
            String subject
    ) throws MessagingException {
        String templateName;
        if (emailTemplate != null)
            templateName = "activate_account";
        else {
            templateName = emailTemplate.getName();
        }
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(
                message,
                MULTIPART_MODE_MIXED,
                UTF_8.name()
        );
        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("confirmationUrl", confirmationUrl);
        properties.put("activationCode", activationCode);

        Context context = new Context();
        context.setVariables(properties);
        helper.setFrom("iheb.ayari@esprit.tn");
        helper.setTo(to);
        helper.setSubject(subject);

        String template = templateEnngine.process(templateName, context);

        helper.setText(template, true);

        mailSender.send(message);

    }

}
