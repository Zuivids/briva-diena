package lv.brivadiena.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.contact-email:info@brivadiena.lv}")
    private String contactEmail;

    @Value("${app.broadcast-from-email:brivadiena@gmail.com}")
    private String broadcastFromEmail;

    public void sendContactEmail(String name, String senderEmail, String phone, String message) {
        if (mailSender == null) {
            throw new IllegalStateException(
                    "Mail service is not configured (APP_MAIL_USERNAME/APP_MAIL_PASSWORD missing)");
        }
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(contactEmail);
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

    /**
     * Sends a broadcast message to a list of newsletter subscribers.
     * Recipients are BCC'd so they can't see each other's addresses.
     */
    public void sendBroadcastEmail(List<String> recipients, String message) {
        if (mailSender == null) {
            throw new IllegalStateException(
                    "Mail service is not configured (APP_MAIL_USERNAME/APP_MAIL_PASSWORD missing)");
        }
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(broadcastFromEmail);
        msg.setTo(broadcastFromEmail);
        msg.setBcc(recipients.toArray(new String[0]));
        msg.setSubject("Jaunumi no Brīva diena");
        msg.setText(message);
        mailSender.send(msg);
    }
}
