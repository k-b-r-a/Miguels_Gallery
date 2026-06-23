# 📸 Miguel's Gallery 📸 - Official Website

Galería fotográfica moderna construida con **React 19**, **Bun** y un backend automatizado con **Node.js**, **Cloudinary** y **MongoDB**.

Este proyecto está diseñado para mostrar el trabajo de [@mykegallery](https://www.instagram.com/mykegallery/).

## 🚀 Características

- **Bento Grid Adaptativo**: Diseño elegante que se ajusta automáticamente según la orientación de las fotos (horizontal/vertical).
- **Sincronización Automática**: El backend detecta fotos nuevas en Cloudinary y las registra en MongoDB al arrancar.
- **Gestión de Imágenes**: Soporte para subida, borrado y metadatos personalizados (títulos, descripciones).
- **Animaciones Premium**: Interfaz fluida impulsada por **Framer Motion**.
- **Arquitectura Unificada**: Frontend y Backend gestionados desde una única raíz para facilitar el desarrollo.

## 🛠️ Tecnologías

### Frontend
- **React 19** (vanguardia en UI)
- **Bun** (Runtime y Bundler ultra rápido)
- **Tailwind CSS v4** (Estilos modernos y optimizados)
- **Framer Motion** (Animaciones e interacciones)
- **Headless UI** & **Material UI Icons**

### Backend
- **Node.js** & **Express 5**
- **MongoDB** (Persistencia de metadatos)
- **Cloudinary SDK** (Almacenamiento y optimización de imágenes)
- **Multer** (Gestión de subidas de archivos)

## 🔧 Instalación y Configuración

1.  **Clonar el repositorio**:
    ```sh
    git clone https://github.com/k-b-r-a/Miguels_gallery.git
    cd Miguels_gallery
    ```

2.  **Instalar dependencias**:
    ```sh
    bun install
    ```

3.  **Configurar variables de entorno**:
    Crea un archivo `.env` en la raíz del proyecto con las siguientes credenciales:
    ```env
    # MongoDB
    MONGO_USER=tu_usuario
    MONGO_PASSWORD=tu_password

    # Cloudinary
    CLOUDINARY_CLOUD_NAME=tu_cloud_name
    CLOUDINARY_API_KEY=tu_api_key
    CLOUDINARY_API_SECRET=tu_api_secret
    ```

## ⌨️ Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `bun run dev` | Inicia Frontend (puerto 3000) y Backend (puerto 4000) simultáneamente. |
| `bun run dev:frontend` | Inicia solo el servidor de desarrollo de React con Hot Reload. |
| `bun run dev:backend` | Inicia el servidor Express con Node Watch Mode. |
| `bun run build` | Genera la versión de producción optimizada en la carpeta `/dist`. |

## 📝 Licencia

Este es un proyecto de código abierto. Puedes usarlo como referencia, pero **no se permiten versiones derivadas o modificadas** sin autorización previa.

---
Creado con ❤️ por [k-b-r-a](https://github.com/k-b-r-a)
