// Génère les pages HTML statiques et js/data.js : node _build/build.js
const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, '..');

const SITE = 'Rapido Express CI';
const CODE_AZ_URL = 'https://agnissanisaac.com';
const PHONE = '+225 27 20 30 40 50';
const WA = 'https://wa.me/2250700000000';
const fmt = n => Math.round(n).toLocaleString('fr-FR').replace(/[  ]/g, ' ');

// ---- Données tarifaires (démonstration)
const communes = [
  ['Plateau', 0, 0], ['Adjamé', -2, 3], ['Treichville', 1, -3], ['Marcory', 3, -4], ['Koumassi', 6, -3],
  ['Port-Bouët', 7, -7], ['Cocody', 4, 4], ['Bingerville', 11, 8], ['Yopougon', -9, 2], ['Abobo', -2, 10],
];
const pkgs = [
  { id: 'doc', label: 'Document ou enveloppe (jusqu’à 2 kg)', v: 'moto' },
  { id: 'petit', label: 'Petit colis (2 à 10 kg)', v: 'moto' },
  { id: 'moyen', label: 'Colis moyen (10 à 40 kg)', v: 'tricycle' },
  { id: 'gros', label: 'Gros colis (40 à 200 kg)', v: 'camionnette' },
  { id: 'lourd', label: 'Plus de 200 kg (sur devis)', v: null },
];
const vrate = { moto: { base: 1500, km: 250, name: 'Moto coursier' }, tricycle: { base: 3500, km: 400, name: 'Tricycle cargo' }, camionnette: { base: 8000, km: 700, name: 'Camionnette' } };
const dtypes = { standard: { label: 'Standard', mult: 1, d: [20, 4], desc: 'Collecte sous 30 min, livraison directe' }, express: { label: 'Express', mult: 1.4, d: [15, 3], desc: 'Livreur dédié, priorité sur la course' }, programmee: { label: 'Programmée', mult: 0.9, d: [0, 0], desc: 'Vous choisissez le jour et le créneau' } };
const km = (a, b) => { const A = communes.find(c => c[0] === a), B = communes.find(c => c[0] === b); return Math.max(1.5, Math.hypot(A[1] - B[1], A[2] - B[2]) * 1.3); };
const priceFor = (k, v, t) => Math.max(1500, Math.ceil(((vrate[v].base + k * vrate[v].km) * dtypes[t].mult) / 100) * 100);
const dur = m => { m = Math.round(m); const h = Math.floor(m / 60), r = m % 60; return h ? `${h} h${r ? ' ' + String(r).padStart(2, '0') : ''}` : `${m} min`; };

const cars = [
  { id: 'moto', kind: 'moto', name: 'Moto 125 cc', type: 'moto', places: 1, price: 25000, chauffeur: 'sans', feats: ['Casque fourni', 'Idéale pour les tournées de livraison', 'Plein non inclus'] },
  { id: 'tricycle', kind: 'tricycle', name: 'Tricycle cargo', type: 'moto', places: 1, price: 35000, chauffeur: 'both', feats: ['Plateau de 1,5 m³', 'Charge utile 400 kg', 'Avec ou sans chauffeur'] },
  { id: 'berline-eco', kind: 'berline', name: 'Berline économique', type: 'voiture', places: 5, price: 30000, chauffeur: 'both', feats: ['Climatisation', 'Boîte manuelle', 'Faible consommation'] },
  { id: 'berline-confort', kind: 'berline', name: 'Berline confort', type: 'voiture', places: 5, price: 40000, chauffeur: 'both', feats: ['Climatisation', 'Boîte automatique', 'Grand coffre'] },
  { id: 'suv-compact', kind: 'suv', name: 'SUV compact', type: 'voiture', places: 5, price: 55000, chauffeur: 'both', feats: ['Garde au sol élevée', 'Climatisation', 'Bluetooth'] },
  { id: 'suv-7', kind: 'suv7', name: 'SUV 7 places', type: 'voiture', places: 7, price: 75000, chauffeur: 'both', feats: ['7 places', 'Climatisation trois zones', 'Grand coffre'] },
  { id: 'camionnette', kind: 'camionnette', name: 'Camionnette 3 m³', type: 'utilitaire', places: 3, price: 45000, chauffeur: 'both', feats: ['Volume de 3 m³', 'Charge utile 900 kg', 'Hayon arrière'] },
  { id: 'minibus', kind: 'minibus', name: 'Minibus 14 places', type: 'minibus', places: 14, price: 90000, chauffeur: 'avec', feats: ['14 places', 'Climatisation', 'Chauffeur obligatoire'] },
];
const chauffeurFee = { moto: 10000, voiture: 15000, utilitaire: 15000, minibus: 0 };
const ctype = { all: 'Tous', moto: 'Moto et tricycle', voiture: 'Voitures', utilitaire: 'Utilitaires', minibus: 'Minibus' };

// ---- Dessins de véhicules (vue de côté)
const Y = '#FFC21A', K = '#111';
const wheel = (x, y, r = 17) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${K}"/><circle cx="${x}" cy="${y}" r="${r * 0.42}" fill="#D9D9D9"/>`;
const veh = k => {
  const body = `fill="${Y}" stroke="${K}" stroke-width="3" stroke-linejoin="round"`;
  const win = 'fill="#CFE6F2" stroke="#111" stroke-width="2.500"';
  let s = '';
  if (k === 'moto') s = `<rect x="44" y="34" width="52" height="32" rx="5" ${body}/><path d="M60 92L92 64H130L162 64L180 92" fill="none" stroke="${K}" stroke-width="5" stroke-linejoin="round"/><rect x="104" y="46" width="42" height="16" rx="8" ${body}/><rect x="118" y="38" width="46" height="9" rx="4.500" fill="${K}"/><path d="M168 62L178 38H192" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round"/><circle cx="184" cy="56" r="6" fill="#FFF3C4" stroke="${K}" stroke-width="2.500"/>${wheel(60, 94, 20)}${wheel(182, 94, 20)}`;
  if (k === 'tricycle') s = `<rect x="122" y="36" width="96" height="44" rx="5" ${body}/><path d="M52 92V60Q52 46 66 46H112V92Z" ${body}/><path d="M60 54H84V72H60Z" ${win}/><path d="M30 78H52" stroke="${K}" stroke-width="4" stroke-linecap="round"/>${wheel(44, 98, 16)}${wheel(146, 98, 16)}${wheel(194, 98, 16)}`;
  if (k === 'camionnette') s = `<rect x="14" y="26" width="132" height="66" rx="6" ${body}/><path d="M146 40H186L216 64V92H146Z" ${body}/><path d="M156 48H182L202 64H156Z" ${win}/><path d="M28 50H132" stroke="${K}" stroke-width="3" stroke-dasharray="10 8"/>${wheel(54, 96)}${wheel(186, 96)}`;
  if (k === 'berline') s = `<path d="M14 88V76Q14 66 28 64L62 56Q74 38 98 38H150Q172 38 184 58L214 64Q226 66 226 78V90H14Z" ${body}/><path d="M78 56Q86 44 100 44H118V60H78Z" ${win}/><path d="M124 44H150Q164 44 172 60H124Z" ${win}/>${wheel(62, 92)}${wheel(182, 92)}`;
  if (k === 'suv' || k === 'suv7') { const long = k === 'suv7'; s = `<path d="M12 90V62Q12 56 22 54L54 50L70 30H${long ? 176 : 160}L${long ? 198 : 184} 50L218 56Q228 58 228 66V90H12Z" ${body}/><path d="M76 36H${long ? 104 : 116}V52H66Z" ${win}/>${long ? `<path d="M110 36H138V52H110Z" ${win}/>` : ''}<path d="M${long ? 144 : 122} 36H${long ? 172 : 156}L${long ? 190 : 176} 52H${long ? 144 : 122}Z" ${win}/>${wheel(60, 92, 18)}${wheel(182, 92, 18)}`; }
  if (k === 'minibus') s = `<rect x="10" y="26" width="220" height="66" rx="16" ${body}/><path d="M26 38H60V58H26ZM68 38H102V58H68ZM110 38H144V58H110ZM152 38H186V58H152Z" ${win}/><path d="M194 38H220Q224 38 224 44V58H194Z" ${win}/>${wheel(56, 96)}${wheel(186, 96)}`;
  return `<svg viewBox="0 0 240 120" role="img" aria-label="Illustration d’un véhicule" xmlns="http://www.w3.org/2000/svg"><path d="M8 112H232" stroke="#D9CDAE" stroke-width="4" stroke-linecap="round"/>${s}</svg>`;
};

const ic = {
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', shield: '<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  pin: '<path d="M12 22s7-6.500 7-12a7 7 0 0 0-14 0c0 5.500 7 12 7 12z"/><circle cx="12" cy="10" r="2.500"/>', headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.500"/><rect x="17" y="14" width="4" height="6" rx="1.500"/><path d="M19 20c0 1.500-2 2-5 2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  check: '<path d="M5 12l5 5 9-10"/>', phone: '<path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  send: '<path d="M4 12l16-8-6 16-3-7z"/>',
};
const svg = (k, c = '') => `<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic[k]}</svg>`;
const arr = svg('arrow');
const waIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.300-.7-2.800-1.200-4.600-4-4.700-4.200-.1-.2-1.100-1.500-1.100-2.800s.7-2 1-2.300c.2-.3.500-.3.700-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.300 1.700 2.100 1.100 1 2.100 1.300 2.400 1.500.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.900.9c.3.1.5.2.5.3.1.2.1.8-.1 1.400z"/></svg>';
const logo = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="13" fill="#111"/><path d="M13 27L36 13 29 35 24 28z" fill="#FFC21A"/><path d="M24 28L36 13" stroke="#111" stroke-width="2"/></svg>';

const navItems = [['index.html', 'Accueil'], ['livraison.html', 'Livraison'], ['location.html', 'Location'], ['suivi.html', 'Suivi de colis'], ['contact.html', 'Contact']];
const photos = {
  hero: { alt: 'Deux coursiers à moto en gilets jaunes réfléchissants sur une route, sous un pont', by: 'Victor Kibiwott', lic: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Boda_boda_riders_with_reflector.jpg' },
  moto: { alt: 'Motard roulant dans la circulation, à côté d’un 4×4 noir', by: 'safaritravelplus', lic: 'CC0', page: 'https://commons.wikimedia.org/wiki/File:Boda_Boda_Kenya.jpg' },
  plateau: { alt: 'Boulevard du Plateau à Abidjan avec tours et voitures', by: 'Gitoni59', lic: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Akwaba_au_Plateau_!_-_Pont_de_Gaulle,_Abidjan,_CI.jpg' },
  riviera: { alt: 'Résidences blanches entourées de palmiers sous un ciel orageux', by: 'Willy Stephane Awaho', lic: 'CC BY 2.0', page: 'https://commons.wikimedia.org/wiki/File:Copropriétés_Abidjan_Riviéra_Golf.jpg' },
  yopougon: { alt: 'Petit immeuble éclairé au crépuscule', by: 'Willy Stephane Awaho', lic: 'CC BY 2.0', page: 'https://commons.wikimedia.org/wiki/File:Petit_immeuble_à_Yopougon.jpg' },
  treichville: { alt: 'Deux tours roses sur fond de ciel clair', by: 'Hussein Abdallah', lic: 'CC BY 2.0', page: 'https://commons.wikimedia.org/wiki/File:Siège_CIE_et_SODECI_Treichville.jpg' },
  taxi: { alt: 'Rue animée avec taxis rouges et voitures', by: 'Pierrekonan', lic: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Taxi_Compteur_d\'Abidjan.jpg' },
  colis: { alt: 'Gros plan sur des cartons ondulés empilés', by: 'Henry Söderlund', lic: 'CC BY 2.0', page: 'https://commons.wikimedia.org/wiki/File:Cardboard_boxes_by_Henry_Söderlund.jpg' },
};

function head({ title, desc, schema, page, preload }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#FFC21A">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preload" href="fonts/sora-latin-800-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
${preload || ''}<link rel="stylesheet" href="css/style.css">
${schema || ''}</head>
<body data-page="${page}">
<a class="skip" href="#contenu">Aller au contenu</a>
`;
}
function header(current) {
  const links = navItems.map(([h, l]) => `<li><a href="${h}"${h === current ? ' aria-current="page"' : ''}>${l}</a></li>`).join('');
  return `<header class="site-header"><div class="header-in">
<a class="brand" href="index.html" aria-label="${SITE}, accueil">${logo}<span><b>Rapido</b><small>Express CI</small></span></a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav" aria-label="Ouvrir le menu">${svg('menu')}</button>
<nav class="nav" id="nav" aria-label="Navigation principale"><ul>${links}</ul><div class="acts"><a class="btn line sm" href="suivi.html">Suivre un colis</a><a class="btn sm" href="commander.html">Commander</a></div></nav>
</div></header>
<main id="contenu">
`;
}
function footer() {
  return `</main>
<footer class="site-footer"><div class="foot">
<div><a class="brand" href="index.html">${logo}<span><b>Rapido</b><small>Express CI</small></span></a><p>Livraison de colis et location de véhicules à Abidjan. Simple, rapide, suivi.</p></div>
<div><h2>Liens utiles</h2><a href="livraison.html">Livraison</a><a href="location.html">Location de véhicules</a><a href="suivi.html">Suivi de colis</a><a href="commander.html">Commander</a><a href="contact.html">Contact</a></div>
<div><h2>Nous joindre</h2><a href="tel:+22527203040500">${PHONE}</a><a href="${WA}" rel="noopener">WhatsApp</a><a href="confidentialite.html">Confidentialité</a><a href="confidentialite.html#credits">Crédits photos</a></div>
<div><h2>Nouveautés</h2><p>Offres et nouvelles zones, une fois par mois.</p>
<form id="newsletter" novalidate aria-label="Inscription à l’infolettre"><label class="vh" for="nl-mail">Votre adresse e-mail</label><div class="nl"><input id="nl-mail" type="email" placeholder="Votre adresse e-mail" autocomplete="email" required><button type="submit" aria-label="Je m’inscris">${svg('send')}</button></div>
<p class="err" data-err-for="nl-mail">Indiquez une adresse e-mail valide.</p>
<div class="check"><input id="nl-ok" type="checkbox" required><label for="nl-ok">J’accepte de recevoir l’infolettre (désinscription à tout moment). <a href="confidentialite.html" style="display:inline">Confidentialité</a></label></div><p class="err" data-err-for="nl-ok">Le consentement est nécessaire.</p>
<p class="okm" role="status">Merci, votre inscription est prise en compte. (Démonstration : rien n’est envoyé.)</p></form></div>
</div>
<div class="legal"><span>© 2026 ${SITE}. Site de démonstration : entreprise, tarifs, suivis et véhicules fictifs.</span><span class="signature">Site créé par <a href="${CODE_AZ_URL}" rel="noopener">Code AZ</a> · agence web</span></div>
</footer>
<div class="fab"><a class="call" href="tel:+22527203040500" aria-label="Appeler le ${PHONE}">${svg('phone')}<span>Appeler</span></a><a class="wa" href="${WA}" rel="noopener" aria-label="Écrire sur WhatsApp">${waIcon}<span>WhatsApp</span></a></div>
<script src="js/data.js"></script>
<script src="js/main.js" defer></script>
</body>
</html>
`;
}
const btn = (href, label, cls = '') => `<a class="btn ${cls}" href="${href}">${label} ${arr}</a>`;
const opts = (sel, extra = '') => communes.map(c => `<option${c[0] === sel ? ' selected' : ''}>${c[0]}</option>`).join('') + extra;
const pkgOpts = () => pkgs.map(p => `<option value="${p.id}">${p.label}</option>`).join('');
const pages = {};

// ================= ACCUEIL
const schema = `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'Organization', name: SITE, description: 'Livraison de colis et location de véhicules à Abidjan.', telephone: PHONE,
  address: { '@type': 'PostalAddress', addressLocality: 'Abidjan', addressCountry: 'CI' },
})}</script>
`;
const zoneCards = [['Adjamé', 'plateau'], ['Cocody', 'riviera'], ['Yopougon', 'yopougon'], ['Treichville', 'treichville']];
const fromPlateau = c => { const k = km('Plateau', c), p = priceFor(k, 'moto', 'standard'), t = 20 + 4 * k; return { p, t }; };
pages['index.html'] = head({ title: 'Rapido Express CI · Livraison de colis et location de véhicules à Abidjan', desc: 'Livraison de colis à moto, tricycle et camionnette à Abidjan, suivi de colis et location de véhicules. Calculez votre prix en 20 secondes.', schema, page: 'index', preload: '<link rel="preload" href="img/hero.webp" as="image" type="image/webp">\n' })
+ header('index.html') + `
<section class="hero"><div class="wrap hero-grid">
<div><span class="eyebrow">Rapide · Sûr · Suivi</span><h1>Vos colis livrés en <em>moins de 2 heures.</em></h1>
<p class="lead">Coursiers à moto, tricycles et camionnettes dans tout Abidjan. Indiquez votre trajet : vous voyez le prix tout de suite. Délais estimés selon la zone et la circulation.</p>
<div class="quick"><div class="tabs" role="tablist" aria-label="Que voulez-vous faire ?"><button type="button" role="tab" id="t-prix" aria-selected="true" aria-controls="p-prix">Voir le prix</button><button type="button" role="tab" id="t-suivi" aria-selected="false" aria-controls="p-suivi">Suivre un colis</button></div>
<form id="p-prix" action="livraison.html" method="get" role="tabpanel" aria-labelledby="t-prix"><div class="row"><div class="f"><label for="q-d">Départ</label><select id="q-d" name="d">${opts('Cocody')}</select></div><div class="f"><label for="q-a">Arrivée</label><select id="q-a" name="a">${opts('Plateau')}</select></div></div>
<div class="f"><label for="q-p">Type de colis</label><select id="q-p" name="p">${pkgOpts().replace('value="petit"', 'value="petit" selected')}</select></div><button class="btn block" type="submit">Voir le prix ${arr}</button></form>
<form id="p-suivi" action="suivi.html" method="get" role="tabpanel" aria-labelledby="t-suivi" hidden><div class="f"><label for="q-n">Numéro de suivi</label><div class="pill-in"><input id="q-n" name="n" type="text" placeholder="Ex. : RX-240001" autocomplete="off" required><button type="submit" aria-label="Suivre ce colis">${svg('arrow')}</button></div></div><p style="font-size:.82rem;color:var(--muted);margin:0 0 8px 4px">Essayez RX-240001 ou RX-240002 (numéros de démonstration).</p></form></div></div>
<div class="heropic"><span class="note-hand" aria-hidden="true">Course le jour même !</span><img src="img/hero.webp" width="1200" height="900" alt="${photos.hero.alt}" fetchpriority="high"><div class="chip"><i></i>Coursiers disponibles maintenant</div></div>
</div></section>

<section style="padding:6px 0 30px"><div class="wrap"><div class="feat">
<div><span class="ic">${svg('bolt')}</span><span><b>Livraison rapide</b><span>Collecte sous 30 min en Express</span></span></div>
<div><span class="ic">${svg('shield')}</span><span><b>Colis protégés</b><span>Livreurs identifiés, preuve de remise</span></span></div>
<div><span class="ic">${svg('pin')}</span><span><b>Suivi étape par étape</b><span>Un numéro, une page de suivi</span></span></div>
<div><span class="ic">${svg('headset')}</span><span><b>Service client</b><span>Appel et WhatsApp, 7j/7</span></span></div>
</div></div></section>

<section style="padding-top:24px"><div class="wrap">
<div class="head"><div><h2>Nos services</h2><p>Une solution pour chaque besoin, du pli urgent au camion de marchandises.</p></div><a class="more" href="livraison.html">Voir toute la livraison →</a></div>
<div class="svc">
<a class="scard" href="livraison.html"><div class="pic"><img src="img/moto.webp" width="800" height="600" alt="${photos.moto.alt}" loading="lazy"></div><div class="t"><h3>Livraison express</h3><p>Un coursier dédié, en priorité, pour ce qui ne peut pas attendre.</p><span class="go">${arr}</span></div></a>
<a class="scard" href="commander.html"><div class="pic">${svg('clock', '')}</div><div class="t"><h3>Livraison programmée</h3><p>Choisissez le jour et le créneau, nous nous occupons du reste.</p><span class="go">${arr}</span></div></a>
<a class="scard" href="livraison.html#entreprise"><div class="pic">${svg('box', '')}</div><div class="t"><h3>Livraison e-commerce</h3><p>Collecte quotidienne et livraison de vos commandes clients.</p><span class="go">${arr}</span></div></a>
<a class="scard" href="location.html"><div class="pic">${veh('suv')}</div><div class="t"><h3>Location de véhicules</h3><p>Voitures, utilitaires et minibus, avec ou sans chauffeur.</p><span class="go">${arr}</span></div></a>
</div></div></section>
<style>.scard .pic>svg{width:54%;height:auto;color:var(--noir)}.scard .pic{color:var(--noir)}</style>

<section style="padding:20px 0"><div class="wrap"><div class="promo"><img src="img/colis.webp" width="1600" height="867" alt="${photos.colis.alt}" loading="lazy"><div><span class="tagoffer">Offre de bienvenue</span><h2>-20 % sur votre <em>première livraison</em></h2><p>Créez votre première course avec le code ci-dessous. Offre fictive, pour la démonstration.</p><p class="code">BIENVENUE20</p><br>${btn('commander.html', 'Commander maintenant')}</div></div></div></section>

<section><div class="wrap">
<div class="head"><div><h2>Comment ça marche</h2></div></div>
<div class="steps3"><div><b class="n">1</b><h3>Indiquez votre trajet</h3><p>Départ, arrivée et type de colis : le prix s’affiche tout de suite.</p></div><div><b class="n">2</b><h3>Un coursier vient chercher</h3><p>Un livreur identifié collecte le colis à l’adresse indiquée.</p></div><div><b class="n">3</b><h3>Suivez et recevez</h3><p>Suivi par numéro, livraison et remise au destinataire.</p></div></div>
</div></section>

<section class="white"><div class="wrap">
<div class="head"><div><h2>Zones couvertes</h2><p>Dix communes d’Abidjan, avec des délais indicatifs depuis le Plateau.</p></div><a class="more" href="livraison.html#zones">Tous les tarifs →</a></div>
<div class="zones">
${zoneCards.map(([c, k]) => { const z = fromPlateau(c); return `<a class="zone" href="livraison.html?d=Plateau&a=${c}"><img src="img/z-${k}.webp" width="700" height="525" alt="${photos[k].alt}" loading="lazy"><div class="b"><span><b>${c}</b><small>dès ${fmt(z.p)} FCFA</small></span><span class="go">${arr}</span></div></a>`; }).join('\n')}
<a class="zone all" href="livraison.html#zones"><div>${svg('globe')}<b style="font-family:var(--head)">10 communes</b><br><small>Voir la grille complète</small></div></a>
</div>
<div style="margin-top:26px;overflow-x:auto"><table><caption class="vh">Délais et tarifs depuis le Plateau</caption><thead><tr><th scope="col">Commune</th><th scope="col">Délai indicatif (standard)</th><th scope="col">Moto, dès</th></tr></thead><tbody>
${communes.filter(c => c[0] !== 'Plateau').map(c => { const z = fromPlateau(c[0]); return `<tr><td>${c[0]}</td><td>${dur(z.t * 0.8)} à ${dur(z.t * 1.3)}</td><td>${fmt(z.p)} FCFA</td></tr>`; }).join('\n')}
</tbody></table><p style="font-size:.82rem;color:var(--muted);margin-top:10px">Délais indicatifs, variables selon la circulation et la météo. Aucun délai n’est garanti à la minute.</p></div>
</div></section>

<section><div class="wrap">
<div class="head"><div><h2>Notre flotte</h2><p>Du pli urgent à la marchandise volumineuse.</p></div></div>
<div class="fleet">
<div>${veh('moto')}<b>Moto</b><span>Documents et petits colis</span><br><span class="pr">dès ${fmt(priceFor(1.5, 'moto', 'standard'))} FCFA</span></div>
<div>${veh('tricycle')}<b>Tricycle</b><span>Colis moyens, jusqu’à 40 kg</span><br><span class="pr">dès ${fmt(priceFor(1.5, 'tricycle', 'standard'))} FCFA</span></div>
<div>${veh('camionnette')}<b>Camionnette</b><span>Gros colis, jusqu’à 200 kg</span><br><span class="pr">dès ${fmt(priceFor(1.5, 'camionnette', 'standard'))} FCFA</span></div>
<div>${veh('berline')}<b>Berline</b><span>Location, 5 places</span><br><span class="pr">dès 30 000 FCFA / jour</span></div>
<div>${veh('suv')}<b>SUV</b><span>Location, 5 à 7 places</span><br><span class="pr">dès 55 000 FCFA / jour</span></div>
</div><p style="font-size:.82rem;color:var(--muted);margin-top:14px">Prix « à partir de » : le tarif final dépend de la course (distance, poids, type de livraison).</p></div></section>

<section class="white"><div class="wrap">
<div class="head"><div><h2>Elles nous font confiance</h2><p>Avis d’entreprises clientes (fictifs, pour la démonstration).</p></div></div>
<div class="reviews">
<figure class="review"><p class="st" role="img" aria-label="5 étoiles sur 5">★★★★★</p><p>« Nos commandes partent chaque soir. Le suivi rassure nos clientes, et les retours ont presque disparu. »</p><footer>Boutique de mode en ligne<span>Cocody</span></footer></figure>
<figure class="review"><p class="st" role="img" aria-label="5 étoiles sur 5">★★★★★</p><p>« Pour nos documents urgents entre agences, c’est le plus fiable que nous ayons testé. »</p><footer>Cabinet comptable<span>Plateau</span></footer></figure>
<figure class="review"><p class="st" role="img" aria-label="4 étoiles sur 5">★★★★☆</p><p>« La camionnette pour nos livraisons de matériel : ponctuelle, chauffeur courtois. »</p><footer>Quincaillerie<span>Yopougon</span></footer></figure>
</div></div></section>

<section><div class="wrap"><div class="biz"><div><h2>Compte entreprise</h2><p>Vous expédiez régulièrement ? Un compte entreprise, des tarifs adaptés et une facture mensuelle unique.</p><ul><li>Collecte quotidienne à heure fixe</li><li>Suivi de tous vos colis au même endroit</li><li>Un interlocuteur dédié</li></ul></div><div>${btn('contact.html#entreprise', 'Ouvrir un compte', 'dark')}</div></div></div></section>
` + footer();

// ================= LIVRAISON
pages['livraison.html'] = head({ title: 'Livraison à Abidjan · Prix et délais · Rapido Express CI', desc: 'Calculez le prix de votre livraison à Abidjan : commune de départ et d’arrivée, type de colis, type de livraison. Tarifs à partir de 1 500 FCFA.', page: 'livraison' })
+ header('livraison.html') + `
<div class="wrap page-title"><span class="eyebrow">Livraison</span><h1>Un prix clair, avant de commander.</h1><p>Choisissez le trajet et le type de colis : le prix « à partir de » et un délai estimé s’affichent.</p></div>
<section style="padding-top:26px"><div class="wrap two">
<div class="card" id="calculateur"><h2>Calculateur de prix</h2>
<div class="row2"><div class="field"><label class="f" for="c-d">Commune de départ</label><select id="c-d">${opts('Cocody')}</select></div><div class="field"><label class="f" for="c-a">Commune d’arrivée</label><select id="c-a">${opts('Plateau')}</select></div></div>
<div class="field"><label class="f" for="c-p">Type de colis</label><select id="c-p">${pkgOpts().replace('value="petit"', 'value="petit" selected')}</select></div>
<fieldset style="border:0;padding:0;margin:0 0 6px"><legend>Type de livraison</legend>
${Object.entries(dtypes).map(([k, v], i) => `<label class="opt"><input type="radio" name="dt" value="${k}"${i === 0 ? ' checked' : ''}><span><b>${v.label}</b><small>${v.desc}</small></span></label>`).join('')}</fieldset>
<div class="result" aria-live="polite"><span class="k">Prix estimé</span><p class="big" id="r-price">—</p><div class="ln"><span>Véhicule</span><span id="r-veh">—</span></div><div class="ln"><span>Distance estimée</span><span id="r-km">—</span></div><div class="ln"><span>Délai estimé</span><span id="r-delay">—</span></div><p>Prix « à partir de » : le tarif final dépend de la course (attente, étages, conditions de circulation). Aucun délai n’est garanti à la minute.</p></div>
<p style="margin:18px 0 0"><a class="btn" id="r-go" href="commander.html">Commander cette course ${arr}</a></p></div>
<div><div class="mapbox"><svg viewBox="0 0 480 280" id="map" role="img" aria-label="Plan schématique des communes d’Abidjan"></svg></div><p style="font-size:.8rem;color:var(--muted);margin:8px 4px 0">Plan schématique, distances à vol d’oiseau majorées de 30 %.</p></div>
</div></section>
<section style="padding-top:0"><div class="wrap"><div class="steps3"><div><b class="n">1</b><h3>Colis et documents</h3><p>Des plis aux colis de 40 kg, en moto ou tricycle, à l’unité ou en tournée.</p></div><div><b class="n">2</b><h3>Courses et achats</h3><p>Un coursier récupère et rapporte un achat, un repas ou un document signé.</p></div><div id="entreprise"><b class="n">3</b><h3>Entreprises</h3><p>Tournées régulières, collecte quotidienne et facture mensuelle : <a href="contact.html#entreprise">parlons-en</a>.</p></div></div></div></section>
<section class="white" id="zones"><div class="wrap"><div class="head"><div><h2>Grille tarifaire depuis le Plateau</h2><p>Prix « à partir de » en standard, par véhicule.</p></div></div>
<div style="overflow-x:auto"><table><caption class="vh">Tarifs depuis le Plateau par commune et par véhicule</caption><thead><tr><th scope="col">Commune</th><th scope="col">Moto</th><th scope="col">Tricycle</th><th scope="col">Camionnette</th><th scope="col">Délai (moto)</th></tr></thead><tbody>
${communes.filter(c => c[0] !== 'Plateau').map(c => { const k = km('Plateau', c[0]); const t = 20 + 4 * k; return `<tr><td>${c[0]}</td><td>${fmt(priceFor(k, 'moto', 'standard'))} FCFA</td><td>${fmt(priceFor(k, 'tricycle', 'standard'))} FCFA</td><td>${fmt(priceFor(k, 'camionnette', 'standard'))} FCFA</td><td>${dur(t * 0.8)} à ${dur(t * 1.3)}</td></tr>`; }).join('\n')}
</tbody></table></div><p style="font-size:.82rem;color:var(--muted);margin-top:10px">Tarifs de démonstration. Express : +40 %. Programmée : -10 %.</p></div></section>
` + footer();

// ================= LOCATION
pages['location.html'] = head({ title: 'Location de véhicules à Abidjan · Avec ou sans chauffeur · Rapido Express CI', desc: 'Louez une moto, un tricycle, une berline, un SUV, une camionnette ou un minibus à Abidjan, avec ou sans chauffeur. Prix par jour de 25 000 à 90 000 FCFA.', page: 'location' })
+ header('location.html') + `
<div class="wrap page-title"><span class="eyebrow">Location</span><h1>Le bon véhicule, pour la journée ou la semaine.</h1><p>Huit véhicules, avec ou sans chauffeur. Choisissez vos dates : le total se calcule tout de suite.</p></div>
<section style="padding-top:26px"><div class="wrap">
<div class="filters"><div><label id="l-t">Type</label><div class="chips" role="group" aria-labelledby="l-t">${Object.entries(ctype).map(([k, v]) => `<button type="button" data-type="${k}" aria-pressed="${k === 'all'}">${v}</button>`).join('')}</div></div>
<div><label for="f-pl">Places</label><select id="f-pl"><option value="0">Toutes</option><option value="2">2 et plus</option><option value="5">5 et plus</option><option value="7">7 et plus</option></select></div>
<div><label for="f-ch">Chauffeur</label><select id="f-ch"><option value="all">Avec ou sans</option><option value="avec">Avec chauffeur</option><option value="sans">Sans chauffeur</option></select></div>
<div><label for="f-d1">Début</label><input id="f-d1" type="date"></div><div><label for="f-d2">Fin</label><input id="f-d2" type="date"></div></div>
<p id="c-count" style="font-weight:600" role="status" aria-live="polite">8 véhicules</p>
<div class="cars" id="cars">
${cars.map(c => `<article class="car" data-id="${c.id}" data-type="${c.type}" data-places="${c.places}" data-ch="${c.chauffeur}" data-price="${c.price}" data-fee="${chauffeurFee[c.type]}"><div class="v">${veh(c.kind)}</div><h3>${c.name}</h3><ul><li>${c.places} place${c.places > 1 ? 's' : ''}</li>${c.feats.map(f => `<li>${f}</li>`).join('')}</ul><p class="p">${fmt(c.price)} FCFA <small>/ jour</small></p><p class="tot" data-tot></p><button class="btn sm" type="button" data-book="${c.id}">Réserver</button></article>`).join('\n')}
</div>
<p id="c-empty" style="display:none">Aucun véhicule ne correspond à ces filtres.</p>
<p style="font-size:.82rem;color:var(--muted);margin-top:14px">Supplément chauffeur : 10 000 FCFA par jour pour la moto et le tricycle, 15 000 FCFA pour les voitures et utilitaires (inclus pour le minibus). Sans chauffeur : permis de conduire et pièce d’identité à présenter à l’enlèvement, caution demandée sur place.</p>
</div></section>
<section class="white" id="reserver" style="display:none"><div class="wrap"><div class="two">
<form class="card" id="rform" novalidate aria-label="Réservation d’un véhicule"><h2>Réserver ce véhicule</h2><div class="notice" id="r-sum"></div>
<div class="field"><label class="f" for="r-nom">Nom et prénom</label><input id="r-nom" type="text" autocomplete="name" required><p class="err" data-err-for="r-nom">Indiquez votre nom.</p></div>
<div class="field"><label class="f" for="r-tel">Téléphone</label><input id="r-tel" type="tel" autocomplete="tel" placeholder="+225 07 00 00 00 00" required><p class="err" data-err-for="r-tel">Indiquez un numéro valide.</p></div>
<div class="check"><input id="r-ok" type="checkbox" required><label for="r-ok">J’accepte que Rapido Express CI utilise ces informations pour traiter ma réservation, selon la <a href="confidentialite.html">politique de confidentialité</a>.</label></div><p class="err" data-err-for="r-ok">Le consentement est nécessaire.</p>
<button class="btn" type="submit">Envoyer la réservation ${arr}</button>
<div class="ok" id="r-done" role="status"><span class="chk">${svg('check')}</span><h3>Réservation reçue</h3><p class="ref" id="r-ref"></p><p>Merci <strong id="r-name"></strong>. Nous vous rappelons pour confirmer la disponibilité et l’heure d’enlèvement.</p><p style="font-size:.82rem;color:var(--muted)">Démonstration : aucune donnée n’a été envoyée.</p></div></form>
<div><img src="img/taxi.webp" width="1000" height="585" alt="${photos.taxi.alt}" loading="lazy" style="border-radius:22px;box-shadow:var(--sh)"></div>
</div></div></section>
` + footer();

// ================= SUIVI
pages['suivi.html'] = head({ title: 'Suivi de colis · Rapido Express CI', desc: 'Suivez votre colis étape par étape avec votre numéro de suivi : enregistré, collecté, en route, livré.', page: 'suivi' })
+ header('suivi.html') + `
<div class="wrap page-title"><span class="eyebrow">Suivi de colis</span><h1>Où est mon colis ?</h1><p>Saisissez votre numéro de suivi. Numéros de démonstration : <strong>RX-240001</strong> (en route) et <strong>RX-240002</strong> (livré).</p></div>
<section style="padding-top:26px"><div class="wrap">
<form id="track" class="card" style="max-width:640px" novalidate aria-label="Suivre un colis"><label class="f" for="t-n">Numéro de suivi</label><div class="pill-in"><input id="t-n" type="text" placeholder="RX-240001" autocomplete="off" required><button type="submit" aria-label="Suivre ce colis">${svg('arrow')}</button></div><p class="err" id="t-err" style="margin-top:10px">Numéro introuvable. Vérifiez-le ou utilisez un numéro de démonstration.</p></form>
<div class="two" id="found" style="margin-top:26px" hidden>
<div class="card"><span class="status" id="s-status"></span><h2 id="s-title" style="font-size:1.6rem"></h2><p id="s-sub" style="color:var(--muted)"></p>
<div class="bar" role="progressbar" aria-label="Avancement de la livraison" aria-valuemin="0" aria-valuemax="100" id="s-bar"><span id="s-fill"></span></div>
<ol class="timeline" id="s-steps"></ol>
<div class="ln" style="display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:12px"><span style="color:var(--muted)">Numéro</span><b id="s-no"></b></div><div class="ln" style="display:flex;justify-content:space-between;padding-top:6px"><span style="color:var(--muted)">Trajet</span><b id="s-route"></b></div><div class="ln" style="display:flex;justify-content:space-between;padding-top:6px"><span style="color:var(--muted)">Arrivée estimée</span><b id="s-eta"></b></div></div>
<div><div class="mapbox"><svg viewBox="0 0 480 280" id="map" role="img" aria-label="Plan schématique du trajet du colis"></svg></div><p style="font-size:.8rem;color:var(--muted);margin:8px 4px 0">Position schématique et données fictives, pour la démonstration.</p></div></div>
</div></section>
` + footer();

// ================= COMMANDER
pages['commander.html'] = head({ title: 'Commander une course ou une livraison · Rapido Express CI', desc: 'Commandez une livraison en trois étapes : colis, adresses et type de livraison, coordonnées. Numéro de suivi immédiat.', page: 'commander' })
+ header('commander.html') + `
<div class="wrap page-title"><span class="eyebrow">Commander</span><h1>Une course en moins d’une minute.</h1><p>Trois étapes. Vous ne payez qu’à la remise : espèces ou Mobile Money au livreur.</p></div>
<section style="padding-top:26px"><div class="wrap two">
<form class="card" id="order" novalidate aria-label="Commande de livraison">
<ol class="progress" aria-label="Progression"><li data-n="1" class="on">Colis</li><li data-n="2">Adresses</li><li data-n="3">Confirmation</li></ol>
<div class="step on"><h2 tabindex="-1" style="font-size:1.5rem">Le colis</h2>
<div class="field"><label class="f" for="o-p">Type de colis</label><select id="o-p">${pkgOpts().replace('value="petit"', 'value="petit" selected')}</select></div>
<div class="field"><label class="f" for="o-desc">Contenu (facultatif)</label><input id="o-desc" type="text" placeholder="Ex. : documents, vêtements, pièces…"></div>
<p class="err" id="o-lourd">Au-delà de 200 kg, demandez un devis : <a href="contact.html#entreprise">contactez-nous</a>.</p>
<div class="nav-btns"><span></span><button type="button" class="btn" data-next>Continuer ${arr}</button></div></div>
<div class="step"><h2 tabindex="-1" style="font-size:1.5rem">Les adresses</h2>
<div class="row2"><div class="field"><label class="f" for="o-d">Commune de départ</label><select id="o-d">${opts('Cocody')}</select></div><div class="field"><label class="f" for="o-a">Commune d’arrivée</label><select id="o-a">${opts('Plateau')}</select></div></div>
<div class="row2"><div class="field"><label class="f" for="o-dr">Repère de départ</label><input id="o-dr" type="text" placeholder="Ex. : Riviera 3, pharmacie" required><p class="err" data-err-for="o-dr">Indiquez un repère.</p></div><div class="field"><label class="f" for="o-ar">Repère d’arrivée</label><input id="o-ar" type="text" placeholder="Ex. : Immeuble SCIAM, 4e étage" required><p class="err" data-err-for="o-ar">Indiquez un repère.</p></div></div>
<fieldset style="border:0;padding:0;margin:0"><legend>Type de livraison</legend><div id="o-types"></div></fieldset>
<div class="nav-btns"><button type="button" class="btn line" data-prev>Retour</button><button type="button" class="btn" data-next>Continuer ${arr}</button></div></div>
<div class="step"><h2 tabindex="-1" style="font-size:1.5rem">Confirmation</h2>
<div class="row2"><div class="field"><label class="f" for="o-nom">Votre nom</label><input id="o-nom" type="text" autocomplete="name" required><p class="err" data-err-for="o-nom">Indiquez votre nom.</p></div><div class="field"><label class="f" for="o-tel">Votre téléphone</label><input id="o-tel" type="tel" autocomplete="tel" placeholder="+225 07 00 00 00 00" required><p class="err" data-err-for="o-tel">Indiquez un numéro valide.</p></div></div>
<div class="field"><label class="f" for="o-tel2">Téléphone du destinataire</label><input id="o-tel2" type="tel" placeholder="+225 05 00 00 00 00" required><p class="err" data-err-for="o-tel2">Indiquez le numéro du destinataire.</p></div>
<p class="notice">Les numéros servent uniquement au livreur pour la collecte et la remise. <a href="confidentialite.html">Confidentialité</a></p>
<div class="check"><input id="o-ok" type="checkbox" required><label for="o-ok">J’accepte que Rapido Express CI utilise ces informations pour effectuer la livraison, selon la politique de confidentialité.</label></div><p class="err" data-err-for="o-ok">Le consentement est nécessaire.</p>
<div class="nav-btns"><button type="button" class="btn line" data-prev>Retour</button><button type="submit" class="btn">Confirmer la commande ${arr}</button></div></div>
<div class="ok" id="o-done" role="status"><span class="chk">${svg('check')}</span><h2 style="font-size:1.6rem">Commande confirmée !</h2><p>Votre numéro de suivi :</p><p class="ref" id="o-ref"></p><p style="margin-top:14px">Un livreur vous rappelle dans quelques minutes pour la collecte.</p><p>${btn('suivi.html', 'Suivre mon colis')}</p><p style="font-size:.82rem;color:var(--muted)">Démonstration : aucune donnée n’a été envoyée.</p></div>
</form>
<aside class="card" style="position:sticky;top:90px"><h2>Votre course</h2><div id="o-sum"><p style="color:var(--muted)">Choisissez vos adresses pour voir le prix.</p></div>
<div class="result" style="margin-top:14px"><span class="k">Prix estimé</span><p class="big" id="o-price">—</p><div class="ln"><span>Délai estimé</span><span id="o-delay">—</span></div><p>Prix « à partir de » : le tarif final dépend de la course. Paiement à la remise.</p></div></aside>
</div></section>
` + footer();

// ================= CONTACT
pages['contact.html'] = head({ title: 'Contact et compte entreprise · Rapido Express CI', desc: 'Appelez, écrivez sur WhatsApp ou envoyez un message : contact et ouverture de compte entreprise Rapido Express CI à Abidjan.', page: 'contact' })
+ header('contact.html') + `
<div class="wrap page-title"><span class="eyebrow">Contact</span><h1>Une question ? On vous répond vite.</h1></div>
<section style="padding-top:26px"><div class="wrap contact-grid">
<div class="card info"><h2>Nous joindre</h2><dl style="margin:0"><dt>Téléphone</dt><dd><a href="tel:+22527203040500">${PHONE}</a></dd><dt>WhatsApp</dt><dd><a href="${WA}" rel="noopener">Écrire sur WhatsApp</a></dd><dt>Agence</dt><dd>Boulevard de Marseille, Zone 4<br>Marcory, Abidjan</dd><dt>Horaires</dt><dd>Lundi au samedi : 7 h – 20 h<br>Dimanche : 9 h – 17 h</dd></dl></div>
<form class="card" id="cform" novalidate aria-label="Nous écrire"><h2 id="entreprise">Nous écrire ou ouvrir un compte entreprise</h2>
<div class="field"><label class="f" for="c-nom">Nom</label><input id="c-nom" type="text" autocomplete="name" required><p class="err" data-err-for="c-nom">Indiquez votre nom.</p></div>
<div class="field"><label class="f" for="c-msg">Message</label><textarea id="c-msg" rows="4" required></textarea><p class="err" data-err-for="c-msg">Écrivez votre message.</p></div>
<div class="check"><input id="c-ok" type="checkbox" required><label for="c-ok">J’accepte que Rapido Express CI utilise ces informations pour me répondre, selon la <a href="confidentialite.html">politique de confidentialité</a>.</label></div><p class="err" data-err-for="c-ok">Le consentement est nécessaire.</p>
<button class="btn" type="submit">Envoyer ${arr}</button><p class="notice" id="c-okm" role="status" hidden style="margin:14px 0 0">Merci, nous vous répondons rapidement. (Démonstration : rien n’est envoyé.)</p></form>
</div></section>
` + footer();

// ================= CONFIDENTIALITÉ
pages['confidentialite.html'] = head({ title: 'Confidentialité et crédits photos · Rapido Express CI', desc: 'Comment Rapido Express CI utilise les informations des commandes et des réservations, et crédits des photographies.', page: 'page' })
+ header('') + `
<div class="wrap page-title"><span class="eyebrow">Confidentialité</span><h1>Vos données, peu et bien gardées.</h1></div>
<section style="padding-top:10px"><div class="wrap prose">
<p><strong>Site de démonstration :</strong> les formulaires n’envoient rien. Les commandes de démonstration restent dans votre navigateur, pour le suivi.</p>
<h2>Données demandées</h2><p>Pour une livraison : le type de colis, les repères de départ et d’arrivée, votre nom et les numéros de téléphone de l’expéditeur et du destinataire. Pour une location : nom et téléphone. Rien d’autre.</p>
<h2>Utilisation</h2><p>Uniquement pour effectuer la livraison ou traiter la réservation. Aucune transmission à des tiers.</p>
<h2>Prix et délais</h2><p>Les prix sont des estimations « à partir de » et les délais sont indicatifs : aucun délai n’est garanti à la minute.</p>
<h2 id="credits">Crédits photos</h2><p>Photos issues de Wikimedia Commons, à titre d’illustration. Les licences CC BY et CC BY-SA exigent de citer l’auteur.</p>
<ul class="credits">${Object.values(photos).map(p => `<li>${p.alt.split(',')[0]} : ${p.by}, <a href="${p.page}" rel="noopener">${p.lic}</a></li>`).join('')}</ul>
</div></section>
` + footer();

for (const [f, html] of Object.entries(pages)) fs.writeFileSync(path.join(out, f), html);
fs.writeFileSync(path.join(out, 'js', 'data.js'), 'window.RX=' + JSON.stringify({ communes, pkgs, vrate, dtypes, cars: cars.map(c => ({ id: c.id, name: c.name, price: c.price, type: c.type })), chauffeurFee }) + ';\n');
fs.writeFileSync(path.join(out, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="13" fill="#111"/><path d="M13 27L36 13 29 35 24 28z" fill="#FFC21A"/></svg>');
fs.writeFileSync(path.join(out, 'vercel.json'), JSON.stringify({ cleanUrls: true }, null, 2) + '\n');
fs.writeFileSync(path.join(out, '.vercelignore'), ['_build', '_raw', '.claude', 'GUIDE-PUBLICATION.md', 'model.jpg'].join('\n') + '\n');
console.log('OK', Object.keys(pages).length, 'pages');
