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
 */
import { neon } from '@neondatabase/serverless';

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

    return res.status(200).json({ ok: true });
  } catch (e) {
    // Mesajul detaliat rămâne în jurnalul serverului; vizitatorul primește
    // doar o formulare din care poate acționa.
    console.error('Eroare la salvarea cererii:', e.message);
    return res.status(500).json({ eroare: 'Nu am putut salva cererea.' });
  }
}
