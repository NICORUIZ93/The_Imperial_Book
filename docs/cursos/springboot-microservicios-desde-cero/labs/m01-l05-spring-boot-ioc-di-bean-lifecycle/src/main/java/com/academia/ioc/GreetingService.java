package com.academia.ioc;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;
@Service
public class GreetingService {
    private final GreetingRepository repository;
    private final LifecycleTracker tracker;
    public GreetingService(GreetingRepository repository, LifecycleTracker tracker) {
        this.repository = repository;
        this.tracker = tracker;
        this.tracker.track("constructor");
    }
    @PostConstruct
    void init() { tracker.track("postConstruct"); }
    public String greet() { return repository.findGreeting(); }
    @PreDestroy
    void destroy() { tracker.track("preDestroy"); }
}
