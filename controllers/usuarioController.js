var conexion = require('../config/conexion');
var usuarioModel = require("../model/usuario");

module.exports = {
    index: function(req, res) {
        usuarioModel.obtener(conexion, function(err, datos) {
            if (err) {
                // Si hay un error, devuelve un código 500 con el mensaje de error
                return res.status(500).json({
                    error: true,
                    message: err.message
                });
            }
            
            // Si todo va bien, devuelve los datos en formato JSON
            res.status(200).json({
                error: false,
                data: datos
            });
        });
    },
    crearUsuario: function(req, res) {
        const { usuario, nombre, apellido, rol, email, password } = req.body;

        // Validar campos vacíos
        if (!usuario || !nombre || !apellido || !rol || !email || !password) {
            return res.status(400).json({
                error: true,
                message: "Todos los campos son obligatorios"
            });
        }

        // Validar formato de email simple
        if (!email.includes('@') || !email.includes('.')) {
            return res.status(400).json({
                error: true,
                message: "El email no tiene un formato válido"
            });
        }

        // Verificar si el usuario o email ya existen
        usuarioModel.existeUsuario(conexion, usuario, email, (err, existe) => {
            if (err) {
                return res.status(500).json({
                    error: true,
                    message: "Error al verificar usuario existente",
                    details: err.message
                });
            }

            if (existe) {
                return res.status(409).json({
                    error: true,
                    message: "El nombre de usuario o email ya están registrados"
                });
            }

            // Si todo está bien, crear el usuario
            const nuevoUsuario = {
                usuario,
                nombre,
                apellido,
                rol,
                email,
                password // Nota: En producción deberías hashear la contraseña
            };

            usuarioModel.crearUsuario(conexion, nuevoUsuario, (err, resultado) => {
                if (err) {
                    return res.status(500).json({
                        error: true,
                        message: "Error al crear el usuario",
                        details: err.message
                    });
                }

                res.status(201).json({
                    error: false,
                    message: "Usuario creado exitosamente",
                    usuarioId: resultado.id
                });
            });
        });
    },
    editarUsuarioPorUsuario: function(req, res) {
        const usuarioActual = req.params.usuario; // Nombre de usuario desde la URL
        const { usuario: nuevoUsuario, nombre, apellido, rol, email } = req.body;

        // Validar campos vacíos (excepto password que es opcional)
        if (!nuevoUsuario || !nombre || !apellido || !rol || !email) {
            return res.status(400).json({
                error: true,
                message: "Todos los campos excepto contraseña son obligatorios"
            });
        }

        // Validar formato de email
        if (!email.includes('@') || !email.includes('.')) {
            return res.status(400).json({
                error: true,
                message: "El email no tiene un formato válido"
            });
        }
        // Primero verificar que el usuario exista
        usuarioModel.obtenerPorUsuario(conexion, usuarioActual, (err, usuarioExistente) => {
            console.log()
            if (err) {
                return res.status(500).json({
                    error: true,
                    message: "Error al buscar el usuario",
                    details: err.message
                });
            }

            if (!usuarioExistente) {
                return res.status(404).json({
                    error: true,
                    message: "Usuario no encontrado"
                });
            }
            // Verificar si el nuevo usuario o email ya existen en otros registros
            usuarioModel.existeOtroUsuario(conexion, usuarioActual, nuevoUsuario, email, (err, existe) => {
                if (err) {
                    return res.status(500).json({
                        error: true,
                        message: "Error al verificar duplicados",
                        details: err.message
                    });
                }

                if (existe) {
                    return res.status(409).json({
                        error: true,
                        message: "El nuevo nombre de usuario o email ya están registrados en otra cuenta"
                    });
                }

                // Preparar datos para actualizar
                const datosActualizados = {
                    usuario: nuevoUsuario,
                    nombre,
                    apellido,
                    rol,
                    email
                };

                // Si se proporcionó password, actualizarlo (deberías hashearlo en producción)
                if (req.body.password) {
                    datosActualizados.password = req.body.password;
                }

                // Actualizar el usuario
                usuarioModel.actualizarUsuarioPorUsuario(conexion, usuarioActual, datosActualizados, (err, resultado) => {
                    if (err) {
                        console.log(err.message)
                        return res.status(500).json({
                            error: true,
                            message: "Error al actualizar el usuario",
                            details: err.message
                        });
                    }

                    if (resultado.rowCount === 0) {
                        return res.status(404).json({
                            error: true,
                            message: "No se realizaron cambios o el usuario no existe"
                        });
                    }

                    res.status(200).json({
                        error: false,
                        message: "Usuario actualizado exitosamente",
                        usuarioAnterior: usuarioActual,
                        usuarioActualizado: nuevoUsuario
                    });
                });
            });
        });
    },
    login: function(req, res) {
        const { usuario: username, password } = req.body;

        // Validar campos vacíos
        if (!username || !password) {
            return res.status(400).json({
                error: true,
                message: "Nombre de usuario y contraseña son obligatorios"
            });
        }

        // Autenticar usuario
        usuarioModel.autenticarUsuario(conexion, username, password, (err, usuarioEncontrado) => {
            if (err) {
                return res.status(500).json({
                    error: true,
                    message: "Error al autenticar usuario",
                    details: err.message
                });
            }

            if (!usuarioEncontrado) {
                return res.status(401).json({
                    error: true,
                    message: "Credenciales inválidas"
                });
            }

            // Si las credenciales son correctas, devolver los datos del usuario
            res.status(200).json({
                error: false,
                message: "Inicio de sesión exitoso",
                usuario: usuarioEncontrado
            });
        });
    },
    obtenerDatosUsuario: function(req, res) {
        const username = req.params.usuario; // Obtiene el usuario de los parámetros de la URL

        // Validar que se proporcionó un nombre de usuario
        if (!username) {
            return res.status(400).json({
                error: true,
                message: "Se requiere el nombre de usuario"
            });
        }

        // Buscar el usuario en la base de datos
        usuarioModel.obtenerPorUsuario(conexion, username, (err, usuarioEncontrado) => {
            if (err) {
                return res.status(500).json({
                    error: true,
                    message: "Error al buscar el usuario",
                    details: err.message
                });
            }

            if (!usuarioEncontrado) {
                return res.status(404).json({
                    error: true,
                    message: "Usuario no encontrado"
                });
            }

            // Si se encuentra el usuario, devolver sus datos
            res.status(200).json({
                error: false,
                message: "Usuario encontrado",
                usuario: usuarioEncontrado
            });
        });
    },
    obtenerAdministradores: function(req, res) {
        usuarioModel.obtenerAdministradores(conexion, (err, administradores) => {
            if (err) {
                return res.status(500).json({
                    error: true,
                    message: "Error al obtener administradores",
                    details: err.message
                });
            }

            res.status(200).json({
                error: false,
                message: "Administradores obtenidos exitosamente",
                total: administradores.length,
                administradores: administradores
            });
        });
    },
    obtenerClientes: function(req, res) {
        usuarioModel.obtenerClientes(conexion, (err, clientes) => {
            if (err) {
                return res.status(500).json({
                    error: true,
                    message: "Error al obtener clientes",
                    details: err.message
                });
            }

            res.status(200).json({
                error: false,
                message: "Clientes obtenidos exitosamente",
                total: clientes.length,
                clientes: clientes
            });
        });
    },
    // Eliminar solo con usuario (para admins)
    eliminarUsuario: function(req, res) {
        const username = req.params.usuario;

        if (!username) {
            return res.status(400).json({
                error: true,
                message: "Se requiere el nombre de usuario"
            });
        }

        usuarioModel.eliminarPorUsuario(conexion, username, (err, rowCount) => {
            if (err) {
                return res.status(500).json({
                    error: true,
                    message: "Error al eliminar el usuario",
                    details: err.message
                });
            }

            if (rowCount === 0) {
                return res.status(404).json({
                    error: true,
                    message: "Usuario no encontrado"
                });
            }

            res.status(200).json({
                error: false,
                message: "Usuario eliminado exitosamente",
                usuario: username
            });
        });
    },
    // Eliminar con usuario y contraseña (para autenticación del propio usuario)
    eliminarUsuarioConPassword: function(req, res) {
        const username = req.params.usuario;
        const { password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: true,
                message: "Se requiere nombre de usuario y contraseña"
            });
        }

        usuarioModel.eliminarPorUsuarioYPassword(conexion, username, password, (err, rowCount) => {
            if (err) {
                return res.status(500).json({
                    error: true,
                    message: "Error al eliminar el usuario",
                    details: err.message
                });
            }

            if (rowCount === 0) {
                return res.status(401).json({
                    error: true,
                    message: "Credenciales inválidas o usuario no encontrado"
                });
            }

            res.status(200).json({
                error: false,
                message: "Usuario eliminado exitosamente",
                usuario: username
            });
        });
    }





}