import express from 'express'
import { home } from '../controllers/homeController.js';
import { formCrearCuenta, crearCuenta, formIniciarSesion, confirmarCuenta } from '../controllers/usuariosController.js';
import {autenticarUsuario, usuarioAutenticado} from '../controllers/authController.js'
import authRoutes from './authRoutes.js';
import {panelAdministracion} from '../controllers/adminController.js'
import {formNuevoGrupo, crearGrupo} from '../controllers/gruposController.js'

const router = express.Router();

router.get('/', home)
    
// Crear y confirmar cuentas
router.get('/crear-cuenta', formCrearCuenta)
router.post('/crear-cuenta', crearCuenta)
router.get('/confirmar-cuenta/:correo', confirmarCuenta)

// Iniciar sesion
router.get('/iniciar-sesion', formIniciarSesion)
router.post('/iniciar-sesion', autenticarUsuario)

// Rutas de autenticación
router.use('/auth', authRoutes);

// Panel de administracion
router.get('/administracion', usuarioAutenticado, panelAdministracion)

// nuevos grupos
router.get('/nuevo-grupo', usuarioAutenticado, formNuevoGrupo)
router.post('/nuevo-grupo', usuarioAutenticado, crearGrupo)

export default router;