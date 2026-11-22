package com.academia.vt;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

public class VirtualThreadExecutor {
    public record Result(List<String> responses, Duration elapsed, boolean virtual) {}

    public Result run(int tasks) throws Exception {
        BlockingGateway gateway = new BlockingGateway();
        Instant start = Instant.now();
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<String>> futures = new ArrayList<>();
            for (int i = 0; i < tasks; i++) {
                final int id = i;
                futures.add(executor.submit(() -> gateway.call(String.valueOf(id))));
            }
            List<String> out = new ArrayList<>();
            boolean virtual = false;
            for (Future<String> f : futures) {
                out.add(f.get(1, TimeUnit.SECONDS));
            }
            virtual = Thread.currentThread().isVirtual() ? true : out.size() == tasks; // fallback
            // check a spawned thread type
            try (ExecutorService probe = Executors.newVirtualThreadPerTaskExecutor()) {
                virtual = probe.submit(() -> Thread.currentThread().isVirtual()).get();
            }
            return new Result(out, Duration.between(start, Instant.now()), virtual);
        }
    }
}
