document.addEventListener('DOMContentLoaded', function() {
    // Import the JsBarcode library
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js';
    document.head.appendChild(script);

    script.onload = function() {
        // Add event listener to the generate button
        const generateBtn = document.getElementById('generate-btn');
        generateBtn.addEventListener('click', function() {
            const textInput = document.getElementById('text-input').value.trim();
            const canvas = document.getElementById('barcode');

            if (textInput === '') {
                alert('Veuillez entrer des données pour générer un code barre.');
                return;
            }

            // Generate the barcode
            JsBarcode(canvas, textInput, {
                format: 'CODE128',
                lineColor: '#000',
                width: 2,
                height: 100,
                displayValue: true,
                fontOptions: 'bold',
                margin: 10
            });
            canvas.style.display = 'block'; // Ensure the barcode is visible

            // Automatically copy the barcode to the clipboard
            canvas.toBlob(function(blob) {
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]).then(() => {
                    // Display success message
                    showSuccessMessage('Code barre copié avec succès !');
                }).catch(err => {
                    console.error('Erreur lors de la copie du code barre :', err);
                });
            });
        });
    };

    // Function to show a success message
    function showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.textContent = message;
        successMessage.style.position = 'fixed';
        successMessage.style.top = '20px';
        successMessage.style.left = '50%';
        successMessage.style.transform = 'translateX(-50%)';
        successMessage.style.padding = '10px 20px';
        successMessage.style.backgroundColor = '#38a169';
        successMessage.style.color = '#fff';
        successMessage.style.borderRadius = '5px';
        successMessage.style.zIndex = '1000';
        document.body.appendChild(successMessage);
        setTimeout(() => {
            successMessage.remove();
        }, 2000);
    }
});