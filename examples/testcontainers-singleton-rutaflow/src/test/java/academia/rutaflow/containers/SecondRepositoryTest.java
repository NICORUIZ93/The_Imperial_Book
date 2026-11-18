package academia.rutaflow.containers;

import org.junit.jupiter.api.Test;

class SecondRepositoryTest extends SharedPostgres {
    @Test
    void secondClassQueriesTheSamePostgres() throws Exception {
        queryAndRecordContainerId();
    }
}
