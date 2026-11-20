package academia.motores;

import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("mysql")
class MysqlTest extends ContratoMotorTest {
    @Override
    boolean comparaSinMayusculasNiTildes() { return true; }    // utf8mb4_0900_ai_ci
}
