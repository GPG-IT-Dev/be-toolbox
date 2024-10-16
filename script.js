document.addEventListener('DOMContentLoaded', () => {
    const zoneDepot = document.getElementById('drop-area');
    const fichierElem = document.getElementById('fileElem');
    const tableauCSV = document.getElementById('csv-table').getElementsByTagName('tbody')[0];
    const sommeCubageElem = document.getElementById('sum-cubage');
    const sommePoidsElem = document.getElementById('sum-poids');
    const categorieCubageElem = document.getElementById('category-cubage');
    const categoriePoidsElem = document.getElementById('category-poids');
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

    const categories = {
        "Accessoire": ["PIECU", "ACC"],
        "Banc": ["BAN", "BAN"],
        "Cendrier": ["CEN", "CEN"],
        "Colonne": ["CLN", "CLN"],
        "Columbarium": ["COL", "COL"],
        "Dallage": ["DAL", "DAL"],
        "Dalle Cavurne": ["CAV", "CAV"],
        "Entourage": ["ENT", "ENT"],
        "Monument / cinéraire": ["SBS", "SRBS", "TOMB", "STELE", "COFINT", "COF", "SOCLE", "SBS", "SRBS", "TOMBALE", "STELE", "COFINT", "COFFRET", "SOCLE"],
        "Pièce": ["PIE", "PIECE"],
        "Plinthe / Placage": ["PLT", "PLINTHES"],
        "Pupitre": ["PUP", "PUP"],
        "Registre": ["REG", "REG"],
        "Semelle": ["SEM", "SEMELLE"],
        "Stèle du Souvenir": ["STS", "STS"],
        "Table": ["TAB", "TAB"]
    };

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
                parserCSV(donneesCSV);
            };
            lecteur.readAsText(fichier);
        } else {
            alert('Veuillez télécharger un fichier CSV valide.');
        }
    }

    function parserCSV(donnees) {
        const lignes = donnees.split('\n');
        const enTetes = lignes[0].split(',');
        const donneesCSV = lignes.slice(1).map(ligne => ligne.split(','));

        afficherDonneesCSV(enTetes, donneesCSV);
        calculerSommes(donneesCSV);
    }

    function afficherDonneesCSV(enTetes, donnees) {
        tableauCSV.innerHTML = '';
        donnees.forEach(ligne => {
            const tr = document.createElement('tr');
            ligne.forEach(cellule => {
                const td = document.createElement('td');
                td.textContent = cellule;
                tr.appendChild(td);
            });
            appliquerColoration(tr, ligne[2]);
            tableauCSV.appendChild(tr);
        });
    }

    function appliquerColoration(ligne, categorie) {
        for (const cat in categories) {
            if (categories[cat].includes(categorie)) {
                ligne.classList.add(`categorie-${cat.replace(/\s+/g, '-').toLowerCase()}`);
                break;
            }
        }
    }

    function calculerSommes(donnees) {
        const sommes = {};

        donnees.forEach(ligne => {
            const groupe = ligne[2];
            const cubage = parseFloat(ligne[10]) || 0;
            const poids = parseFloat(ligne[9]) || 0;

            for (const categorie in categories) {
                if (categories[categorie].includes(groupe)) {
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

    // Copy to clipboard functionality with success animation
    function afficherNotificationSucces(message) {
        bandeauSucces.textContent = message;
        bandeauSucces.style.display = 'block';
        setTimeout(() => {
            bandeauSucces.style.display = 'none';
        }, 2000);
    }

    document.getElementById('copy-cubage').addEventListener('click', () => {
        const cubageText = document.getElementById('category-cubage').innerText;
        navigator.clipboard.writeText(cubageText).then(() => {
            afficherNotificationSucces('Cubage copié avec succès !');
        });
    });

    document.getElementById('copy-poids').addEventListener('click', () => {
        const poidsText = document.getElementById('category-poids').innerText;
        navigator.clipboard.writeText(poidsText).then(() => {
            afficherNotificationSucces('Poids copié avec succès !');
        });
    });
});