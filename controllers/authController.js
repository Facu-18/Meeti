import passport from 'passport';
import UsuarioGoogle from '../models/UsuariosGoogle.js';

const autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});



// AUTENTICAR USUARIO CON GOOGLE

// Función para registrar usuarios con Google OAuth
const registrarConGoogle = async (req, res, next) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};


// Callback de Google OAuth después de la autenticación
const registrarConGoogleCallback = async (req, res) => {
    passport.authenticate('google', { failureRedirect: '/iniciar-sesion' }, async (err, userData) => {
        if (err) {
            console.error('Error al autenticar con Google:', err);
            req.flash('error', 'Error al autenticar con Google. Inténtalo de nuevo.');
            return res.redirect('/iniciar-sesion');
        }

        if (!userData) {
            req.flash('error', 'No se recibió información del usuario desde Google.');
            return res.redirect('/iniciar-sesion');
        }

        try {
            // Verificar si el usuario ya existe en la base de datos de usuarios_google
            let usuarioGoogle = await UsuarioGoogle.findOne({ where: { googleId: userData.googleId } });

            if (!usuarioGoogle) {
                // Si el usuario no existe, crear un nuevo registro en usuarios_google
                usuarioGoogle = await UsuarioGoogle.create({
                    googleId: userData.googleId,
                    nombre: userData.nombre,
                    imagen: userData.imagen,
                    email: userData.email,
                });
            }

            // Redireccionar o iniciar sesión con el usuario creado o encontrado en usuarios_google
            req.login(usuarioGoogle, (loginErr) => {
                if (loginErr) {
                    console.error('Error al iniciar sesión:', loginErr);
                    req.flash('error', 'Error al iniciar sesión. Inténtalo de nuevo.');
                    return res.redirect('/iniciar-sesion');
                }
                return res.redirect('/administracion'); // Redirigir al dashboard u otra página
            });
        } catch (error) {
            console.error('Error al procesar el usuario de Google:', error);
            req.flash('error', 'Ocurrió un error al procesar el usuario de Google. Inténtalo de nuevo.');
            return res.redirect('/iniciar-sesion');
        }
    })(req, res);
};

const usuarioAutenticado = (req,res,next)=>{
    if(req.isAuthenticated()){
        return next();
    }

    // si no esta autenticado
    return res.redirect('/iniciar-sesion')
}

export{
    registrarConGoogleCallback,
    registrarConGoogle,
    autenticarUsuario,
    usuarioAutenticado
}
