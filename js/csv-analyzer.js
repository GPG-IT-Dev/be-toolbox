document.addEventListener('DOMContentLoaded', () => {
    const zoneDepot = document.getElementById('drop-area');
    const fichierElem = document.getElementById('fileElem');
    const tableauCSV = document.getElementById('csv-table').getElementsByTagName('tbody')[0];
    const sommeCubageElem = document.getElementById('sum-cubage');
    const sommePoidsElem = document.getElementById('sum-poids');
    const categorieCubageElem = document.getElementById('category-cubage');
    const bandeauSucces = document.createElement('div');

    // Ajouter un bandeau de notification de copie réussi
    bandeauSucces.id = 'bandeau-succes';
    bandeauSucces.style.position = 'fixed';
    bandeauSucces.style.top = '20px';
    bandeauSucces.style.left = '50%';
    bandeauSucces.style.transform = 'translateX(-50%)';
    bandeauSucces.style.padding = '10px 20px';
    bandeauSucces.style.backgroundColor = '#38a169';
    bandeauSucces.style.color = '#fff';
    bandeauSucces.style.borderRadius = '5px';
    bandeauSucces.style.display = 'none';
    bandeauSucces.style.zIndex = '1000';
    document.body.appendChild(bandeauSucces);

    // Gestion du drag and drop
    zoneDepot.addEventListener('dragover', (event) => {
        event.preventDefault();
        zoneDepot.classList.add('highlight');
    });

    zoneDepot.addEventListener('dragleave', () => {
        zoneDepot.classList.remove('highlight');
    });

    zoneDepot.addEventListener('drop', (event) => {
        event.preventDefault();
        zoneDepot.classList.remove('highlight');
        const fichiers = event.dataTransfer.files;
        if (fichiers.length) {
            gererFichiers(fichiers);
        }
    });

    fichierElem.addEventListener('change', (event) => {
        gererFichiers(event.target.files);
    });

    function gererFichiers(fichiers) {
        const fichier = fichiers[0];
        if (fichier && fichier.type === 'text/csv') {
            const lecteur = new FileReader();
            lecteur.onload = (event) => {
                const donneesCSV = event.target.result;
                try {
                    parserCSV(donneesCSV);
                } catch (error) {
                    alert('Erreur lors du parsing du fichier CSV');
                    console.error(error);
                }
            };
            lecteur.readAsText(fichier);
        } else {
            alert('Veuillez télécharger un fichier CSV valide.');
        }
    }

    function parserCSV(donnees) {
        const lignes = donnees.split('\n').filter(ligne => ligne.trim() !== '');
        if (lignes.length === 0) {
            alert('Le fichier CSV est vide ou mal formaté.');
            return;
        }
        const enTetes = lignes[0].split(',');
        const donneesCSV = lignes.slice(1).map(ligne => ligne.split(','));

        afficherDonneesCSV(enTetes, donneesCSV);
        calculerSommes(donneesCSV);
    }

    function afficherDonneesCSV(enTetes, donnees) {
        tableauCSV.innerHTML = '';
        donnees.forEach(ligne => {
            if (ligne.length < 3) return;
            const tr = document.createElement('tr');
            ligne.forEach(cellule => {
                const td = document.createElement('td');
                td.textContent = cellule;
                tr.appendChild(td);
            });
            tableauCSV.appendChild(tr);
        });
    }

    function calculerSommes(donnees) {
        const sommes = {};
        donnees.forEach(ligne => {
            if (ligne.length < 11) return;
            const cubage = parseFloat(ligne[10]) || 0;
            const categorie = (ligne[2] || '').toLowerCase().replace(/\d+$/, "");
            if (!sommes[categorie]) {
                sommes[categorie] = { cubage: 0 };
            }
            sommes[categorie].cubage += cubage;
        });

        let totalCubage = Object.values(sommes).reduce((acc, s) => acc + s.cubage, 0);
        sommeCubageElem.textContent = `Somme de CUBAGE: ${totalCubage.toFixed(2)} m³`;
        afficherSommesCategories(sommes);
    }

    function afficherSommesCategories(sommes) {
        categorieCubageElem.innerHTML = '';

        const cubages = [];
        for (const categorie in sommes) {
            const cubageElem = `Cubage ${categorie}: ${sommes[categorie].cubage.toFixed(2)} m³`;
            cubages.push(cubageElem);
        }

        categorieCubageElem.innerHTML = cubages.join('<br>');
    }

    // Copier le cubage par catégorie
    document.getElementById('copy-category-cubage').addEventListener('click', () => {
        const cubageText = document.getElementById('category-cubage').innerText;
        navigator.clipboard.writeText(cubageText).then(() => {
            afficherNotificationSucces('Cubage par catégorie copié avec succès !');
        });
    });

    // Télécharger le cubage par catégorie
    document.getElementById('download-category-cubage').addEventListener('click', () => {
        const categoryCubageText = document.getElementById('category-cubage').innerText;
        const blob = new Blob([categoryCubageText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cubage_par_catégorie.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    function afficherNotificationSucces(message) {
        bandeauSucces.textContent = message;
        bandeauSucces.style.display = 'block';
        setTimeout(() => {
            bandeauSucces.style.display = 'none';
        }, 2000);
    }
});
