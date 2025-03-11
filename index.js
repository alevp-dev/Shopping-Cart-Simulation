const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const cargarStock = () => JSON.parse(fs.readFileSync("inventario.json", "utf8"));
const guardarStock = (stock) => fs.writeFileSync("inventario.json", JSON.stringify(stock, null, 2));
const cargarHistorial = () => JSON.parse(fs.readFileSync("historial.json", "utf8"));
const guardarHistorial = (historial) => fs.writeFileSync("historial.json", JSON.stringify(historial, null, 2));

let stock = cargarStock();
let carrito = [];
let usuario = { nombre: "", edad: 0 };

const solicitarDatosUsuario = () => {
    rl.question("Ingrese su nombre: ", (nombre) => {
        if (!nombre.trim()) {
            console.log("El nombre no puede estar vacío.");
            return solicitarDatosUsuario();
        }
        rl.question("Ingrese su edad: ", (edad) => {
            edad = parseInt(edad);
            if (isNaN(edad) || edad <= 0) {
                console.log("Edad no válida.");
                return solicitarDatosUsuario();
            }
            usuario = { nombre, edad };
            console.log(`\n¡Bienvenid@, ${usuario.nombre}!`);
            mostrarMenu();
        });
    });
};

const mostrarMenu = () => {
    console.log("\nFruver Online");
    console.log("1. Comprar");
    console.log("2. Ver carrito");
    console.log("3. Editar cantidad de un producto en el carrito");
    console.log("4. Eliminar productos del carrito");
    console.log("5. Finalizar compra");
    console.log("6. Ver historial de compras");
    console.log("7. Salir");
    rl.question("Seleccione una opción: ", manejarOpcion);
};

const manejarOpcion = (opcion) => {
    switch (opcion) {
        case "1": mostrarCategorias(); break;
        case "2": verCarrito(); break;
        case "3": editarCantidadCarrito(); break;
        case "4": eliminarCarrito(); break;
        case "5": finalizarCompra(); break;
        case "6": verHistorialCompras(); break;
        case "7":
            console.log("Gracias por su visita. ¡Hasta luego!");
            rl.close();
            break;
        default:
            console.log("Opción no válida. Inténtelo nuevamente.");
            mostrarMenu();
    }
};

const mostrarCategorias = () => {
    console.log("\nCategorías disponibles:");
    Object.keys(stock).forEach((categoria, index) => {
        console.log(`${index + 1}. ${categoria}`);
    });

    rl.question("Seleccione una categoría: ", (opcion) => {
        const categorias = Object.keys(stock);
        const seleccion = parseInt(opcion) - 1;

        if (seleccion >= 0 && seleccion < categorias.length) {
            mostrarProductos(categorias[seleccion]);
        } else {
            console.log("Categoría no válida. Intente nuevamente.");
            mostrarCategorias();
        }
    });
};

const mostrarProductos = (categoria) => {
    console.log(`\nProductos en ${categoria}:`);
    Object.entries(stock[categoria]).forEach(([nombre, info], index) => {
        console.log(`${index + 1}. ${nombre} - $${info.precioUnitario} (Stock: ${info.cantidad})`);
    });

    rl.question("Seleccione un producto: ", (opcion) => {
        const productos = Object.keys(stock[categoria]);
        const seleccion = parseInt(opcion) - 1;

        if (seleccion >= 0 && seleccion < productos.length) {
            agregarAlCarrito(categoria, productos[seleccion]);
        } else {
            console.log("Producto no válido. Intente nuevamente.");
            mostrarProductos(categoria);
        }
    });
};

const agregarAlCarrito = (categoria, producto) => {
    rl.question(`¿Cuántas unidades de ${producto} desea comprar? `, (cantidad) => {
        cantidad = parseInt(cantidad);
        if (cantidad > 0 && cantidad <= stock[categoria][producto].cantidad) {
            carrito.push({ categoria, producto, cantidad, precioUnitario: stock[categoria][producto].precioUnitario });
            stock[categoria][producto].cantidad -= cantidad;
            guardarStock(stock);
            console.log(`Se añadieron ${cantidad} ${producto}(s) al carrito.`);
        } else {
            console.log("Cantidad no válida o insuficiente stock.");
        }
        mostrarMenu();
    });
};

const verCarrito = () => {
    console.log("\nCarrito de Compras");
    if (carrito.length === 0) {
        console.log("El carrito está vacío.");
    } else {
        let total = 0;
        carrito.forEach((item, index) => {
            let subtotal = item.cantidad * item.precioUnitario;
            total += subtotal;
            console.log(`${index + 1}. ${item.producto} - ${item.cantidad} unidad(es) - $${subtotal}`);
        });
        console.log(`\nTotal: $${total}`);
    }
    mostrarMenu();
};

const editarCantidadCarrito = () => {
    if (carrito.length === 0) {
        console.log("El carrito está vacío.");
        return mostrarMenu();
    }
    console.log("\nProductos en el carrito:");
    carrito.forEach((item, index) => {
        console.log(`${index + 1}. ${item.producto} - ${item.cantidad} unidad(es)`);
    });
    rl.question("Seleccione el número del producto a editar: ", (opcion) => {
        const index = parseInt(opcion) - 1;
        if (index < 0 || index >= carrito.length) {
            console.log("Selección inválida.");
            return editarCantidadCarrito();
        }
        rl.question("Ingrese la nueva cantidad: ", (nuevaCantidad) => {
            nuevaCantidad = parseInt(nuevaCantidad);
            if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
                console.log("Cantidad no válida.");
                return editarCantidadCarrito();
            }
            carrito[index].cantidad = nuevaCantidad;
            console.log("Cantidad actualizada.");
            mostrarMenu();
        });
    });
};

const eliminarCarrito = () => {
    if (carrito.length === 0) {
        console.log("El carrito está vacío.");
        return mostrarMenu();
    }
    console.log("\nCarrito de Compras");
    carrito.forEach((item, index) => {
        console.log(`${index + 1}. ${item.producto} - ${item.cantidad} unidad(es)`);
    });
    rl.question("Seleccione el número del producto a eliminar o 0 para cancelar: ", (opcion) => {
        if (opcion === "0") return mostrarMenu();
        const index = parseInt(opcion) - 1;
        if (index < 0 || index >= carrito.length) {
            console.log("Selección inválida.");
            return eliminarCarrito();
        }
        carrito.splice(index, 1);
        console.log("Producto eliminado.");
        mostrarMenu();
    });
};

const finalizarCompra = () => {
    if (carrito.length === 0) {
        console.log("\nNo hay productos en el carrito.");
        mostrarMenu();
        return;
    }

    console.log("\nResumen de la compra:");
    let total = 0;
    carrito.forEach((item, index) => {
        let subtotal = item.cantidad * item.precioUnitario;
        total += subtotal;
        console.log(`${index + 1}. ${item.producto} - ${item.cantidad} unidad(es) - $${subtotal}`);
    });
    console.log(`Total a pagar: $${total}`);

    rl.question("\n¿Desea finalizar la compra? (si/no): ", (respuesta) => {
        if (respuesta.toLowerCase() === "si") {
            let historial = cargarHistorial();
            historial.push({ usuario, carrito, fecha: new Date().toISOString(), total });
            guardarHistorial(historial);
            carrito = [];
            console.log("\n¡Compra realizada y guardada en el historial!");
        } else {
            console.log("\nLa compra no se ha finalizado. Puede seguir comprando.");
        }
        mostrarMenu();
    });
};


const verHistorialCompras = () => {
    let historial = cargarHistorial();
    console.log("\nHistorial de Compras");
    if (historial.length === 0) return console.log("No hay historial de compras.");
    historial.forEach((compra, index) => {
        console.log(`${index + 1}. ${compra.usuario.nombre} - ${compra.fecha} - Total: $${compra.total}`);
    });
    mostrarMenu();
};

solicitarDatosUsuario();
