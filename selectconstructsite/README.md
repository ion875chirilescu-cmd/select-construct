# 🏗️ SELECT CONSTRUCT — site de prezentare

Site static (HTML + CSS + JavaScript, fără framework și fără build) pentru o firmă de
construcții din **Chișinău, Republica Moldova**, specializată în **reparații și
renovări interioare**.

## 📂 Structură

```
index.html                  # pagina publică
admin.html                  # lista cererilor primite (protejată cu parolă)
vercel.json                 # configurare găzduire + anteturi de cache
package.json                # o singură dependință, pentru funcții
api/
  oferta.js                 # POST — salvează o cerere în baza de date
  cereri.js                 # GET  — citește cererile, cere parolă
db/schema.sql               # tabelul, de rulat o dată în Neon
assets/
  css/styles.css            # stiluri, tokeni de culoare, cele două teme
  css/fonts.css             # declarațiile @font-face (Jost + Archivo)
  js/main.js                # meniu, filtre, calculator, formular, animații
  fonts/                    # fonturile în format woff2, găzduite local
  img/
    favicon.svg             # iconița din tab
    logo.svg                # logo pentru social media / documente
    lucrari/                # fotografiile de la lucrări
```

## 🎨 Direcție vizuală

Totul pleacă de la siglă: **negru neutru, alb și un singur auriu șampanie**
(`#C9A96A`). Fără umbre — separările se fac cu linii de 1px și cu spațiu.
Colțurile sunt aproape drepte (2–3px), nu rotunjite.

Tipografia urmează literele din wordmark — geometrice, subțiri, cu spațiere
mare la majuscule:

| Rol | Font | Unde apare |
|---|---|---|
| Titluri | **Jost** 300 (geometric, subțire) | `h1`, `h2`, cifrele mari, citatul |
| Text | **Archivo** (grotesc) | paragrafe, `h3`, formular |
| Etichete | **Jost** 400–500, majuscule spațiate | supratitluri, butoane, tag-uri, deviz |

Jost are aceleași forme circulare ca „SELECT" și „CONSTRUCT" din siglă, iar
etichetele scrise cu majuscule și spațiere mare repetă direct ritmul acesteia.

### Sigla din pagină

Marca din header și footer e **redesenată în SVG** după sigla firmei: conturul
de casă, cu „S" alb în stânga și „C" auriu în dreapta. Fiind vectorială, e
clară la orice dimensiune, cântărește câteva sute de octeți și își ia albul din
culoarea temei, deci merge și pe fundal deschis.

Ceea ce **nu** conține este fotografia de interior din interiorul mărcii —
la 36 px din header oricum nu s-ar vedea. Pentru locurile unde e nevoie de
sigla completă (imagine de partajare pe rețele, documente, semnătură de
e-mail), folosește fișierul original al firmei.

**Tema întunecată e designul site-ului**, nu o opțiune — se aplică din start,
indiferent de setarea sistemului. Butonul din header comută pe varianta luminoasă
(hârtie caldă, auriu închis), iar alegerea se ține minte. Ambele teme au fost
verificate la contrast: tot textul trece pragul WCAG AA (4.5:1).

## 🚀 Rulare locală

Fiind un site static, poți deschide direct `index.html` în browser. Pentru un
comportament identic cu cel de pe server, pornește un server local:

```bash
python3 -m http.server 8000
# apoi deschide http://localhost:8000
```

Formularul de contact va folosi varianta cu e-mail, pentru că funcțiile din
`api/` rulează doar pe Vercel.

## 🧩 Ce conține pagina

| Secțiune | Ancoră | Ce face |
|---|---|---|
| Hero | `#top` | Mesaj principal, două CTA-uri și cifrele firmei (animate) |
| Servicii | `#servicii` | 9 servicii de interior, fiecare cu lista lucrărilor incluse |
| Cum lucrăm | `#proces` | Procesul în 4 pași, de la vizită la garanție |
| De ce noi | `#despre` | Diferențiatori + cifre-cheie |
| Estimare preț | `#calculator` | Calculator interactiv de manoperă (tip lucrare × mp × finisaj) |
| Întrebări | `#intrebari` | 7 întrebări frecvente (accordion nativ `<details>`) |
| Contact | `#contact` | Formular validat + date de contact |

Alte lucruri incluse: temă luminoasă/întunecată cu memorare, meniu mobil,
buton flotant de apel pe telefon, marcaje `schema.org` pentru Google,
etichete Open Graph, suport pentru `prefers-reduced-motion` și stiluri de print.

## ✏️ Ce trebuie personalizat înainte de publicare

Toate datele de mai jos sunt **exemple** și trebuie înlocuite cu cele reale:

1. **Telefon** — `+37376986728` / `076 986 728` în `index.html`
   (apare în header, în banda CTA, în contact, în footer, în butonul flotant,
   în linkurile de Viber și WhatsApp și în `schema.org`).
2. **E-mail** — adresa reală, `mchirilescu02@icloud.com`, e pusă în
   `index.html` și în `CONFIG.email` din `assets/js/main.js`. Dacă se
   schimbă vreodată, caut-o și înlocuiește-o în ambele fișiere.
3. **Adresa sediului și IDNO** — au fost scoase din pagină cât timp nu există
   date reale (rămăseseră „str. Exemplu 10" și un IDNO de zerouri). Când le ai,
   se adaugă în secțiunea de contact, în footer și în blocul
   `application/ld+json` din `<head>`.
4. **Domeniu** — `https://www.selectconstruct.md/` din `<link rel="canonical">`
   și din marcajele Open Graph.
5. **Cifre** — în hero au rămas doar cele reale: „5 ani de experiență" și
   „4 oameni în echipă". „Lucrări finalizate" și „clienți mulțumiți" au fost
   scoase; se pot readăuga în `.stats` când există cifre adevărate.

### Secțiuni scoase temporar (până există fotografii reale)

Secțiunea **Lucrări** (`#lucrari`) — galeria filtrabilă și comparatorul
„înainte / după" — a fost scoasă din `index.html` cât timp nu există nicio
fotografie reală: galeria arăta doar modele desenate în CSS, iar comparatorul
folosea ilustrații, ceea ce putea induce în eroare. Codul complet există în
istoricul git (înainte de commitul care a scos secțiunea) și poate fi readus
când sunt gata pozele: `renovare-completa.jpg`, `baie.jpg`, `bucatarie.jpg`,
`zugraveli.jpg`, `gips-carton.jpg`, `parchet.jpg` în `assets/img/lucrari/`,
plus două fotografii „înainte / după" din aceeași încăpere.

Fotografia din cap de pagină (`hero.webp`, pusă deja) poate fi **verticală**:
slotul ei trece pe raport 3:4 pe ecran lat și pe 4:3 pe telefon, ca o poză de
interior fotografiată în picioare să nu-și piardă înălțimea.

**Comparația înainte/după** rămâne pe desene până ai două fotografii ale
**aceleiași camere**, din același loc și unghi. Două poze diferite nu
funcționează acolo — cursorul nu ar avea ce compara.

### De unde iei fotografii până ai propriile poze

Dacă vrei imagini profesionale acum, ia-le **doar** de pe site-uri cu licență
liberă pentru uz comercial. Nu lua poze din Google Images sau de pe site-urile
concurenței: majoritatea sunt protejate de drepturi de autor, iar agențiile de
imagini urmăresc folosirea neautorizată și trimit facturi.

Surse sigure, gratuite, fără obligație de atribuire:

- [Unsplash — renovări](https://unsplash.com/s/photos/interior-renovation)
- [Unsplash — interioare de apartament](https://unsplash.com/s/photos/apartment-interior)
- [Pixabay — interioare](https://pixabay.com/images/search/apartment%20interior/)

Caută în engleză, dă mult mai multe rezultate: `renovated apartment interior`,
`modern bathroom interior`, `kitchen renovation`, `wooden floor living room`,
`drywall ceiling lighting`.

Ține minte însă: fotografiile de stoc arată bine, dar **nu sunt lucrările tale**.
De aceea secțiunea se numește „Ce fel de lucrări facem", cu descrieri de servicii,
nu „Din portofoliul nostru" cu proiecte, suprafețe și cartiere. Când ai propriile
poze, schimbă titlul secțiunii înapoi în „Din portofoliul nostru" și pune în
descrieri datele reale ale fiecărei lucrări — atunci devine dovadă, nu decor.

#### Cum să faci pozele cu telefonul

Nu ai nevoie de fotograf, ai nevoie de disciplină:

- **Fotografiază orizontal (landscape).** Cadrele verticale se decupează urât.
- **Lumină naturală, ziua.** Stinge becurile — amestecul de lumină galbenă de la
  bec cu cea albastră de la fereastră strică toate culorile.
- **Ține telefonul la înălțimea pieptului și drept**, nu înclinat în sus sau în
  jos. Liniile verticale (colțuri, tocuri de ușă) trebuie să rămână verticale.
- **Fotografiază dintr-un colț al camerei**, ca să se vadă două pereți și
  adâncimea. Pozele făcute din mijloc, spre un singur perete, sunt plate.
- **Strânge înainte:** scule, găleți, prelate, cabluri, prosoape. Un obiect
  uitat pe jos anulează impresia de lucrare terminată.
- **Fă și cadre de detaliu:** un colț de gresie tăiat la 45°, un rost drept, o
  nișă de gips-carton. Detaliile dovedesc calitatea mai bine decât cadrele largi.
- **Pentru „înainte și după": marchează locul.** Fă poza „înainte" și notează
  unde ai stat, ca să revii exact acolo la final.

#### Dimensiuni

Minimum **1600 px pe latura lungă**, ideal 2000–2400. Comprimă înainte de urcare
la sub ~300 KB per fișier ([squoosh.app](https://squoosh.app) e gratuit și merge
în browser) — altfel site-ul se încarcă lent tocmai pe telefoanele clienților.

### Formularul de contact

Formularul trimite un JSON către adresa din `CONFIG.formEndpoint`
(`assets/js/main.js`), cu cheile: `nume`, `telefon`, `email`, `lucrare`,
`suprafata`, `mesaj`, `gdpr`.

Implicit adresa e `/api/oferta` — funcția din `api/oferta.js`, care salvează
cererea în baza de date. Vezi „Publicare pe Vercel + Neon" mai jos.

Comportamentul, în funcție de răspunsul serverului:

| Răspuns | Ce vede vizitatorul |
|---|---|
| reușit | „Mulțumim! Te contactăm în aceeași zi lucrătoare.", formular golit |
| 400 / 429 | mesajul scris de server (date greșite, cerere dublată) |
| lipsă, 500, fără rețea | se deschide clientul de e-mail cu mesajul completat |

Ultimul rând contează: dacă adresa API nu există sau serverul e picat,
vizitatorul **nu rămâne cu mâna în aer** — trece automat pe e-mail. Așa
site-ul funcționează și găzduit static, fără nicio funcție.

Poți înlocui `formEndpoint` cu orice alt serviciu care acceptă POST
(Formspree, Getform, Web3Forms) sau îl poți goli, ca să folosești direct
varianta cu e-mail.

Validarea numărului de telefon acceptă formatele din Republica Moldova — mobil
(`069 123 456`, `+373 69 123 456`) și fix Chișinău (`022 123 456`). Regexul
este `phoneRe` din `initContactForm()`, iar serverul îl verifică din nou.

### Prețurile din calculator

Tarifele sunt în obiectul `RATES` din `assets/js/main.js`, exprimate în **lei
moldovenești (MDL) pe metru pătrat**, doar pentru **manoperă**. Sunt calibrate pe
piața din Chișinău și trebuie ajustate la prețurile tale reale:

```js
renovare: { min: 1200, max: 2200, days: 0.55, mat: 0.55, basis: 'utila', label: 'Renovare completă' },
```

- `min` / `max` — intervalul de preț pe metru pătrat
- `days` — zile lucrătoare per metru pătrat (pentru durata estimată)
- `mat` — factor pentru estimarea materialelor de bază (raportat la manoperă)
- `basis` — la ce se raportează suprafața: `utila` (mp de pardoseală) sau
  `montaj` (mp acoperiți efectiv). Schimbă textul explicativ de sub cursor.

Nivelurile de finisaj (Standard / Premium / Lux) sunt multiplicatori setați în
`index.html`, pe `input[name="calcLevel"]` (1 / 1,22 / 1,5).

## 🖌️ Culori și fonturi

Paleta se schimbă dintr-un singur loc — variabilele din `:root`, în
`assets/css/styles.css`:

| Token | Întunecat | Luminos | Rol |
|---|---|---|---|
| `--bg` | `#0E0E0E` | `#F6F4F0` | fundalul paginii |
| `--ink` | `#F4F3F1` | `#161513` | textul principal |
| `--accent` | `#C9A96A` | `#B08D3E` | auriul: umpluturi, iconuri, linii |
| `--accent-text` | `#C9A96A` | `#7A6224` | auriul folosit ca text |

Auriul deschis din siglă nu se citește pe hârtie, de aceea tema luminoasă are
o variantă mai închisă pentru text. Nicio componentă nu-și definește culoarea
direct — totul trece prin tokeni.

Fonturile sunt **găzduite local** în `assets/fonts/` (licență SIL Open Font
License), nu încărcate de la Google. Așa pagina se încarcă mai repede, nu depinde
de un server extern și nu trimite datele vizitatorilor către Google.

Ca să regenerezi fișierele (alt font sau altă greutate), descarcă familia de pe
[Google Fonts](https://fonts.google.com), pune fișierele `.woff2` în
`assets/fonts/` și actualizează `assets/css/fonts.css`. Păstrează subseturile
**latin** și **latin-ext** — al doilea conține diacriticele românești (ă â î ș ț);
fără el, textul cade pe un font de rezervă exact la literele cu semne diacritice.

## 🌐 Publicare pe Vercel + Neon

Site-ul e static, dar formularul de contact salvează cererile într-o bază de
date Postgres (Neon) prin două funcții găzduite pe Vercel. Ambele servicii au
plan gratuit suficient pentru volumul unei firme mici.

### Pasul 1 — baza de date (Neon)

1. Cont pe [neon.tech](https://neon.tech) → *Create project*
2. Deschide **SQL Editor** și rulează conținutul din `db/schema.sql`
3. Din *Connection details*, copiază șirul de conexiune **Pooled connection**
   (arată ca `postgresql://...-pooler...neon.tech/...?sslmode=require`)

### Pasul 2 — site-ul (Vercel)

1. Cont pe [vercel.com](https://vercel.com) → *Add New* → *Project*
2. Alege repository-ul acestui site
3. **Framework Preset:** *Other*. Comanda de build rămâne goală.
4. *Deploy*

Nu trebuie schimbat nimic la *Root Directory* — fișierele sunt în rădăcina
repository-ului, exact unde le caută Vercel.

### Pasul 3 — variabilele de mediu

În Vercel → *Settings* → *Environment Variables*, adaugă două:

| Nume | Valoare |
|---|---|
| `DATABASE_URL` | șirul de conexiune copiat din Neon |
| `ADMIN_PASSWORD` | o parolă inventată de tine, pentru pagina `/admin` |

Apoi *Deployments* → ultimul → *Redeploy*, ca funcțiile să le preia.

### Pasul 4 — verificarea

1. Deschide site-ul și trimite o cerere de probă prin formular
2. Intră pe `adresa-ta.vercel.app/admin`, pune parola din `ADMIN_PASSWORD`
3. Cererea trebuie să apară în listă

### Pagina de administrare

`/admin` arată ultimele 200 de cereri: nume, telefon (apelabil dintr-un clic),
e-mail, tipul lucrării, suprafața și mesajul. Nu e indexată de Google
(`noindex`), iar parola stă doar în sesiunea curentă a browserului.

Nu e o protecție pentru date sensibile — e potrivită pentru o listă de
contacte. Nu refolosi o parolă importantă.

### Dacă baza de date nu e configurată

Formularul **nu se strică**. Când adresa `/api/oferta` lipsește sau serverul
răspunde cu eroare, formularul revine automat la varianta veche: deschide
clientul de e-mail al vizitatorului cu mesajul deja completat.

Asta înseamnă că site-ul merge la fel de bine găzduit oriunde altundeva —
Netlify, GitHub Pages sau FTP clasic — doar că fără baza de date.

Ca să folosești direct varianta cu e-mail, golește `formEndpoint` din
`CONFIG`, în `assets/js/main.js`.

### Ce validează serverul

Funcția `api/oferta.js` verifică din nou tot ce a verificat și browserul:
lungimea numelui, formatul telefonului moldovenesc, e-mailul, apartenența
tipului de lucrare la lista din formular, suprafața între 1 și 2000 mp și
prezența acordului. Validarea din pagină e doar pentru confortul
vizitatorului — oricine poate trimite direct către adresa API, ocolind pagina.

În plus, serverul refuză o a doua cerere de la același număr în mai puțin de
60 de secunde și ignoră în tăcere completările venite din capcana pentru
roboți.

### Domeniu propriu

Când ai domeniul (`selectconstruct.md`), îl legi din setările platformei alese.
Actualizează atunci și `<link rel="canonical">` și marcajele Open Graph din
`index.html`, care indică deja spre adresa finală.
