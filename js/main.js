document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('#sidebar ul li a');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetPage = link.getAttribute('href');
            window.location.href = targetPage;
        });
    });

    // Function to load partials
    function loadPartial(partial, elementId) {
        fetch(partial)
            .then(response => response.text())
            .then(data => {
                document.getElementById(elementId).innerHTML = data;
            })
            .catch(error => console.error('Error loading partial:', error));
    }

    // Load header, menu, and footer
    loadPartial('partials/header.html', 'header');
    loadPartial('partials/menu.html', 'menu');
    loadPartial('partials/footer.html', 'footer');
});
