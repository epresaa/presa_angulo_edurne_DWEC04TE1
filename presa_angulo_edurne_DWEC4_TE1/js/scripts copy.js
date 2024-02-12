'use-strict'

//////////////////// JQUERY //////////////////////
$( document ).ready(function() {
    console.log( "JQuery cargado" );



// --------------- FUNCIONES --------------------
/* 
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
        
        // En mi estanteria 
        let tengo = "";
        if(comprobarLocalStorage(isbn, "estanteria")) {
            tengo = $('<i class="fas fa-book estanteria rojo"></i>');
        } else {
            tengo = $('<i class="fas fa-book estanteria blanco"></i>');
        }
            
        // En mi wishlist
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

/*
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

/*
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

/*
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

/*
    */
function comprobarLocalStorage(id, campo) {
    let comprobar = JSON.parse(localStorage.getItem(campo)) || [];
    return comprobar.includes(id);
}

/*
    */
// Página de Favoritos
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

/*
    */
// Página de Estanteria
function mostrarEstanteria(contenedor) {
    // VARIABLES
    // Array de los libros en estanteria (obtenido de localstorage)
    let estanteria = JSON.parse(localStorage.getItem("estanteria")) || [];
    // Contenedor de estanteria
    let contenedorEstanteria = $("#" + contenedor);

    // Primero se vacia siemrpe
    contenedorEstanteria.empty();

    // Llama al método que hace la consulta a la API y crea las fichas por cada libro
    consultaFicha(estanteria, contenedorEstanteria);
}

/*
 */
// Página de Deseados
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

/*
    */
function mostrarFichasLibros(pagina, contenedor, mostrar) {
    // Si la pagina actual == página pasada por parametro
    if (window.location.pathname.endsWith(pagina)) {
        // Llamar a la función específica para mostrar los libros
        mostrar(contenedor);
    }
}

/*
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

/*
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


// --------------- EVENTOS --------------------
// Boton BUSCAR RATON - EXPLORA
$("#boton_buscar").click(buscar);

// Boton BUSCAR TECLADO - EXPLORA
$("#barra_busqueda").keypress(function() {
    // Si se pulsa enter
    if(event.which === 13){    
        buscar();
    }
});

// Botones CORAZON - FAVORITOS
$(".container").on("click", ".favorito", function() {
    let libroID = $(this).closest(".ficha_libro").data("isbn");
    toggleFav(libroID, this);
})
// Botones BANDERA - WISHLIST - DESEADOS
$(".container").on("click", ".wishlist", function() {
    let libroID = $(this).closest(".ficha_libro").data("isbn");
    toggleWishlist(libroID, this);
})
// Botones LIBRO - ESTANTERIA - COMPRADOS
$(".container").on("click", ".estanteria", function() {
    let libroID = $(this).closest(".ficha_libro").data("isbn");
    toggleEstanteria(libroID, this);
})

// FICHA DE LIBRO - PAGINA DE LIBRO
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


// ------------------- MAIN -----------------------
// Páginas con código en común
$(document).ready(function() {
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
            mostrarFavoritos("estanteria");
        }
    })
    
    // Página DESEADOS
    // Llama a la función mostrarFavoritos() cuando se entra en esta página
    mostrarFichasLibros("deseados.html", "wishlist", mostrarDeseados);

});

// Página de Libro concreto
$(document).ready(function() {
    // Cuando se llegue al sitio de un libro
    if (window.location.pathname.endsWith("libro.html")) {
        // Busca en la URL el ISBN pasado como parametro
        let urlParams = new URLSearchParams(window.location.search);
        let libroISBN = urlParams.get('isbn');

        // Contenedor: información del libro
        let cont_libro = $("#info_libro");

        // Hace la consulta a la API
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






});