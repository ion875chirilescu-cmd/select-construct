/**
 * POST /api/oferta — primește o cerere de ofertă din formularul de contact
 * și o salvează în baza de date Neon.
 *
 * Validarea se face din nou aici, integral. Cea din browser e doar pentru
 * confortul vizitatorului: oricine poate trimite direct către adresa asta,
 * ocolind pagina.
 *
 * Variabile de mediu necesare (Vercel → Settings → Environment Variables):
 *   DATABASE_URL — șirul de conexiune Neon (cel „pooled")
 *
 * Opționale, pentru înștiințarea prin e-mail la fiecare cerere nouă:
 *   RESEND_API_KEY — cheia de la resend.com; cât lipsește, e-mailul e sărit
 *   NOTIFY_EMAIL   — destinatarul; implicit, adresa firmei de mai jos
 */
import { neon } from '@neondatabase/serverless';

// Adresa pe care vine înștiințarea. Contul Resend trebuie deschis cu aceeași
// adresă, altfel serviciul refuză trimiterea cât timp domeniul nu e verificat.
const EMAIL_FIRMA = 'mchirilescu02@icloud.com';

// Aceleași opțiuni ca în lista din formular. Orice altceva e respins:
// nu vrem ca cineva să scrie text arbitrar în câmpul care ajunge în raport.
const TIPURI_LUCRARE = [
  'Renovare completă apartament',
  'Zugrăveli și finisaje',
  'Baie la cheie',
  'Bucătărie la cheie',
  'Gresie / faianță',
  'Parchet și pardoseli',
  'Gips-carton / tavane false',
  'Instalații electrice / sanitare',
  'Altceva'
];

// mobil (06x, 07x) și fix Chișinău (022), local sau internațional cu +373
const TELEFON = /^(\+?373[\s.-]?|0)(6\d|7[6-9]|22)[\s.-]?\d{3}[\s.-]?\d{3}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function curata(valoare, maxim) {
  return typeof valoare === 'string' ? valoare.trim().slice(0, maxim) : '';
}

// Textul vine de la vizitator, deci îl vărsăm în HTML doar după ce îi
// dezarmăm caracterele speciale — altfel un mesaj ar putea injecta cod
// în e-mailul citit de administrator.
function scapaHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Trimite înștiințarea prin e-mail, prin API-ul HTTP al serviciului Resend.
 * Fără RESEND_API_KEY nu face nimic; orice eșec doar se consemnează în
 * jurnal — cererea e deja salvată în baza de date, deci nu se pierde.
 */
async function trimiteInstiintare(cerere) {
  if (!process.env.RESEND_API_KEY) return;

  const randuri = [
    ['Nume', cerere.nume],
    ['Telefon', cerere.telefon],
    ['E-mail', cerere.email || '—'],
    ['Lucrare', cerere.lucrare],
    ['Suprafață', cerere.suprafata ? cerere.suprafata + ' mp' : '—'],
    ['Mesaj', cerere.mesaj || '—']
  ].map(function (r) {
    return '<tr><td style="padding:4px 12px 4px 0;color:#666;white-space:nowrap;vertical-align:top">' +
      r[0] + '</td><td style="padding:4px 0">' + scapaHtml(r[1]) + '</td></tr>';
  }).join('');

  try {
    const raspuns = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'SELECT CONSTRUCT <onboarding@resend.dev>',
        to: [process.env.NOTIFY_EMAIL || EMAIL_FIRMA],
        subject: 'Cerere nouă de ofertă — ' + cerere.nume + ' (' + cerere.lucrare + ')',
        html: '<h2 style="font-weight:600">Cerere nouă de pe selectconstruct.md</h2>' +
          '<table style="font-size:15px;line-height:1.5">' + randuri + '</table>' +
          '<p style="color:#666;font-size:13px">Toate cererile: ' +
          '<a href="https://www.selectconstruct.md/admin.html">pagina de administrare</a></p>'
      })
    });

    if (!raspuns.ok) {
      console.error('Înștiințarea prin e-mail a eșuat:', raspuns.status, await raspuns.text());
    }
  } catch (e) {
    console.error('Înștiințarea prin e-mail a eșuat:', e.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ eroare: 'Doar POST.' });
  }

  const date = req.body && typeof req.body === 'object' ? req.body : {};

  // Capcana pentru roboți: câmpul e ascuns, deci un om nu-l completează
  // niciodată. Răspundem ca la o reușită — dacă i-am spune robotului că a
  // fost prins, ar învăța să ocolească.
  if (curata(date.website, 200)) {
    return res.status(200).json({ ok: true });
  }

  const nume = curata(date.nume, 120);
  const telefon = curata(date.telefon, 40);
  const email = curata(date.email, 160);
  const lucrare = curata(date.lucrare, 80);
  const mesaj = curata(date.mesaj, 3000);

  const erori = [];
  if (nume.length < 3) erori.push('Numele e prea scurt.');
  if (!TELEFON.test(telefon)) erori.push('Numărul de telefon nu e valid.');
  if (email && !EMAIL.test(email)) erori.push('Adresa de e-mail nu e validă.');
  if (!TIPURI_LUCRARE.includes(lucrare)) erori.push('Tipul lucrării nu e recunoscut.');
  if (!date.gdpr) erori.push('Lipsește acordul pentru a fi contactat.');

  let suprafata = null;
  if (date.suprafata !== '' && date.suprafata != null) {
    const n = Number(date.suprafata);
    if (!Number.isFinite(n) || n <= 0 || n > 2000) erori.push('Suprafața nu e validă.');
    else suprafata = Math.round(n);
  }

  if (erori.length) {
    return res.status(400).json({ eroare: erori.join(' ') });
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL lipsește din variabilele de mediu.');
    return res.status(500).json({ eroare: 'Configurare incompletă pe server.' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Un buton apăsat de două ori, sau un robot insistent, nu trebuie să
    // umple tabelul cu aceeași cerere.
    const recente = await sql`
      SELECT 1 FROM cereri_oferta
      WHERE telefon = ${telefon}
        AND creat_la > now() - interval '60 seconds'
      LIMIT 1`;

    if (recente.length > 0) {
      return res.status(429).json({
        eroare: 'Am primit deja cererea ta. Te contactăm în curând.'
      });
    }

    // Interpolarea din `sql` e parametrizată de driver, nu concatenată,
    // deci textul introdus de vizitator nu poate deveni comandă SQL.
    await sql`
      INSERT INTO cereri_oferta (nume, telefon, email, lucrare, suprafata, mesaj, user_agent)
      VALUES (
        ${nume}, ${telefon}, ${email || null}, ${lucrare},
        ${suprafata}, ${mesaj || null},
        ${curata(req.headers['user-agent'], 400) || null}
      )`;

    // Abia după ce cererea e în siguranță în baza de date. Așteptăm
    // trimiterea (altfel funcția s-ar putea închide înaintea ei), dar un
    // eșec aici nu mai privește vizitatorul.
    await trimiteInstiintare({ nume, telefon, email, lucrare, suprafata, mesaj });

    return res.status(200).json({ ok: true });
  } catch (e) {
    // Mesajul detaliat rămâne în jurnalul serverului; vizitatorul primește
    // doar o formulare din care poate acționa.
    console.error('Eroare la salvarea cererii:', e.message);
    return res.status(500).json({ eroare: 'Nu am putut salva cererea.' });
  }
}
