import { validationResult, check } from "express-validator";
import Categorias from "../models/Categoria.js"
import Grupo from "../models/Grupos.js";
import Usuario from "../models/Usuario.js";
import UsuarioGoogle from "../models/UsuariosGoogle.js";


const formNuevoGrupo = async (req,res)=>{
   const categorias = await Categorias.findAll();
    
   res.render('nuevo-grupo',{
    nombrePagina: 'Crea un nuevo grupo',
    categorias
   })
}

const crearGrupo = async (req, res) => {
    const grupo = req.body;

    // Verificación y asignación de IDs de usuario
    if (req.user) {
        console.log("Usuario autenticado:", req.user); // Mensaje de depuración

        if (req.user instanceof Usuario) {
            grupo.usuarioId = req.user.id;
            grupo.usuarioGoogleId = null; // Asegurarse de que usuarioGoogleId no esté definido
        } else if (req.user instanceof UsuarioGoogle) {
            grupo.usuarioGoogleId = req.user.id;
            grupo.usuarioId = null; // Asegurarse de que usuarioId no esté definido
        }
    } else {
        console.error("Usuario no autenticado");
        req.flash('error', 'Debe estar autenticado para crear un grupo.');
        return res.redirect('/nuevo-grupo');
    }

    try {
        // Validación de campos
        await check('nombre').notEmpty().trim().escape().withMessage('El campo nombre es obligatorio').run(req);
        await check('descripcion').notEmpty().trim().escape().withMessage('La descripcion no puede ir vacia').run(req);

        const erroresExpressValidator = validationResult(req);

        if (!erroresExpressValidator.isEmpty()) {
            // Si hay errores de express-validator, enviar mensajes de error y redirigir al formulario
            const erroresArray = erroresExpressValidator.array().map(err => ({ msg: err.msg }));
            req.flash('error', erroresArray.map(err => err.msg));
            return res.redirect('/nuevo-grupo');
        }

        // Crear el grupo
        console.log("Datos del grupo antes de crear:", grupo); // Mensaje de depuración

        const nuevoGrupo = await Grupo.create(grupo);
        console.log("Grupo creado:", nuevoGrupo); // Mensaje de depuración
        req.flash('exito', 'El grupo fue creado correctamente');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Ocurrió un error al crear el grupo. Inténtalo de nuevo.');
        res.redirect('/nuevo-grupo');
    }
};



export{
    formNuevoGrupo,
    crearGrupo,
    
}