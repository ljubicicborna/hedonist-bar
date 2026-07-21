# Uređivanje stranice (CMS) — upute

Stranica ima ugrađen panel za uređivanje na **`/admin.html`**. Sve je dio projekta i
putuje s njim — nema vanjskih servisa, ništa se ne plaća, radi na bilo kojem hostingu.

## Što se može uređivati

- **Katalog ponude** — kategorije, grupe, stavke (naziv + sastojci/napomena), ikone.
- **Tekstovi** — opisi na početnoj (Misija-vizija, Katalog, Po danu, Atmosfera), uvod na
  katalogu, tekstovi na Zapošljavanju.
- **Događaji** — kartice u sekciji "Novosti" na početnoj (npr. Music Night, Party Night).

Naslovi, raspored, animacije i fotografije su dio dizajna (koda) — ne uređuju se ovdje.

## Kako radi spremanje (dvije situacije)

Panel sam prepozna gdje je postavljen:

### 1. Hosting s PHP-om (npr. cPanel / shared hosting) — **preporučeno**
- Otvoriš `/admin.html`, upišeš lozinku, urediš i klikneš **Spremi promjene**.
- Izmjena se **odmah** upiše u `data/*.json` na hostingu i vidljiva je na stranici.
- **Prije objave postavi lozinku:** otvori datoteku **`save.php`** i promijeni red
  `$PASSWORD = 'promijeni-me';` u svoju lozinku.

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
