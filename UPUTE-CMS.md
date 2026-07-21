# Uređivanje stranice (CMS) — upute

Stranica ima ugrađen panel za uređivanje na **`/admin.html`**. Sve je dio projekta i
putuje s njim — nema vanjskih servisa, ništa se ne plaća, radi na bilo kojem hostingu.

## Što se može uređivati

U panelu (`/admin.html`) gore biraš stranicu/sekciju. Uredivo je **sve** što se mijenja:

- **Katalog ponude** — kategorije, grupe, stavke (naziv + sastojci/napomena), ikone.
- **Tekstovi** — svi tekstovi na svim stranicama (naslovi, opisi, uvodi, adresa…).
- **Događaji** — kartice u sekciji "Novosti" na početnoj (npr. Music Night, Party Night).
- **Slike** — sve fotografije na stranicama (hero, atmosfera, sekcije) + **učitavanje** novih.
- **Galerija** — pločice galerije (2 fotke svaka) + učitavanje novih.
- **Pitanja (FAQ)** — grupe i pitanja/odgovori na stranici Pitanja.
- **Kontakt i mreže** — e-mail i linkovi Instagrama/Facebooka (primjenjuju se svugdje).
- **Radno vrijeme** — po danima (pokreće i "otvoreno sada" i Google podatke).
- **SEO** — naslov i opis svake stranice za Google i dijeljenje.

Samo raspored i animacije (kako se stvari miču) su dio dizajna/koda — to nije "sadržaj".

**Učitavanje slika** radi izravno samo na hostingu s PHP-om. Na hostingu bez PHP-a (kao GitHub
Pages) sliku prvo ručno staviš u `assets/images/` pa u polju upišeš njenu putanju.

## Kako radi spremanje (dvije situacije)

Panel sam prepozna gdje je postavljen:

### 1. Hosting s PHP-om (npr. cPanel / shared hosting) — **preporučeno**
- Otvoriš `/admin.html`, upišeš lozinku, urediš i klikneš **Spremi promjene**.
- Izmjena se **odmah** upiše u `data/*.json` na hostingu i vidljiva je na stranici.
- **Lozinka:** NIJE u kodu (da ne bude javna na GitHubu). `save.php` je čita iz datoteke
  **`cms-lozinka.php`**. Ta datoteka se ne stavlja na GitHub — kad prebaciš projekt na PHP
  hosting, provjeri da je `cms-lozinka.php` tamo (ima primjer u `cms-lozinka.example.php`:
  preimenuj ga u `cms-lozinka.php` i upiši svoju lozinku). Lozinku možeš promijeniti bilo
  kad — samo uredi tu datoteku.

### 2. Hosting bez PHP-a (npr. GitHub Pages)
- Panel radi u **načinu izvoza**: urediš normalno, a klik na **Spremi promjene**
  **preuzme** izmijenjene datoteke.
- Za svaku preuzetu datoteku: makni `data__` iz imena (npr. `data__cjenik.json` →
  `cjenik.json`) i **uploadaj je u mapu `data/`** na hostingu (zamijeni postojeću).
- Stranica se osvježi čim datoteke zamijeniš.

## Selidba na drugi hosting

Uploadaj **cijeli projekt** (sve datoteke i mape) na novi hosting. CMS radi odmah:
- ako novi hosting ima PHP → izravno spremanje (samo provjeri lozinku u `save.php`),
- ako nema → način izvoza.

Ništa nije vezano za jedan konkretni server.

## Gdje su podaci

- `data/cjenik.json` — katalog
- `data/tekstovi.json` — tekstovi stranica
- `data/dogadjaji.json` — događaji na početnoj

Javne stranice čitaju te datoteke; ako ih iz nekog razloga ne mogu učitati, prikažu
ugrađeni (statični) sadržaj kao rezervu, pa stranica nikad ne ostane prazna.
