package com.academia;

import java.time.Duration;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.HttpClientSettings;
import org.springframework.boot.http.client.HttpRedirects;
import org.springframework.boot.http.client.InetAddressFilter;
import org.springframework.web.client.RestClient;

public final class SafeClient {
    private SafeClient() {}
    public static RestClient create(InetAddressFilter allowedAddresses) {
        var settings = HttpClientSettings.defaults()
            .withConnectTimeout(Duration.ofSeconds(2))
            .withReadTimeout(Duration.ofSeconds(2))
            .withRedirects(HttpRedirects.DONT_FOLLOW)
            .withInetAddressFilter(allowedAddresses);
        return RestClient.builder()
            .requestFactory(ClientHttpRequestFactoryBuilder.jdk().build(settings))
            .build();
    }
    public static RestClient externalOnly() {
        return create(InetAddressFilter.externalAddresses());
    }
}
