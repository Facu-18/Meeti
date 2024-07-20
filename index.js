import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import expressEjsLayouts from 'express-ejs-layouts';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './config/passport.js'; // Importa la configuración de Passport con Google
import db from './config/db.js'; // Importa tu configuración de base de datos Sequelize
import appRoutes from './routes/appRoutes.js'; // Importa tus rutas de la aplicación
import authRoutes from './routes/authRoutes.js'; // Importa tus rutas de autenticación
import Categorias from './models/Categoria.js';

// Inicialización de variables de entorno
dotenv.config({ path: '.env' });

// Obtener el equivalente a __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear la aplicación de Express
const app = express();

// Conexión a la base de datos
(async () => {
    try {
        await db.authenticate();
        console.log('Conexión establecida correctamente');
        await db.sync(); // Solo llamar a sync una vez en el inicio
         
        // Crear algunas categorías (esto es solo un ejemplo)
        const categorias = [
            { nombre: 'Programacion' },
            { nombre: 'Diseño' },
            { nombre: 'Salud y Deporte' },
            { nombre: 'Negocio y emprendimiento' },
            { nombre: 'Moda' },
            { nombre: 'Fotografia' },
            { nombre: 'Comida y Bebidas' },
            { nombre: 'Cine Peliculas y Series' },
            { nombre: 'Libros' },
            { nombre: 'Aprendizaje' },
            { nombre: 'Tecnologia' },
            { nombre: 'Seguridad' }
        ];

        for (const cat of categorias) {
            await Categorias.findOrCreate({ where: { nombre: cat.nombre }, defaults: cat });
        }
    
    } catch (error) {
        console.error('Error al conectar y sincronizar la base de datos:', error);
    }
})();

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressEjsLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middleware para mensajes flash y datos globales
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});

// Configuración de las rutas
app.use('/', appRoutes); // Rutas de la aplicación
app.use('/', authRoutes); // Rutas de autenticación con Google

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});
