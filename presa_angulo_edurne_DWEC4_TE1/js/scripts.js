'use-strict'

//////////////////// JQUERY /////////////////////////
$( document ).ready(function() {
    console.log( "JQuery cargado" );
});


//////////////////// FUNCIONES //////////////////////
/* Funcion mostrarBusqueda: muestra los resultados de buscar libros en la barra de búsqueda
 *                          se llama desde la funcion buscar(), que hace la consulta a la API
 *                          crea cada ficha de libro con sus botones
 */
function mostrarBusqueda(libros) {
    // Primero se selecciona el contenedor y se vacia
    let listaBusqueda = $("#listaExplora");
    listaBusqueda.empty();

    // Verifica si hay resultados:
    if(!libros || libros.length === 0) {
        listaBusqueda.append($("<h3 class='resultados'>").text("Lo sentimos, no hay resultados."));
        return;
    } else {
        $("h3.mostrar").css("display", "block");
    }

    libros.forEach(function(libro) {
        let ficha = $("<div>").addClass("ficha_libro");
        $(ficha).data("isbn", "");
        
        // ISBN: si hay 13 mejor, si no el 10
        let isbn = "";
        let id = "";
        // Comprueba si hay campos identifiers (contienen isbn)
        if(libro.volumeInfo.industryIdentifiers) {
            let isbn13 = libro.volumeInfo.industryIdentifiers.find(identifier => identifier.type === "ISBN_13");
            if(isbn13) {
                isbn = isbn13.identifier;
            } else {
                let isbn10 = libro.volumeInfo.industryIdentifiers.find(identifier => identifier.type === "ISBN_10");
                
                if(isbn10) {
                    isbn = isbn10.identifier;
                } else {
                    isbn = "No disponible";
                    id = libro.id;      // Entonces se guarda el ID
                } 
            }
        } else {
            isbn = "No disponible";
            id = libro.id;      // Entonces se guarda el ID
        } 
        $(ficha).data("isbn", isbn);


        // Verifica cada campo:
        // Imagen: pone la imagen o una por defecto que está en los ficheros del proyecto
        let img_libro = $("<img>").addClass("portada_libro img_ficha");
        if (libro.volumeInfo.imageLinks && libro.volumeInfo.imageLinks.thumbnail) {
            img_libro.attr("src", libro.volumeInfo.imageLinks.thumbnail);
        } else {
            img_libro.attr("src", "../img/portada-vacia.png");
        }
        
        // Titulo: pone titulo o Desconocido
        //         máximo de caracteres por línea 30
        let tituloTEMP = libro.volumeInfo.title ? (libro.volumeInfo.title.length > 30 ? libro.volumeInfo.title.substring(0, 25) + "[...]" : libro.volumeInfo.title) : "Desconocido";
        let titulo = $("<p>").text(tituloTEMP);
        
        // Autor: pone autor o Desconocido
        //        máximo de caracteres por línea 30
        let autorTEMP = (libro.volumeInfo.authors && libro.volumeInfo.authors.length > 0) ? (libro.volumeInfo.authors[0].length > 30 ? libro.volumeInfo.authors[0].substring(0, 25) + "..." : libro.volumeInfo.authors[0]) : "Desconocido";;
        let autor = $("<p>").text(autorTEMP);

        // Div para los iconos
        var elementoDiv = $("<p class='icons'>");

        // Favoritos
        // Si está en favoritos: corazon rojo 
        let fav = "";
        if(comprobarLocalStorage(isbn, "favoritos")) {
            fav = $('<i class="fas fa-heart favorito rojo"></i>');
        } else {
            fav = $('<i class="fas fa-heart favorito blanco"></i>');
        }
        
        // Estanteria 
        let tengo = "";
        if(comprobarLocalStorage(isbn, "estanteria")) {
            tengo = $('<i class="fas fa-book estanteria rojo"></i>');
        } else {
            tengo = $('<i class="fas fa-book estanteria blanco"></i>');
        }
            
        // Wishlist
        let wish = "";
        if(comprobarLocalStorage(isbn, "wishlist")) {
            wish = $('<i class="fas fa-bookmark wishlist rojo"></i>');
        } else {
            wish = $('<i class="fas fa-bookmark wishlist blanco"></i>');
        }

        ficha.append(img_libro, titulo, autor, elementoDiv);
        listaBusqueda.append(ficha);
        elementoDiv.append(tengo, wish, fav);
    })
}

/* Funcion toggleFav(): usada para añadir/quitar libros de la lista de Favoritos del LocalStorage
 *                      recibe como parámetros el ID de libro y el icono que cambia de color al añadir/quitar
 */
function toggleFav(libroID, corazon) {
    // Lista de favoritos
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    // Busca el libro
    let indexLibro = favoritos.indexOf(libroID);

    // Si no está -> poner + corazon rojo
    if (indexLibro === -1) {
        favoritos.push(libroID);
        $(corazon).removeClass("blanco").addClass("rojo");
        console.log("Añadido a favoritos: " + libroID);
    } else {
        // Si ya está -> quitar + quitar corazon rojo
        favoritos.splice(indexLibro, 1);
        $(corazon).removeClass("rojo").addClass("blanco");
        console.log("Eliminado de favoritos: " + libroID);
    }
    // Actualizar LocalStorage
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

/* Funcion toggleWishlist(): usada para añadir/quitar libros de la lista de Wishlist del LocalStorage
 *                           recibe como parámetros el ID de libro y el icono que cambia de color al añadir/quitar
 */
function toggleWishlist(libroID, bandera) {
    // Lista de deseados
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    // Busca el libro
    let indexLibro = wishlist.indexOf(libroID);

    // Si no está -> poner + pintar bandera 
    if (indexLibro === -1) {
        wishlist.push(libroID);
        $(bandera).removeClass("blanco").addClass("rojo");
        console.log("Añadido a deseados: " + libroID);
    } else {
        // Si ya está -> quitar + quitar bandera 
        wishlist.splice(indexLibro, 1);
        $(bandera).removeClass("rojo").addClass("blanco");
        console.log("Eliminado de deseados: " + libroID);
    }
    // Actualizar LocalStorage
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

/* Funcion toggleEstanteria(): usada para añadir/quitar libros de la lista de Estanteria del LocalStorage
 *                             recibe como parámetros el ID de libro y el icono que cambia de color al añadir/quitar
 */
function toggleEstanteria(libroID, comprado) {
    // Lista de deseados
    let estanteria = JSON.parse(localStorage.getItem("estanteria")) || [];

    // Busca el libro
    let indexLibro = estanteria.indexOf(libroID);

    // Si no está -> poner + pintar comprado 
    if (indexLibro === -1) {
        estanteria.push(libroID);
        $(comprado).removeClass("blanco").addClass("rojo");
        console.log("Añadido a estanteria: " + libroID);
    } else {
        // Si ya está -> quitar + quitar comprado 
        estanteria.splice(indexLibro, 1);
        $(comprado).removeClass("rojo").addClass("blanco");
        console.log("Eliminado de estanteria: " + libroID);
    }
    // Actualizar LocalStorage
    localStorage.setItem("estanteria", JSON.stringify(estanteria));
}

/* Funcion comprobarLocalStorage: comprueba si un libro está en el LocalStorage
 *                                recibe como parámetros el id del libro y la lista en la que lo busca
 */
function comprobarLocalStorage(id, campo) {
    let comprobar = JSON.parse(localStorage.getItem(campo)) || [];
    return comprobar.includes(id);
}

/* Función mostrarFavoritos: muestra los libros guardados en favoritos del LocalStorage 
 *                           se llama cuando se abre favoritos.html
 *                           recibe como parámetro el contenedor en que se mostrarán los libros
 */
function mostrarFavoritos(contenedor) {
    // VARIABLES
    // Array de los favoritos (obtenido de localstorage)
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    // Contenedor de favoritos
    let contenedorFavoritos = $("#" + contenedor);

    // Primero se vacia siemrpe
    contenedorFavoritos.empty();

    // Llama al método que hace la consulta a la API y crea las fichas por cada libro
    consultaFicha(favoritos, contenedorFavoritos);
}

/* Función mostrarEstanteria: muestra los libros guardados en estanteria del LocalStorage 
 *                            se llama cuando se abre estanteria.html
 *                            recibe como parámetro el contenedor en que se mostrarán los libros
 */
function mostrarEstanteria(contenedor) {
    // VARIABLES
    // Array de los libros en estanteria (obtenido de localstorage)
    let estanteria = JSON.parse(localStorage.getItem("estanteria")) || [];
    // Contenedor de estanteria
    let contenedorEstanteria = $("#" + contenedor);

    // Primero se vacia siempre
    contenedorEstanteria.empty();

    // Llama al método que hace la consulta a la API y crea las fichas por cada libro
    consultaFicha(estanteria, contenedorEstanteria);
}

/* Función mostrarFavEstanteria: muestra los libros guardados en wishlist y estanteria del LocalStorage -> es posible que un libro sea favorito y no esté en la estantería
 *                               se llama al usar el filtro de la página estanteria
 *                               recibe como parámetro el contenedor en que se mostrarán los libros
 */
function mostrarFavEstanteria(contenedor) {
    // VARIABLES
    // Array de los libros en estanteria (obtenido de localstorage)
    let estanteria = JSON.parse(localStorage.getItem("estanteria")) || [];
    // Array de los libros en favoritos (obtenido de localstorage)
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    // Contenedor de estanteria
    let contenedorEstanteria = $("#" + contenedor);
    
    // Primero se vacia siempre
    contenedorEstanteria.empty();

    // Buscar solo los que estan en ambas listas
    let librosEnAmbos = favoritos.filter(libro => estanteria.includes(libro));
   
    // Llama al método que hace la consulta a la API y crea las fichas por cada libro
    consultaFicha(librosEnAmbos, contenedorEstanteria);
}


/* Función mostrarDeseados: muestra los libros guardados en wishlist del LocalStorage 
 *                          se llama cuando se abre deseados.html
 *                          recibe como parámetro el contenedor en que se mostrarán los libros
 */
function mostrarDeseados(contenedor) {
    // VARIABLES
    // Array de los libros de la wishlist (obtenido de localstorage)
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    // Contenedor de wishlist
    let contenedorWishlist = $("#" + contenedor);

    // Primero se vacia siemrpe
    contenedorWishlist.empty();

    // Llama al método que hace la consulta a la API y crea las fichas por cada libro
    consultaFicha(wishlist, contenedorWishlist);
}

/* Funcion mostrarFichasLibros: muestra los libros que sean en función de la página html en que se encuentre el usuario
 *                              recibe por parametro la página html, el contenedor en que mostrar las fichas, y el método correspondiente a esa página
 */
function mostrarFichasLibros(pagina, contenedor, mostrar) {
    // Si la pagina actual == página pasada por parametro
    if (window.location.pathname.endsWith(pagina)) {
        // Llamar a la función específica para mostrar los libros
        mostrar(contenedor);
    }
}

/* Funcion consultaFicha: aquí se hace una consulta a la API de Google Books realizando una solicitud AJAX
 *                        recibe por parametros el nombre del apartado del LocalStorage sobre el que busca y el nombre del contenedor del HTML en el que mostrará los resultados
 */
function consultaFicha(apartado, cont) {
    apartado.forEach(function(libroID) {

        $.ajax({
            url: "https://www.googleapis.com/books/v1/volumes?q=isbn:" + libroID,
            success: function(libro) {
                // Verificar si se encontró el libro
                if(libro && libro.items) {
                    let nuevo = libro.items[0].volumeInfo;      // Almacenarlo 

                    // FICHA DEL LIBRO
                    let ficha = $("<div>").addClass("ficha_libro");
                    $(ficha).data("isbn", libroID);
                        // Imagen
                        let img_libro = $("<img class='img_ficha' alt='portada'>").addClass("portada_libro");
                        if (nuevo.imageLinks && nuevo.imageLinks.thumbnail) {
                            img_libro.attr("src", nuevo.imageLinks.thumbnail);
                        } else {
                            img_libro.attr("src", "../img/portada-vacia.png");
                        }
                        // Titulo
                        let tituloTEMP = nuevo.title ? (nuevo.title.length > 30 ? nuevo.title.substring(0, 25) + "[...]" : nuevo.title) : "Desconocido";
                        let titulo = $("<p>").text(tituloTEMP);
                        // Autor
                        let autorTEMP = (nuevo.authors && nuevo.authors.length > 0) ? (nuevo.authors[0].length > 30 ? nuevo.authors[0].substring(0, 25) + "..." : nuevo.authors[0]) : "Desconocido";
                        let autor = $("<p>").text(autorTEMP);
                        // Div iconos
                        var elementoDiv = $("<p>").addClass("icons");
                            // Fav
                            let fav = "";
                            if (comprobarLocalStorage(libroID, "favoritos")) {
                                fav = $('<i class="fas fa-heart favorito rojo"></i>');
                            } else {
                                fav = $('<i class="fas fa-heart favorito blanco"></i>');
                            }
                            // Wishlist
                            let tengo = "";
                            if (comprobarLocalStorage(libroID, "estanteria")) {
                                tengo = $('<i class="fas fa-book estanteria rojo"></i>');
                            } else {
                                tengo = $('<i class="fas fa-book estanteria blanco"></i>');
                            }
                            // Estanteria
                            let wish = "";
                            if (comprobarLocalStorage(libroID, "wishlist")) {
                                wish = $('<i class="fas fa-bookmark wishlist rojo"></i>');
                            } else {
                                wish = $('<i class="fas fa-bookmark wishlist blanco"></i>');
                            }
                        // Append elementos al contenedor
                        ficha.append(img_libro, titulo, autor, elementoDiv);
                        cont.append(ficha);
                        elementoDiv.append(tengo, wish, fav);
                
                } else if(!libro.items) {
                    console.log("El libro no puede mostrarse");

                } else {
                    console.log("Libro no encontrado: ", libroID);
                }
            },
            error: function(error) {
                alert("Error al obtener información del libro:", error);
            }
        });
     });
}

/* Funcion buscar: función llamada desde la página Explorar cuando se hacen las búsquedas en la barra de búsqueda
 *                 hace una consulta a la API de Google Books realizando una solicitud AJAX
 *                 con los datos que devuelve la consulta se llama a la función mostrarBusqueda() que muestra las fichas con los libros
 */
function buscar() {
    var buscado = $("#barra_busqueda").val();   
    console.log(buscado);

    $.ajax({
        url: "https://www.googleapis.com/books/v1/volumes",
        data: { q: buscado },
        success: function(data) {
            mostrarBusqueda(data.items);
        },
        error: function(error) {
            alert("Error en la solicitud: " + error);
        }
    })
}


//////////////////// EVENTOS ////////////////////////
// --------- Página EXPLORA ---------
// Boton BUSCAR: evento de ratón
$("#boton_buscar").click(buscar);

// Boton BUSCAR: evento de teclado
$("#barra_busqueda").keypress(function() {
    // Si se pulsa enter
    if(event.which === 13){    
        buscar();
    }
});

// ---------- Páginas FAVORITOS, ESTANTERIA, WISHLIST -----------
// Botones CORAZON: favoritos
$(".container").on("click", ".favorito", function() {
    let libroID = $(this).closest(".ficha_libro").data("isbn");
    toggleFav(libroID, this);
})
// Botones BANDERA: wishlist, deseados
$(".container").on("click", ".wishlist", function() {
    let libroID = $(this).closest(".ficha_libro").data("isbn");
    toggleWishlist(libroID, this);
})
// Botones LIBRO: estanteria, comprados
$(".container").on("click", ".estanteria", function() {
    let libroID = $(this).closest(".ficha_libro").data("isbn");
    toggleEstanteria(libroID, this);
})

// ---------- Página de LIBRO -----------
// FICHA DE LIBRO: abrir la página del libro
$(".container").on("click", ".img_ficha", function() {
    // ISBN del libro
    let libroISBN = $(this).closest(".ficha_libro").data("isbn");

    // Abre el sitio enviando por URL el ISBN
    window.location.href =  "libro.html?isbn=" + libroISBN;
}) 

// FICHA DE LIBRO - Boton Corazon
$("#info_libro").on("click", ".favorito", function() {
    let libroID = $(this).closest(".pagina_libro").data("isbn");
    toggleFav(libroID, this);
});

// FICHA DE LIBRO - Boton Wishlist
$("#info_libro").on("click", ".wishlist", function() {
    let libroID = $(this).closest(".pagina_libro").data("isbn");
    toggleWishlist(libroID, this);
});

// FICHA DE LIBRO - Boton Estanteria
$("#info_libro").on("click", ".estanteria", function() {
    let libroID = $(this).closest(".pagina_libro").data("isbn");
    toggleEstanteria(libroID, this);
});


////////////////////// MAIN /////////////////////////
$(document).ready(function() {
    // ----------- Llamadas de página --------------
    // Página FAVORITOS
    // Llama a la función mostrarFavoritos() cuando se entra en esta página
    mostrarFichasLibros("favoritos.html", "favoritos", mostrarFavoritos);
    
    // Página ESTANTERIA
    // Llama a la función mostrarFavoritos() cuando se entra en esta página
    mostrarFichasLibros("estanteria.html", "estanteria", mostrarEstanteria);
    $("#filtroFav").click(function() {
        if ($(this).hasClass("activo")) {
            $(this).removeClass("activo");
            mostrarEstanteria("estanteria");
        } else {
            $(this).addClass("activo");
            mostrarFavEstanteria("estanteria");
        }
    })
    
    // Página DESEADOS
    // Llama a la función mostrarFavoritos() cuando se entra en esta página
    mostrarFichasLibros("deseados.html", "wishlist", mostrarDeseados);
});


$(document).ready(function() {
    // ----------- Página de libro concreto --------------
    // Cuando se llegue al sitio de un libro
    if (window.location.pathname.endsWith("libro.html")) {
        // Busca en la URL el ISBN pasado como parametro
        let urlParams = new URLSearchParams(window.location.search);
        let libroISBN = urlParams.get('isbn');

        // Contenedor: información del libro
        let cont_libro = $("#info_libro");

        // Hace la consulta a la API: obtiene toda la información de ese libro
        $.ajax({
            url: "https://www.googleapis.com/books/v1/volumes?q=isbn:" + libroISBN,
            success: function(data) {
                let libroInfo = data.items[0].volumeInfo;

                let ficha = $("<div>").addClass("pagina_libro");
                $(ficha).data("isbn", libroISBN);
                
                    // Div general
                    let generalDiv = $("<p>").addClass("general");
                        
                        // Imagen
                        let img_libro = $("<img class='img_ficha' alt='portada'>").addClass("portada_libro");
                        if (libroInfo.imageLinks && libroInfo.imageLinks.thumbnail) {
                            img_libro.attr("src", libroInfo.imageLinks.thumbnail);
                        } else {
                            img_libro.attr("src", "../img/portada-vacia.png");
                        }
                        
                        // Div de los datos
                        let generalTextoDiv = $("<div>").addClass("general_texto");

                        // Titulo 
                        let tituloTEMP = libroInfo.title;
                        let titulo = $("<p>").text(tituloTEMP).addClass("titulo_libro");

                        // Autor
                        let autorTEMP = (libroInfo.authors && libroInfo.authors.length > 0) ? libroInfo.authors.join(", ") : "Desconocido";
                        let autor = $("<p>").text(autorTEMP);
                        
                        // Año
                        let fechaTEMP = libroInfo.publishedDate ? libroInfo.publishedDate.substring(0, 4) : "Desconocido";
                        let fecha = $("<p>").text(fechaTEMP);

                        // Editorial
                        let editorialTEMP = libroInfo.publisher ? libroInfo.publisher : "Desconocido";
                        let editorial = $("<p>").text(editorialTEMP);
                        
                        // Append
                        generalTextoDiv.append(titulo, autor, fecha, editorial);
                        generalDiv.append(img_libro, generalTextoDiv);
                        

                    // Div sinopsis
                    let sinopsisDiv = $("<p>").addClass("sinopsis");
                    let descripcionTEMP = libroInfo.description ? libroInfo.description : "Descripción no disponible";
                    let descripcion = $("<p>").text(descripcionTEMP);
                    sinopsisDiv.append(descripcion);

                    // Div iconos
                    let iconosDiv = $("<p>").addClass("icons");
                        // Fav
                        let fav = "";
                        if (comprobarLocalStorage(libroISBN, "favoritos")) {
                            fav = $('<i class="fas fa-heart favorito rojo"></i>');
                        } else {
                            fav = $('<i class="fas fa-heart favorito blanco"></i>');
                        }
                        // Wishlist
                        let tengo = "";
                        if (comprobarLocalStorage(libroISBN, "estanteria")) {
                            tengo = $('<i class="fas fa-book estanteria rojo"></i>');
                        } else {
                            tengo = $('<i class="fas fa-book estanteria blanco"></i>');
                        }
                        // Estanteria
                        let wish = "";
                        if (comprobarLocalStorage(libroISBN, "wishlist")) {
                            wish = $('<i class="fas fa-bookmark wishlist rojo"></i>');
                        } else {
                            wish = $('<i class="fas fa-bookmark wishlist blanco"></i>');
                        }
                    iconosDiv.append(tengo, wish, fav);

                    // Append elementos al contenedor
                    ficha.append(generalDiv, sinopsisDiv, iconosDiv);
                    cont_libro.append(ficha);
            },
            error: function(error) {
                console.log("Error en la solicitud: " + error);
            }
        });
    }
});