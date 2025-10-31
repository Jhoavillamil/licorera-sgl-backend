#!/bin/bash
# -----------------------------------------------------------------
# SGL v2.0: Script de Inicialización COMPLETA del Backend NestJS
# -----------------------------------------------------------------
# Rol Responsable: Rol A (Líder Técnico / Arquitecto)
# Función: Automatiza la instalación del CLI, la creación del proyecto
# y la generación de toda la estructura base del Contrato de API (Hito 2).
# Esta versión es TOTALMENTE NO INTERACTIVA.
# -----------------------------------------------------------------

# -----------------------------------------------------------------
# 1. Preparación y Verificación
# -----------------------------------------------------------------
echo "========================================================="
echo "INICIO: Inicialización completa del Backend (Hito 2)"
echo "========================================================="

# Asegura estar en el directorio correcto
cd "$(dirname "$0")"

echo "[SETUP 1/5] Verificando la presencia de Node.js y npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm (Node Package Manager) no está instalado. Instale Node.js y reintente."
    exit 1
fi

# -----------------------------------------------------------------
# 2. Instalación del CLI de NestJS (Automatizada)
# -----------------------------------------------------------------
echo "[SETUP 2/5] Instalando o verificando NestJS CLI globalmente..."
npm install -g @nestjs/cli

# -----------------------------------------------------------------
# 3. Creación del Proyecto Base NestJS (FASE I)
# -----------------------------------------------------------------
echo "[SETUP 3/5] Creando proyecto NestJS base en el directorio actual (backend/)..."

# Usamos --skip-install para controlar la instalación en el siguiente paso
nest new . --strict --package-manager npm --skip-install

if [ $? -ne 0 ]; then
    echo "AVISO: La creación del proyecto pudo haber fallado si el directorio no estaba vacío."
fi

# Instalar dependencias locales del proyecto
echo "Instalando dependencias de Node..."
npm install

# -----------------------------------------------------------------
# 4. Generación de Directorios y Estructura (FASE II - NO INTERACTIVA)
# -----------------------------------------------------------------
echo "[SETUP 4/5] Generando estructura de Contrato de API (No interactivo)..."

# Generación de Directorios Críticos (Entidades y DTOs)
mkdir -p src/entities src/shared/dtos src/config

# Usamos 'echo "rest"' y 'echo "y"' para forzar las opciones no interactivas:
# 'rest' para la capa de transporte, 'y' para crear CRUD completo.

# RF-029: Proveedores (CRUD - Rol B)
echo "rest" | nest generate resource suppliers --no-spec --no-interactive

# RF-028: Reglas de Negocio Parametrizables (CRUD - Rol A)
echo "rest" | nest generate resource rules/params --no-spec --no-interactive

# RF-030: Gestión de Usuarios y Roles (CRUD - Rol A/Seguridad)
echo "rest" | nest generate resource users --no-spec --no-interactive

# RF-025: Analítica Avanzada (Solo Módulo, Controlador y Servicio - Rol A)
nest generate module analytics --no-spec
nest generate controller analytics/kpis --no-spec
nest generate service analytics/analysis --no-spec

# Generación de Modelos de Entidades Base
nest generate class entities/supplier --no-spec
nest generate class entities/rule-param --no-spec
nest generate class entities/user --no-spec # Añadido user.ts para FASE 2.5

# -----------------------------------------------------------------
# 5. Finalización y Pausa
# -----------------------------------------------------------------
echo "[SETUP 5/5] FINALIZACIÓN."
echo "========================================================="
echo "✅ INICIALIZACIÓN COMPLETA Y ESTRUCTURA GENERADA."
echo " "
echo "➡️ PRÓXIMO PASO CRÍTICO (Rol A - FASE 2):"
echo "   1. Definir los modelos TypeORM en 'src/entities/*.ts'."
echo "   2. Definir el Contrato de API en 'src/modules/**/dto/*.ts'."
echo "========================================================="
echo "Presiona cualquier tecla para cerrar la terminal..."
read -n 1 -s
