# Huecos del track DevOps frente a la biblioteca externa


## Estado (2026-10-28)
Resuelto: **M0 T10** (usuarios, grupos, setgid y sudo limitado) y **M0 T11** (systemd, timers y journalctl). Script de usuarios y validación de unidades ejecutados en Ubuntu 24.04. Pendiente opcional: LVM/RAID y NFS/Samba.

**Fecha:** 2026-10-28 · **Método:** índices de los PDF con texto + palabras clave en `devops` y `foundations`.

## Libros cotejados
- **Linux, manual de referencia 6a ed. (Petersen)**: el outline solo trae "Parte I…VIII", no da detalle.
- **Programacion_Linux_Administracion_Tutorial_Avanzado.pdf** (589 págs.): administración del sistema.
- **Docker - Guía práctica (Dogram Code)**: el outline es solo números de página; **pendiente de OCR/lectura**.
- **Programacion_Docker_Contenedores_Tutorial_Basico.pdf**: escaneado; **pendiente de OCR**.

## Huecos (administración Linux)
Docker, Kubernetes, CI/CD y observabilidad están cubiertos en profundidad. Lo que falta es **administración de sistemas clásica**:

| Tema | Estado (devops + foundations) | Prioridad |
|---|---|---|
| **systemd y journalctl** (units, servicios, timers, logs) | 1 / 0 menciones | **Alta** |
| **Usuarios, grupos y sudo** | 1 mención | **Alta** |
| **Firewall moderno** (nftables/ufw/firewalld) | 1 mención | Media |
| **Discos: particiones, fstab, LVM y RAID** | LVM 0, RAID 0 | Media |
| **Compartir archivos: NFS y Samba** | 0 | Baja |
| **Anillos de protección y espacio kernel/usuario** | foundations M8 T1 lo cubre en parte | Baja |

## Propuesta
Ampliar M0 con dos temas: "systemd, servicios y journalctl" y "Usuarios, grupos, sudo y firewall". Si se quiere más detalle, crear un módulo opcional "Administración Linux" con LVM/RAID y NFS/Samba.
