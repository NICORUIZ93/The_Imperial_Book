package academia.motores;

import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("postgres")
class PostgresTest extends ContratoMotorTest {
    @Override
    boolean comparaSinMayusculasNiTildes() { return false; }   // collation determinista
}
