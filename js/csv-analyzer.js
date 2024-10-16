document.addEventListener('DOMContentLoaded', () => {
    const zoneDepot = document.getElementById('drop-area');
    const fichierElem = document.getElementById('fileElem');
    const tableauCSV = document.getElementById('csv-table').getElementsByTagName('tbody')[0];
    const sommeCubageElem = document.getElementById('sum-cubage');
    const sommePoidsElem = document.getElementById('sum-poids');
    const categorieCubageElem = document.getElementById('category-cubage');
    const categoriePoidsElem = document.getElementById('category-poids');
    const bandeauSucces = document.createElement('div');

    // Définir la variable categories
    const categories = {
        "Accessoire": ["piec", "acc"],
        "Banc": ["ban"],
        "Cendrier": ["cen"],
        "Colonne": ["cln"],
        "Columbarium": ["col"],
        "Dallage": ["dal"],
        "Dalle Cavurne": ["cav"],
        "Entourage": ["ent"],
        "Monument / cinéraire": ["sbs", "srbs", "tomb", "stele", "cofint", "cof", "socle", "tombale", "coffret"],
        "Pièce": ["pie", "piece"],
        "Plinthe / Placage": ["plt", "plinthes"],
        "Pupitre": ["pup"],
        "Registre": ["reg"],
        "Semelle": ["sem", "semelle"],
        "Stèle du Souvenir": ["sts"],
        "Table": ["tab"]
    };

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
            appliquerColoration(tr, ligne[2] || '');
            tableauCSV.appendChild(tr);
        });
    }

    function appliquerColoration(ligne, categorie) {
        if (!categorie) return;
        const categorieNormalisee = categorie.toLowerCase().replace(/\d+$/, ""); // Convertir en minuscule et retirer les chiffres à la fin
        for (const cat in categories) {
            if (categories[cat].some(code => categorieNormalisee.startsWith(code))) {
                ligne.classList.add(`categorie-${cat.replace(/\s+/g, '-').toLowerCase()}`);
                break;
            }
        }
    }

    function calculerSommes(donnees) {
        const sommes = {};

        donnees.forEach(ligne => {
            if (ligne.length < 11) return;
            const groupe = (ligne[2] || '').toLowerCase().replace(/\d+$/, ""); // Convertir en minuscule et retirer les chiffres à la fin
            const cubage = parseFloat(ligne[10]) || 0;
            const poids = parseFloat(ligne[9]) || 0;

            for (const categorie in categories) {
                if (categories[categorie].some(code => groupe.startsWith(code))) {
                    if (!sommes[categorie]) {
                        sommes[categorie] = { cubage: 0, poids: 0 };
                    }
                    sommes[categorie].cubage += cubage;
                    sommes[categorie].poids += poids;
                    break;
                }
            }
        });

        let totalCubage = Object.values(sommes).reduce((acc, s) => acc + s.cubage, 0);
        let totalPoids = Object.values(sommes).reduce((acc, s) => acc + s.poids, 0);

        sommeCubageElem.textContent = `Somme de CUBAGE: ${totalCubage.toFixed(2)} m³`;
        sommePoidsElem.textContent = `Somme de POIDS: ${totalPoids.toFixed(2)} kg`;

        afficherSommesCategories(sommes);
    }

    function afficherSommesCategories(sommes) {
        categorieCubageElem.innerHTML = '';
        categoriePoidsElem.innerHTML = '';

        const cubages = [];
        const poids = [];

        for (const categorie in sommes) {
            const cubageElem = `Cubage ${categorie}: ${sommes[categorie].cubage.toFixed(2)} m³`;
            cubages.push(cubageElem);

            const poidsElem = `Poids ${categorie}: ${sommes[categorie].poids.toFixed(2)} kg`;
            poids.push(poidsElem);
        }

        categorieCubageElem.innerHTML = cubages.join('<br>');
        categoriePoidsElem.innerHTML = poids.join('<br>');
    }

    // Actions pour les boutons de téléchargement
    document.getElementById('download-summary').addEventListener('click', () => {
        const cubageText = document.getElementById('sum-cubage').innerText;
        const poidsText = document.getElementById('sum-poids').innerText;
        
        const content = `${cubageText}\n${poidsText}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'résumé_sommes.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('download-cubage').addEventListener('click', () => {
        const cubageText = document.getElementById('sum-cubage').innerText;
        
        const blob = new Blob([cubageText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cubage.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('download-poids').addEventListener('click', () => {
        const poidsText = document.getElementById('sum-poids').innerText;
        
        const blob = new Blob([poidsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'poids.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('download-category-summary').addEventListener('click', () => {
        const categoryCubageText = document.getElementById('category-cubage').innerText;
        const categoryPoidsText = document.getElementById('category-poids').innerText;
        
        const content = `${categoryCubageText}\n${categoryPoidsText}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'résumé_par_catégorie.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

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

    document.getElementById('download-category-poids').addEventListener('click', () => {
        const categoryPoidsText = document.getElementById('category-poids').innerText;
        
        const blob = new Blob([categoryPoidsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'poids_par_catégorie.txt';
        a.click();
        URL.revokeObjectURL(url);
    });
});
