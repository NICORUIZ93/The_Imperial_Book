package com.academia.vt;

public class BlockingGateway {
    public String call(String id) {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        }
        return "ok-" + id;
    }
}
