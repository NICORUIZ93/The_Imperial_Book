package com.academia.rutaflow.config;

import java.util.Map;

import org.apache.kafka.common.header.Headers;
import org.apache.kafka.common.serialization.Serializer;
import org.springframework.kafka.support.serializer.JacksonJsonSerializer;

/** Conserva los bytes de un mensaje que no pudo deserializarse al enviarlo a DLT. */
public final class EventOrBytesSerializer implements Serializer<Object> {
    private final JacksonJsonSerializer<Object> json = new JacksonJsonSerializer<>();

    @Override
    public void configure(Map<String, ?> configs, boolean isKey) {
        json.configure(configs, isKey);
    }

    @Override
    public byte[] serialize(String topic, Object data) {
        return data instanceof byte[] bytes ? bytes : json.serialize(topic, data);
    }

    @Override
    public byte[] serialize(String topic, Headers headers, Object data) {
        return data instanceof byte[] bytes ? bytes : json.serialize(topic, headers, data);
    }

    @Override
    public void close() {
        json.close();
    }
}
