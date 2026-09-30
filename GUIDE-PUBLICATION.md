# Guide de publication : Rapido Express CI (livraison et location)

Document interne, non mis en ligne (voir `.vercelignore`). À suivre dans l'ordre.

## 1. Publier sur Vercel
**En ligne de commande**
1. Ouvrir un terminal dans ce dossier.
2. Installer l'outil une seule fois : `npm i -g vercel` puis `vercel login`
3. Publier : `vercel --prod`
4. Framework : **Other**. Dossier de sortie : `.`

**Sans ligne de commande** : vercel.com > *Add New* > *Project*, importer le dossier, framework **Other**, pas de commande de build.

## 2. Vérifier le site en ligne
- [ ] Les 7 pages s'ouvrent : accueil, livraison, location, suivi, commander, contact, confidentialité.
- [ ] Navigation privée : accessible **sans connexion** (sinon *Settings* > *Deployment Protection*, désactiver).
- [ ] **Accueil** : les onglets « Voir le prix » et « Suivre un colis » basculent, « Voir le prix » ouvre la page Livraison avec le trajet.
- [ ] **Calculateur** (Livraison) : communes, type de colis et type de livraison changent le prix, le véhicule, la distance et le délai. Exemple : Cocody vers Plateau, petit colis, standard = dès 3 400 FCFA. Plus de 200 kg renvoie vers un devis.
- [ ] **Commander** : 3 étapes (colis, adresses, confirmation), prix à droite, numéro de suivi `RX-2026-xxxx` à la fin, lien vers le suivi.
- [ ] **Suivi** : `RX-240001` (en route) et `RX-240002` (livré) fonctionnent, un numéro faux affiche une erreur. Une commande passée sur ce navigateur avance toute seule (une étape toutes les 20 s).
- [ ] **Location** : les filtres (type, places, chauffeur) et les dates recalculent le total par véhicule, « Réserver » ouvre le formulaire avec le récapitulatif et donne une référence `LC-2026-xxxx`.
- [ ] Mobile (390 px) : le menu s'ouvre, les boutons « Appeler » et « WhatsApp » restent visibles, rien ne dépasse. Console (F12) : aucune erreur.
- [ ] Signature « Code AZ » en bas de page renvoie vers https://agnissanisaac.com

## 3. Envoyer le lien pour le portfolio
- **Secteurs** : `Transport & livraison` et `Location de véhicules`
- **Tag** : `Transport · Livraison · Location`
- **categoryLabel** : Site de livraison et location de véhicules
- **pitch** : Un site de livraison et de location de véhicules à Abidjan : calculateur de prix, suivi de colis et réservation.
- **tech** : HTML5 / CSS3, JavaScript (calculateur, suivi, réservation), Responsive design

## 4. Mentions à ne pas retirer
- **Crédits photos** (page Confidentialité, lien en pied de page) : la plupart sont en CC BY ou CC BY-SA et **exigent** de citer l'auteur. Liste complète : `_build/credits.md`.
- Les photos sont **illustratives** : les motards viennent d'Afrique de l'Est (pas d'Abidjan), la ville est Abidjan. Les véhicules sont des illustrations dessinées.
- Les prix sont « à partir de » et les délais « indicatifs » : **aucun délai n'est garanti à la minute**. Ne jamais retirer ces précisions.
- Aucune vraie plaque ni vrai numéro de suivi : les numéros `RX-240001` et `RX-240002` sont fictifs.
- « Entreprise, tarifs, suivis et véhicules fictifs » en pied de page : à garder tant que ce n'est pas un vrai client.
- Signature Code AZ : à garder.

## 5. Si une vraie entreprise veut ce site
1. **Tarifs** : communes, distances, tarifs de base et au km, majorations Express et Programmée dans `_build/build.js` (en haut : `communes`, `vrate`, `dtypes`). Les distances sont schématiques (à vol d'oiseau +30 %) : pour des prix exacts, utiliser une grille réelle commune par commune.
2. **Véhicules de location** : tableau `cars` dans `_build/build.js` (prix, places, chauffeur). Remplacer les illustrations par de vraies photos de la flotte.
3. **Suivi réel** : le suivi est simulé. Un vrai suivi demande un serveur et une base de données (ou un outil de gestion de livraisons) alimentés par les livreurs. Le site actuel est statique.
4. **Commandes et réservations** : simulées. Brancher sur un vrai canal (WhatsApp Business, e-mail, outil de dispatch) dans `js/main.js`. Pour un paiement en ligne (Mobile Money), passer par un agrégateur de paiement et un petit serveur.
5. **Coordonnées** : remplacer `PHONE`, `WA` et l'adresse dans `_build/build.js`.
6. **Conditions** : ajouter conditions générales (responsabilité en cas de perte ou de casse, colis interdits), assurance éventuelle et mentions légales.
7. **Données de livraison** : les numéros de téléphone d'un destinataire sont des données personnelles : vérifier la page Confidentialité avec le client.

## 6. Modifier le site soi-même
- Pages, tarifs, véhicules, textes : `_build/build.js` (puis `node _build/build.js`).
- Calculateur, commande, suivi, location : `js/main.js`.
- Couleurs et styles : `css/style.css` (variables en haut du fichier).
- Images : dossier `img/`. Les originaux lourds sont dans `_raw/` (non publiés).
- Ouvrir en local : fonctionne avec Live Server (liens en `.html`).

## 7. Exclus de la mise en ligne
`_build`, `_raw`, `.claude`, ce guide et l'image modèle (`model.jpg`) sont listés dans `.vercelignore`.
