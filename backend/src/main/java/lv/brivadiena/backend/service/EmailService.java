package lv.brivadiena.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.contact-email:info@brivadiena.lv}")
    private String contactEmail;

    public void sendContactEmail(String name, String senderEmail, String phone, String message) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(contactEmail);
        msg.setFrom(contactEmail);
        msg.setReplyTo(senderEmail);
        msg.setSubject("Jauns ziņojums no " + (name != null && !name.isBlank() ? name : "Kontaktu formas"));

        String body = String.format(
                "Vārds: %s%nE-pasts: %s%nTālrunis: %s%n%nZiņojums:%n%s",
                name != null ? name : "-",
                senderEmail,
                phone != null && !phone.isBlank() ? phone : "-",
                message);
        msg.setText(body);
        mailSender.send(msg);
    }
}
