package com.academia.vt;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class VirtualThreadExecutorTest {
    @Test
    void virtualThreadsHandleBlockingTasksConcurrently() throws Exception {
        var result = new VirtualThreadExecutor().run(50);
        assertEquals(50, result.responses().size());
        assertTrue(result.responses().contains("ok-0"));
        assertTrue(result.responses().contains("ok-49"));
        assertTrue(result.virtual(), "debe ejecutar en virtual threads");
        assertTrue(result.elapsed().toMillis() < 2000, "con VT no debe ser ~5s secuenciales");
    }
}
