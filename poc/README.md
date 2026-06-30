# POC — Strategic Lakehouse (medallion Bronze → Silver → Gold)

Prototype minimal **de bout en bout** démontrant l'architecture Lakehouse de
GlobalTrade Solutions : ingestion de 3 silos → nettoyage → agrégats métier →
**API BI** + **dashboard accessible**.

Stack : **DuckDB + Parquet** (moteur Lakehouse) · **FastAPI** (API JSON) · HTML/JS (UI accessible).

## Architecture du flux

```
                 generate_data.py
   3 silos CSV ───────────────────────┐
   (ERP / CRM / Analytics)            │
                                       ▼
   BRONZE   ingestion brute, 0 transfo, +métadonnées de traçabilité
   (bronze.py)                         │  lakehouse/bronze/*.parquet
                                       ▼
   SILVER   typage, dates multi-format, dédoublonnage, filtres qualité
   (silver.py)                         │  lakehouse/silver/*.parquet
                                       ▼
   GOLD     agrégats métier / KPI (CA, top produits, risque stock…)
   (gold.py)                           │  lakehouse/gold/*.parquet
                                       ▼
   API      FastAPI lit Gold (Parquet) et expose les KPI en JSON
   (api.py)                            │
                                       ▼
   UI       dashboard accessible (RGAA / WCAG)
   (web/index.html)
```

## Démarrage (reproductible)

```bash
cd poc
python -m venv .venv && source .venv/bin/activate     # optionnel
pip install -r requirements.txt

# 1) Construire le Lakehouse (Bronze → Silver → Gold)
python src/pipeline.py

# 2) Lancer l'API + le dashboard
uvicorn src.api:app --reload
```

Puis ouvrir :

| URL | Contenu |
|-----|---------|
| http://127.0.0.1:8000/             | Dashboard BI accessible |
| http://127.0.0.1:8000/docs         | Swagger UI (idéal pour la **démo live**) |
| http://127.0.0.1:8000/api/kpi/revenue/monthly | KPI CA mensuel (JSON) |

## Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | État du service + disponibilité Gold |
| GET | `/api/kpi/summary` | CA total, commandes, alertes stock |
| GET | `/api/kpi/revenue/monthly` | CA et commandes par mois |
| GET | `/api/kpi/revenue/by-country` | CA par pays |
| GET | `/api/kpi/revenue/by-channel` | CA par canal |
| GET | `/api/kpi/revenue/by-segment` | CA par segment client (ventes × CRM) |
| GET | `/api/products/top?limit=N` | Top N produits par CA |
| GET | `/api/stock/at-risk` | Produits sous le point de réappro |

## Qualité des données (ce que fait la couche Silver)

Les données source sont **volontairement imparfaites** pour rendre la couche
Silver démontrable :

- formats de dates hétérogènes (`2024-01-05` et `05/01/2024`) → parsing robuste ;
- ~1,5 % de doublons d'ingestion (ERP) et ~2 % (Analytics) → dédoublonnage ;
- quantités négatives (retours mal codés) → écartées du CA ;
- prix unitaires manquants → ré-imputés depuis le référentiel produits ;
- casse incohérente des segments CRM → normalisée.

## Accessibilité (RGAA / WCAG)

Le dashboard (`web/index.html`) applique :
- **HTML sémantique** (`<header>`, `<main>`, `<h1>`, `<th scope>`, `<caption>`, `<label>`) ;
- **contrastes AA** (ratio ≥ 4,5:1) ;
- **navigation clavier intégrale** + focus visible + lien d'évitement (skip link) ;
- annonces dynamiques via `aria-live` (statut de chargement).

## Structure

```
poc/
├── requirements.txt
├── src/
│   ├── generate_data.py   # simulation des 3 silos
│   ├── bronze.py          # ingestion brute
│   ├── silver.py          # nettoyage / typage / dédoublonnage
│   ├── gold.py            # agrégats KPI
│   ├── pipeline.py        # orchestrateur Bronze→Silver→Gold
│   └── api.py             # API FastAPI (lecture Gold)
├── web/
│   └── index.html         # dashboard accessible
├── data/                  # CSV générés (gitignored, reproductibles)
└── lakehouse/             # Parquet bronze/silver/gold (gitignored)
```
