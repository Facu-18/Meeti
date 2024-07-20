import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Usuario from '../models/Usuario.js';
import UsuarioGoogle from '../models/UsuariosGoogle.js';
import { where } from 'sequelize';


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},async (email,password,done)=>{
    // ejecutar al llenar el form
    const usuario = await Usuario.findOne({where:{email, activo : 1}});

    // revisar si existe
    if(!usuario) return done(null,false, {message: 'El usuario no existe o la cuenta no esta confirmada'});
    // el usuario existe comparar password
    const verificarPass = usuario.validarPassword(password);

    // si el password es incorrecto
    if(!verificarPass) return done(null,false, {message: 'La contraseña es incorrecta'})

    // si todo salio bien
    return done(null,usuario);

    
}
))

passport.serializeUser(function(usuario,cb){
    cb(null, usuario)
});

passport.deserializeUser(function(usuario,cb){
    cb(null, usuario)
})

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UsuarioGoogle.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// AUTENTICACION CON GOOGLE

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Verificar si el usuario ya existe en la base de datos
        let usuario = await UsuarioGoogle.findOne({ where: { googleId: profile.id } });

        if (!usuario) {
            // Si no existe, crear un nuevo usuario
            usuario = await UsuarioGoogle.create({
                googleId: profile.id,
                nombre: profile.displayName,
                email: profile.emails[0].value,
                // Otros campos relevantes
            });
        }

        // Devolver el usuario encontrado o creado
        return done(null, usuario);
    } catch (error) {
        return done(error);
    }
}));

export default passport;
