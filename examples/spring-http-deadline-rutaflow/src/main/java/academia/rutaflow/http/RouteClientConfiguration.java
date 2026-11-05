package academia.rutaflow.http;

import java.time.Duration;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.HttpClientSettings;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

@Configuration(proxyBeanMethods = false)
public class RouteClientConfiguration {
    static final Duration CONNECT_TIMEOUT = Duration.ofMillis(300);
    static final Duration READ_TIMEOUT = Duration.ofMillis(350);

    @Bean
    @LoadBalanced
    RestClient.Builder loadBalancedRestClientBuilder() {
        return RestClient.builder();
    }

    @Bean
    RouteClient routeClient(@LoadBalanced RestClient.Builder builder) {
        var requestFactory = ClientHttpRequestFactoryBuilder.jdk().build(
            HttpClientSettings.defaults().withTimeouts(CONNECT_TIMEOUT, READ_TIMEOUT));
        RestClient client = builder.clone()
            .baseUrl("http://route-catalog")
            .requestFactory(requestFactory)
            .build();
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(client))
            .build()
            .createClient(RouteClient.class);
    }
}
