package academia.rutaflow.containers;

import org.junit.jupiter.api.Test;

class FirstRepositoryTest extends SharedPostgres {
    @Test
    void firstClassQueriesTheSharedPostgres() throws Exception {
        queryAndRecordContainerId();
    }
}
