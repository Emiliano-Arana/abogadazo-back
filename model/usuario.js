module.exports = {
    obtener: function(conexion, callback) {
        conexion.query("SELECT * FROM usuario", (err, results) => {
            if (err) return callback(err);
            callback(null, results.rows);
        });
    },

    //CREAR UN USUARIO CLIENTE/ADMINISTRADOR
        // Verificar si usuario existe
        existeUsuario: function(conexion, usuario, email, callback) {
            const query = "SELECT * FROM usuario WHERE usuario = $1 OR email = $2";
            conexion.query(query, [usuario, email], (err, resultados) => {
                if (err) return callback(err);
                callback(null, resultados.rows.length > 0);
            });
        },
        // Crear nuevo usuario
        crearUsuario: function(conexion, datosUsuario, callback) {
            const query = `INSERT INTO usuario (usuario, nombre, apellido, rol, email, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
            const values = [
            datosUsuario.usuario,
            datosUsuario.nombre,
            datosUsuario.apellido,
            datosUsuario.rol,
            datosUsuario.email,
            datosUsuario.password
            ];
            conexion.query(query, values, (err, resultados) => {
                if (err) return callback(err);
                callback(null, resultados.rows[0]);
            });
        },
    //EDITAR USUARIO
        // Obtener usuario por nombre de usuario
        obtenerPorUsuario: function(conexion, usuarioParam, callback) {
            const query = "SELECT * FROM usuario WHERE usuario = $1";
            conexion.query(query, [usuarioParam], (err, resultados) => {
                if (err) return callback(err);
                callback(null, resultados.rows[0]); // Devuelve el primer resultado
            });
        },

        // Verificar si otro usuario tiene el mismo nombre o email (excluyendo el usuario actual)
        existeOtroUsuario: function(conexion, usuarioActual, nuevoUsuario, nuevoEmail, callback) {
            const query = "SELECT * FROM usuario WHERE (usuario = $1 OR email = $2) AND usuario != $3";
            conexion.query(query, [nuevoUsuario, nuevoEmail, usuarioActual], (err, resultados) => {
                if (err) return callback(err);
                callback(null, resultados.rows.length > 0);
            });
        },

        // Actualizar usuario por nombre de usuario
        actualizarUsuarioPorUsuario: function(conexion, usuarioActual, datosUsuario, callback) {
            const query = `
            UPDATE usuario
            SET usuario = $1,
                nombre = $2,
                apellido = $3,
                rol = $4,
                email = $5
            WHERE usuario = $6
            RETURNING *`;
            const values = [
            datosUsuario.usuario,
            datosUsuario.nombre,
            datosUsuario.apellido,
            datosUsuario.rol,
            datosUsuario.email,
            usuarioActual
            ];
            conexion.query(query, values, (err, resultados) => {
                if (err) return callback(err);
                callback(null, resultados.rows[0]);
            });
        },
    //INICIO SESION
        autenticarUsuario: function(conexion, usuario, password, callback) {
            const query = "SELECT id, usuario, nombre, apellido, rol, email FROM usuario WHERE usuario = $1 AND password = $2";
            conexion.query(query, [usuario, password], (err, resultados) => {
                if (err) return callback(err);
                callback(null, resultados.rows[0]); // Devuelve el primer resultado sin la contraseña
            });
        },
    //OBTENER DATOS USUARIO ESPECIFICO
        // Obtener datos de usuario por nombre de usuario (sin contraseña)
        obtenerPorUsuario: function(conexion, usuarioParam, callback) {
            const query = "SELECT id, usuario, nombre, apellido, rol, email FROM usuario WHERE usuario = $1";
            conexion.query(query, [usuarioParam], (err, resultados) => {
                if (err) return callback(err);
                callback(null, resultados.rows[0]); // Devuelve solo el primer resultado
            });
        },
    //OBTENER USUARIOS CLIENTE/ADMINISTRADOR
        // Obtener todos los administradores
        obtenerAdministradores: function(conexion, callback) {
            const query = "SELECT id, usuario, nombre, apellido, rol, email FROM usuario WHERE rol = 'admin' OR rol = 'admin'";
            conexion.query(query, (err, resultados) => {
                if (err) return callback(err);
                callback(null, resultados.rows);
            });
        },

        // Obtener todos los clientes
        obtenerClientes: function(conexion, callback) {
            const query = `
                SELECT 
                    u.id, 
                    u.usuario, 
                    u.nombre, 
                    u.apellido, 
                    u.rol, 
                    u.email, 
                    COUNT(c.id) AS consultas
                FROM usuario u
                LEFT JOIN consulta c ON c.id_usuario = u.id
                WHERE u.rol = 'usuario'
                GROUP BY u.id, u.usuario, u.nombre, u.apellido, u.rol, u.email
                ORDER BY u.nombre, u.apellido;
                `;

            conexion.query(query, (err, resultados) => {
                if (err) return callback(err);
                callback(null, resultados.rows);
            });
        },
    //ELIMINAR USUARIO
        // Eliminar usuario solo por nombre de usuario
        eliminarPorUsuario: function(conexion, usuarioParam, callback) {
            const query = "DELETE FROM usuario WHERE usuario = $1 RETURNING *";
            conexion.query(query, [usuarioParam], (err, resultados) => {
                if (err) return callback(err);
                callback(null, resultados.rowCount);
            });
        },

        // Eliminar usuario con validación de usuario y contraseña
        eliminarPorUsuarioYPassword: function(conexion, usuarioParam, password, callback) {
            // Primero verificar que coincidan usuario y contraseña
            const queryVerificar = "SELECT id FROM usuario WHERE usuario = $1 AND password = $2";
            conexion.query(queryVerificar, [usuarioParam, password], (err, resultados) => {
                if (err) return callback(err);
                
                if (resultados.rows.length === 0) {
                    return callback(null, 0); // No se encontró coincidencia
                }

                // Si las credenciales son correctas, proceder a eliminar
                const queryEliminar = "DELETE FROM usuario WHERE usuario = $1 RETURNING *";
                conexion.query(queryEliminar, [usuarioParam], (err, resultados) => {
                    if (err) return callback(err);
                    callback(null, resultados.rowCount);
                });
            });
        }
}