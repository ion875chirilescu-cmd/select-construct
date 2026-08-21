/**
 * GET /api/cereri — lista cererilor primite, pentru pagina de administrare.
 *
 * O bază de date pe care nimeni n-o citește e inutilă: adresa asta există ca
 * să poți vedea cererile fără să intri în panoul Neon.
 *
 * Protejată cu o parolă trimisă în antetul `x-parola`. E o protecție simplă,
 * potrivită pentru o listă de contacte — nu pentru date sensibile.
 *
 * Variabile de mediu necesare:
 *   DATABASE_URL   — șirul de conexiune Neon
 *   ADMIN_PASSWORD — parola pentru pagina /admin
 */
import { neon } from '@neondatabase/serverless';
import { timingSafeEqual } from 'node:crypto';

/**
 * Aceeași schemă ca în db/schema.sql. Se aplică automat când tabelul lipsește
 * (codul Postgres 42P01), ca pagina să meargă și fără pasul manual din
 * consola Neon. `IF NOT EXISTS` o face inofensivă dacă tabelul există deja.
 */
async function creeazaTabelul(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS cereri_oferta (
      id          bigserial PRIMARY KEY,
      creat_la    timestamptz NOT NULL DEFAULT now(),
      nume        text        NOT NULL,
      telefon     text        NOT NULL,
      email       text,
      lucrare     text        NOT NULL,
      suprafata   integer,
      mesaj       text,
      user_agent  text
    )`;
  await sql`
    CREATE INDEX IF NOT EXISTS cereri_oferta_creat_la_idx
      ON cereri_oferta (creat_la DESC)`;
  await sql`
    CREATE INDEX IF NOT EXISTS cereri_oferta_telefon_idx
      ON cereri_oferta (telefon, creat_la DESC)`;
}

/**
 * Comparație în timp constant. O comparație obișnuită cu `===` se oprește la
 * prima literă diferită, iar diferența de timp permite ghicirea parolei
 * literă cu literă.
 */
function paroleIdentice(primita, corecta) {
  const a = Buffer.from(String(primita));
  const b = Buffer.from(String(corecta));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ eroare: 'Doar GET.' });
  }

  const parolaCorecta = process.env.ADMIN_PASSWORD;
  if (!parolaCorecta) {
    console.error('ADMIN_PASSWORD lipsește din variabilele de mediu.');
    return res.status(500).json({ eroare: 'Configurare incompletă pe server.' });
  }

  const parolaPrimita = req.headers['x-parola'];
  if (!parolaPrimita || !paroleIdentice(parolaPrimita, parolaCorecta)) {
    return res.status(401).json({ eroare: 'Parolă greșită.' });
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL lipsește din variabilele de mediu.');
    return res.status(500).json({ eroare: 'Configurare incompletă pe server: lipsește legătura la baza de date.' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    let cereri;
    try {
      cereri = await sql`
        SELECT id, creat_la, nume, telefon, email, lucrare, suprafata, mesaj
        FROM cereri_oferta
        ORDER BY creat_la DESC
        LIMIT 200`;
    } catch (e) {
      if (e.code !== '42P01') throw e;
      await creeazaTabelul(sql);
      cereri = [];
    }

    // datele de contact nu se păstrează în cache-uri intermediare
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ cereri });
  } catch (e) {
    console.error('Eroare la citirea cererilor:', e.message);
    return res.status(500).json({ eroare: 'Baza de date nu a răspuns.' });
  }
}
