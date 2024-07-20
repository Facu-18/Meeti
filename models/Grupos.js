import Sequelize  from "sequelize";
import db from "../config/db.js";
import { UUIDV4 } from "sequelize";
import Categorias from "./Categoria.js";
import Usuario from "./Usuario.js";
import UsuarioGoogle from "./UsuariosGoogle.js";

const Grupo = db.define('grupos',{
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: UUIDV4
    },
    nombre : {
        type: Sequelize.TEXT(100),
        allowNull: false,
        validate: {
            notEmpty:{msg: 'El grupo debe tener un nombre' },
            
        }
    },
    descripcion:{
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty:{msg: 'Coloca una descripcion'},
        }
    },
    url: Sequelize.TEXT,
    imagen: Sequelize.TEXT,
    usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: Usuario,
            key: 'id'
        }
    },
    usuarioGoogleId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: UsuarioGoogle,
            key: 'id'
        }
    }
})

// Relaciones
Grupo.belongsTo(Categorias, { foreignKey: 'categoriaId' });
Grupo.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Grupo.belongsTo(UsuarioGoogle, { foreignKey: 'usuarioGoogleId', as: 'usuarioGoogle' });

export default Grupo