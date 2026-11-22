package com.academia.ioc;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.springframework.stereotype.Component;
@Component
public class LifecycleTracker {
    private final List<String> events = Collections.synchronizedList(new ArrayList<>());
    public void track(String event) { events.add(event); }
    public List<String> events() { return List.copyOf(events); }
}
