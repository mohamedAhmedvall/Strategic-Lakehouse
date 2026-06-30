# Strategic Lakehouse — GlobalTrade Solutions

> *Une IA n'est réellement intelligente qu'à la hauteur des données fiables et
> structurées qu'on lui confie.*

Projet **M2 IA & Data Science** (La Plateforme). En tant que cabinet de conseil,
nous spécifions et prototypons une **architecture Lakehouse unifiée** pour la
société (fictive) **GlobalTrade Solutions**, dont le système d'information est
fragmenté en silos (ERP on-prem, CRM SaaS, fichiers analytiques).

Objectif : centraliser les données métier et exposer des **indicateurs BI à la
demande**, sur une base prête pour les futures couches d'IA agentique.

## Livrables

| # | Livrable | Emplacement |
|---|----------|-------------|
| 1 | Synthèse diagnostic + recommandation d'architecture | [`docs/01-diagnostic.md`](docs/01-diagnostic.md) |
| 2 | Spécification technique (modèle de données, CDC, matrice des risques, accessibilité) | [`docs/02-specification-technique.md`](docs/02-specification-technique.md) |
| 3 | Conception (schémas C4) + POC de bout en bout | [`docs/03-conception-c4.md`](docs/03-conception-c4.md) · [`poc/`](poc/) |
| 4 | Présentation soutenance (COMEX) | [`docs/04-soutenance.md`](docs/04-soutenance.md) |
| — | Roadmap interactive du projet | [`roadmap/index.html`](roadmap/index.html) |

## Le POC en 2 commandes

```bash
cd poc
pip install -r requirements.txt
python src/pipeline.py          # construit le Lakehouse Bronze → Silver → Gold
uvicorn src.api:app --reload    # API BI + dashboard accessible
```

→ Dashboard : http://127.0.0.1:8000 · API/démo : http://127.0.0.1:8000/docs

Détails et architecture du flux : [`poc/README.md`](poc/README.md).

## Approche medallion

```
Sources (3 silos)  ──►  BRONZE  ──►  SILVER  ──►  GOLD  ──►  API BI  ──►  Dashboard
  ERP / CRM / Files     brut         nettoyé      KPI        FastAPI       accessible
```

- **Bronze** : ingestion brute fidèle + traçabilité.
- **Silver** : typage, parsing dates multi-formats, dédoublonnage, contrôles qualité.
- **Gold** : agrégats métier prêts pour la BI et l'IA (CA, top produits, risque de rupture, vue 360 client).

## Stack technique

| Couche | Choix | Justification |
|--------|-------|---------------|
| Stockage / moteur | **DuckDB + Parquet** | Format colonnaire ouvert, SQL analytique, proche d'un vrai Lakehouse, sans infrastructure lourde. |
| API BI | **FastAPI** | Typage, doc Swagger auto-générée pour la démo live. |
| Restitution | HTML/JS sémantique | Dashboard conforme RGAA / WCAG. |

## Structure du dépôt

```
.
├── README.md
├── docs/            # livrables documentaires (Phases 1 → 4)
├── poc/             # prototype Lakehouse (code + API + UI)
└── roadmap/         # feuille de route interactive
```

---

*GlobalTrade Solutions est une entreprise fictive — projet pédagogique
M2 IA & Data Science.*
