-- Tabelul în care ajung cererile din formularul de contact.
-- Se rulează o singură dată, în consola SQL din Neon.

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
);

-- Lista se citește mereu de la cea mai nouă cerere spre cele vechi.
CREATE INDEX IF NOT EXISTS cereri_oferta_creat_la_idx
  ON cereri_oferta (creat_la DESC);

-- Verificarea anti-dublură caută după telefon într-un interval scurt.
CREATE INDEX IF NOT EXISTS cereri_oferta_telefon_idx
  ON cereri_oferta (telefon, creat_la DESC);
