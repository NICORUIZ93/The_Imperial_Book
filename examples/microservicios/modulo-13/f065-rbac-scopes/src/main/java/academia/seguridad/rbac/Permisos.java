package academia.seguridad.rbac;

import java.util.Map;
import java.util.Set;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

/**
 * Decisión RBAC + scopes en un solo lugar:
 *   permiso concedido  <=>  algún ROL del usuario lo incluye  Y  el token trae el SCOPE con ese nombre.
 * Se usa desde @PreAuthorize("@permisos.puede(authentication, 'pedidos:leer')").
 */
@Component("permisos")
public class Permisos {

    static final Map<String, Set<String>> POR_ROL = Map.of(
        "cliente", Set.of("pedidos:leer", "pedidos:crear"),
        "soporte", Set.of("pedidos:leer", "pedidos:reembolsar"),
        "admin", Set.of("pedidos:leer", "pedidos:crear", "pedidos:reembolsar", "pedidos:borrar"));

    public boolean puede(Authentication auth, String permiso) {
        boolean porRol = false, porScope = false;
        for (GrantedAuthority a : auth.getAuthorities()) {
            String nombre = a.getAuthority();
            if (nombre.startsWith("ROLE_") && POR_ROL.getOrDefault(nombre.substring(5), Set.of()).contains(permiso)) porRol = true;
            if (nombre.equals("SCOPE_" + permiso)) porScope = true;
        }
        return porRol && porScope;
    }
}
