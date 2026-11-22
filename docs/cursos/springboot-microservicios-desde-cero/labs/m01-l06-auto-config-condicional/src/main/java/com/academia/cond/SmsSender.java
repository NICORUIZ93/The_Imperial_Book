package com.academia.cond;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
@Component
@ConditionalOnProperty(name = "app.notify.type", havingValue = "sms", matchIfMissing = true)
public class SmsSender implements NotificationSender { public String type(){ return "sms"; } }
