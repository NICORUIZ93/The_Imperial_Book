package com.academia.cond;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Component
@ConditionalOnProperty(name = "app.notify.type", havingValue = "email")
public class EmailSender implements NotificationSender { public String type(){ return "email"; } }
