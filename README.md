# 💪 Gym Tracker

Una aplicación web moderna y completa para rastrear tus entrenamientos, rutinas y progreso en el gimnasio. Desarrollada con React y diseñada con una interfaz intuitiva que se adapta a tus necesidades.

![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Características

### 🏋️ Gestión de Rutinas
- **Crear rutinas personalizadas** con ejercicios específicos
- **Editar y eliminar** rutinas existentes
- **Configurar series y repeticiones** para cada ejercicio
- Organiza tus entrenamientos de manera estructurada

### 📊 Seguimiento de Entrenamientos
- **Registra entrenamientos** con peso y repeticiones por serie
- **Fecha personalizable** para cada entrenamiento
- **Interfaz intuitiva** para ingresar datos rápidamente
- Historial completo de todos tus entrenamientos

### 📈 Análisis de Progreso
- **Gráficos interactivos** de progreso por ejercicio
- **Peso máximo** alcanzado a lo largo del tiempo
- **Volumen total** (peso × repeticiones) por sesión
- **Estadísticas generales**: total de entrenamientos, ejercicios únicos y días activos
- Historial reciente de los últimos 10 entrenamientos

### 💾 Gestión de Datos
- **Exportar a JSON**: Backup completo de rutinas y entrenamientos
- **Exportar a CSV**: Solo entrenamientos para análisis externo (Excel, Google Sheets, etc.)
- **Importar desde JSON**: Restaura tus datos desde un backup
- **Almacenamiento local**: Todos los datos se guardan en tu navegador

### 🎨 Experiencia de Usuario
- **Modo oscuro/claro**: Toggle entre temas según tu preferencia
- **Diseño responsive**: Funciona perfectamente en desktop y móvil
- **Interfaz moderna**: Diseñada con Tailwind CSS para una experiencia visual atractiva
- **Iconos intuitivos**: Navegación clara con Lucide React icons

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm o yarn

### Instalación

1. **Clona el repositorio** (o descarga el proyecto)
   ```bash
   git clone <url-del-repositorio>
   cd gym-tracker
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm start
   ```

4. **Abre tu navegador** en [http://localhost:3000](http://localhost:3000)

La aplicación se recargará automáticamente cuando hagas cambios en el código.

## 📦 Scripts Disponibles

### `npm start`
Ejecuta la aplicación en modo desarrollo. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### `npm test`
Ejecuta las pruebas en modo interactivo.

### `npm run build`
Construye la aplicación para producción en la carpeta `build`. Optimiza el código para el mejor rendimiento.

### `npm run eject`
**⚠️ Advertencia: Esta es una operación irreversible.**

Si necesitas más control sobre la configuración de webpack, Babel, ESLint, etc., puedes ejecutar este comando. Esto copiará todos los archivos de configuración a tu proyecto.

## 🛠️ Tecnologías Utilizadas

- **React 19.2.3** - Biblioteca de JavaScript para construir interfaces de usuario
- **Tailwind CSS 3.4.1** - Framework de CSS utility-first
- **Recharts 3.6.0** - Biblioteca de gráficos para React
- **Lucide React 0.562.0** - Iconos modernos y ligeros
- **Create React App** - Herramienta para crear aplicaciones React

## 📱 Uso de la Aplicación

### Crear una Rutina

1. Ve a la pestaña **"Rutinas"**
2. Haz clic en **"Nueva Rutina"**
3. Ingresa el nombre de la rutina
4. Agrega ejercicios con sus series y repeticiones
5. Guarda la rutina

### Realizar un Entrenamiento

1. Desde la pestaña **"Rutinas"**, selecciona una rutina y haz clic en **"Comenzar Entrenamiento"**
2. O ve directamente a la pestaña **"Entrenar"** y selecciona una rutina
3. Ajusta la fecha si es necesario
4. Ingresa el peso y repeticiones para cada serie
5. Guarda el entrenamiento

### Ver tu Progreso

1. Ve a la pestaña **"Progreso"**
2. Revisa las estadísticas generales
3. Selecciona un ejercicio del menú desplegable
4. Visualiza los gráficos de peso máximo y volumen total
5. Revisa tu historial reciente

### Exportar/Importar Datos

1. Haz clic en el icono de **Configuración** (⚙️) en la esquina superior derecha
2. **Exportar a JSON**: Descarga un backup completo
3. **Exportar a CSV**: Descarga solo los entrenamientos para análisis
4. **Importar desde JSON**: Restaura tus datos desde un archivo JSON

## 💡 Características Técnicas

- **Almacenamiento Local**: Todos los datos se guardan en `localStorage` del navegador
- **Sin Backend**: Aplicación completamente del lado del cliente
- **Responsive Design**: Optimizado para diferentes tamaños de pantalla
- **Modo Oscuro**: Persistente entre sesiones
- **Exportación de Datos**: Formatos JSON y CSV para máxima compatibilidad

## 📊 Estructura del Proyecto

```
gym-tracker/
├── public/          # Archivos públicos (HTML, favicon, etc.)
├── src/
│   ├── App.js       # Componente principal de la aplicación
│   ├── App.css      # Estilos adicionales
│   ├── index.js     # Punto de entrada de React
│   └── index.css    # Estilos globales y Tailwind
├── package.json     # Dependencias y scripts
├── tailwind.config.js  # Configuración de Tailwind CSS
└── postcss.config.js   # Configuración de PostCSS
```

## 🔒 Privacidad

Todos tus datos se almacenan **localmente en tu navegador**. No se envían a ningún servidor externo. Tú tienes control total sobre tus datos.

## 🐛 Solución de Problemas

### Error de PostCSS/Tailwind
Si encuentras errores relacionados con Tailwind CSS, asegúrate de tener las versiones correctas:
```bash
npm install tailwindcss@^3.4.1 postcss@^8.5.6 autoprefixer@^10.4.23
```

### Los datos no se guardan
Asegúrate de que tu navegador tenga habilitado `localStorage`. No uses modo incógnito si quieres que los datos persistan.

### Problemas de importación
Asegúrate de que el archivo JSON tenga el formato correcto:
```json
{
  "routines": [...],
  "workouts": [...],
  "exportDate": "..."
}
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Siéntete libre de:
1. Hacer un Fork del proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [React](https://reactjs.org/) - Por el framework increíble
- [Tailwind CSS](https://tailwindcss.com/) - Por el sistema de diseño
- [Recharts](https://recharts.org/) - Por las herramientas de visualización
- [Lucide](https://lucide.dev/) - Por los iconos hermosos

## 📧 Contacto

Si tienes preguntas o sugerencias, no dudes en abrir un issue en el repositorio.

---

**¡Entrena duro y alcanza tus metas! 💪**
