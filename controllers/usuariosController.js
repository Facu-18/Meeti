import Usuario from '../models/Usuario.js'
import UsuarioGoogle from '../models/UsuariosGoogle.js';
import flash from 'connect-flash'
import { body, check, validationResult } from 'express-validator';
import { emailConfirmarCuenta } from '../config/email.js';
import passport from 'passport';

const formCrearCuenta = (req,res)=>{
   res.render('crear-cuenta',{
      nombrePagina : 'Crea tu cuenta'
   })
}

const crearCuenta = async (req, res) => {
   try {
      // Validación de campos
      await check('nombre').notEmpty().withMessage('El campo nombre es obligatorio').run(req);

      await check('email').isEmail().withMessage('El formato no corresponde a un email').run(req);
       
      // validacion de contraseña
      await check('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres').run(req);
      await check('repetir_password').notEmpty().withMessage('El campo repetir contraseña no puede ir vacío').run(req);
      await check('repetir_password').custom((value, { req }) => {
         if (value !== req.body.password) {
             throw new Error('Las contraseñas no coinciden');
         }
         return true;
       }).withMessage('Las contraseñas no coinciden').run(req);

       const erroresExpressValidator = validationResult(req);

       if (!erroresExpressValidator.isEmpty()) {
         // Si hay errores de express-validator, enviar mensajes de error y redirigir al formulario
         const erroresArray = erroresExpressValidator.array().map(err => ({ msg: err.msg }));
         req.flash('error', erroresArray.map(err => err.msg));
         return res.redirect('/crear-cuenta');
      }

      // Crear usuario si no hay errores de validación
      const usuario = {
         nombre: req.body.nombre,
         email: req.body.email,
         password: req.body.password,
         // Otras propiedades de usuario, según sea necesario
      };

      const nuevoUsuario = await Usuario.create(usuario);
      
      // URL de confirmacion
      const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`
      
      // enviar mail de confirmacion
      await emailConfirmarCuenta({
         email: usuario.email,
         nombre: usuario.nombre,
         url: url
      })
      
      req.flash('exito', 'Cuenta Creada Correctamente, Hemos enviado un mail para verificar tu Cuenta')
      res.redirect('/iniciar-sesion')
   } 
   
   catch (error) {
      // Manejar errores de creación de usuario
      console.error('Error al crear usuario:', error);

      let listaErrores = [];

      if (error.errors && Array.isArray(error.errors)) {
         // Si Sequelize retorna errores estructurados
         listaErrores = error.errors.map(err => err.message);
      } else {
         // Manejar otros tipos de errores
         listaErrores.push(error.message || 'Ocurrió un error al procesar la solicitud.');
      }

      req.flash('error', listaErrores);
      return res.redirect('/crear-cuenta');
   }
};


// Confirmar cuenta
const confirmarCuenta = async(req,res,next)=>{
   //verificar si el usuario existe
   const usuario = await Usuario.findOne({where:{email: req.params.correo}});

   if(!usuario){
      req.flash('error', 'No existe esta cuenta');
      res.redirect('/crear-cuenta');
      return next();
   }
   else{
      usuario.activo = 1
      await usuario.save()

      req.flash('exito', 'La cuenta se confirmo correctamente, puedes iniciar sesion');
      res.redirect('/iniciar-sesion')
   }

}

const formIniciarSesion = (req,res)=>{
   res.render('iniciar-sesion',{
      nombrePagina : 'Iniciar Sesion'
   })
}

export{
   formCrearCuenta,
   crearCuenta,
   formIniciarSesion,
   confirmarCuenta,
}