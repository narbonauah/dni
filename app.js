// Obtener elementos del DOM
let pdfInput = document.getElementById('pdfInput');
const watermarkDate = document.getElementById('watermarkDate');
const documentPurpose = document.getElementById('documentPurpose');
const applyWatermark = document.getElementById('applyWatermark');
const resetButton = document.getElementById('resetButton');
const downloadLink = document.getElementById('downloadLink');

// FunciÃ³n para cargar el PDF y aplicar la marca de agua
applyWatermark.addEventListener('click', async function() {
    let date = watermarkDate.value;  // Obtiene la fecha en formato "aaaa-mm-dd"
    const purpose = documentPurpose.value;
    
      if (!purpose || !date ) {
        alert("Debes completar los campos de fecha y propÃ³sito.");
        return;
    }

    // Verifica si el propÃ³sito excede el lÃ­mite de caracteres
    if (purpose.length > 50) { // Verifica si supera el lÃ­mite
        alert("El propÃ³sito no puede exceder los 100 caracteres.");
        return;
    }

    // Convertir la fecha a "dÃ­a/mes/aÃ±o"
    const [year, month, day] = date.split('-');  // Dividir la fecha en partes
    date = `${day}/${month}/${year}`;  // Reorganizar la fecha en "dÃ­a/mes/aÃ±o"

    // Convertir a minÃºsculas el texto de la marca de agua
    const watermarkText = `Válido para ${purpose} - ${date}`.toLowerCase();

    // Obtener el archivo PDF del input
    const file = pdfInput.files[0];
    if (!file) {
        alert("Por favor, selecciona un archivo PDF.");
        return;
    }

    const reader = new FileReader();

    reader.onload = async function(e) {
        const arrayBuffer = e.target.result;

        // Cargar el PDF usando pdf-lib
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

        const pages = pdfDoc.getPages();
        const fontSize = 14;  // TamaÃ±o de letra mÃ¡s pequeÃ±o
        const opacity = 0.09;  // Menos opaco para que no distraiga
        const textWidth = watermarkText.length * fontSize * 0.44; // AproximaciÃ³n del ancho del texto
        const textHeight = fontSize; // Altura del texto
        const stepX = textWidth + 20;  // Espaciado horizontal entre textos
        const stepY = textHeight + 20; // Espaciado vertical entre textos

        pages.forEach(page => {
            const { width, height } = page.getSize();

            // AÃ±adir la marca de agua repetida en diagonal, cubriendo toda la pÃ¡gina
            for (let y = -stepY; y < height + stepY; y += stepY) {
                for (let x = -stepX; x < width + stepX; x += stepX) {
                    page.drawText(watermarkText, {
                        x: x,
                        y: y,
                        size: fontSize,
                        opacity: opacity,
                    });
                }
            }
        });

        // Guardar el PDF modificado
        const pdfBytes = await pdfDoc.save();

        // Crear un enlace de descarga
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.style.display = 'inline-block';
    };

    reader.readAsArrayBuffer(file);
});

// Limpiar el formulario sin recargar la pÃ¡gina
resetButton.addEventListener('click', function() {
    // Limpiar el campo de archivo
    const newInput = document.createElement('input');
    newInput.type = 'file';
    newInput.id = 'pdfInput';
    newInput.accept = 'application/pdf';
    pdfInput.replaceWith(newInput);
    
    // Actualizar la referencia de 'pdfInput' para que apunte al nuevo input
    pdfInput = document.getElementById('pdfInput');
    
    // Limpiar los campos de fecha y propÃ³sito
    watermarkDate.value = '';
    documentPurpose.value = '';
    
    // Ocultar el enlace de descarga
    downloadLink.style.display = 'none';
    downloadLink.href = '#';
});
