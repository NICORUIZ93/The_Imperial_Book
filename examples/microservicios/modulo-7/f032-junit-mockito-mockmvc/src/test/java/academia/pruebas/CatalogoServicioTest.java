package academia.pruebas;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/** Test de UNIDAD: sin Spring. Mockito sustituye al repositorio; corre en milisegundos. */
@ExtendWith(MockitoExtension.class)
class CatalogoServicioTest {

    @Mock ProductoRepositorio repositorio;          // doble de prueba: responde lo que le digamos
    @InjectMocks CatalogoServicio servicio;          // la clase bajo prueba, con el mock inyectado

    @ParameterizedTest(name = "{0} unidades a 100 -> total {1}")
    @CsvSource({"1, 100", "9, 900", "10, 900", "20, 1800"})
    void aplicaElDescuentoDesdeDiezUnidades(int cantidad, int totalEsperado) {
        given(repositorio.buscar(1)).willReturn(Optional.of(new Producto(1, "Teclado", 100, 50)));

        assertThat(servicio.cotizar(1, cantidad).total()).isEqualTo(totalEsperado);
    }

    @Test
    @DisplayName("Un producto que no existe lanza ProductoNoEncontrado")
    void productoInexistente() {
        given(repositorio.buscar(99)).willReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.cotizar(99, 1))
                .isInstanceOf(ProductoNoEncontrado.class)
                .hasMessage("No existe el producto 99");
    }

    @Test
    void cantidadCeroNiSiquieraConsultaElRepositorio() {
        assertThatThrownBy(() -> servicio.cotizar(1, 0)).isInstanceOf(PeticionInvalida.class);
        verify(repositorio, never()).buscar(1);
    }

    @Test
    void reservarGuardaElStockDescontado() {
        given(repositorio.buscar(1)).willReturn(Optional.of(new Producto(1, "Teclado", 100, 5)));

        servicio.reservar(1, 2);

        ArgumentCaptor<Producto> guardado = ArgumentCaptor.forClass(Producto.class);
        verify(repositorio).guardar(guardado.capture());           // ¿se llamó? ¿con qué?
        assertThat(guardado.getValue().stock()).isEqualTo(3);
    }

    @Test
    void sinStockNoSeGuardaNada() {
        given(repositorio.buscar(1)).willReturn(Optional.of(new Producto(1, "Teclado", 100, 1)));

        assertThatThrownBy(() -> servicio.reservar(1, 2)).hasMessage("Solo quedan 1 unidades");
        verify(repositorio, never()).guardar(any());
    }
}
