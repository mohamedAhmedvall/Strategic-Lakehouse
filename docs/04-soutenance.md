# Phase 4 — Présentation (soutenance COMEX)

**Format :** 20 min de présentation + 10 min de questions jury.
**Mise en scène :** restitution d'un **cabinet de conseil** devant le **CTO** et
le **CDO** (fictifs) de GlobalTrade Solutions.
**Livrable :** deck de 15 à 20 slides.
**Trame imposée :** problématique → analyse → choix → architecture → démonstration POC → recommandations.

---

## 1. Trame du deck (18 slides)

| # | Slide | Message clé | Appui |
|---|-------|-------------|-------|
| 1 | **Couverture** | « Strategic Lakehouse — du SI silotée à la décision augmentée par l'IA » | Cabinet de conseil / GlobalTrade |
| 2 | **Le constat** | Un SI fragmenté en 3 silos qui bloque l'analytique et l'IA | Carto fonctionnelle (`docs/01` §2.1) |
| 3 | **Problématique** | « Comment unifier la donnée pour décider vite et préparer l'IA ? » | Citation : *l'IA vaut ce que valent ses données* |
| 4 | **Analyse — cartographie** | Les 3 silos (ERP / CRM / Analytics) et leurs données | Carto applicative (`docs/01` §2.2) |
| 5 | **Analyse — impacts** | Pas de vue 360, KPI incohérents, risque RGPD, latence | Tableau d'impacts (`docs/01` §3) |
| 6 | **Approche data-driven** | Unifier → gouverner → exposer → industrialiser | Data maturity model |
| 7 | **Choix — comparatif** | DW Cloud vs Data Lake vs Lakehouse (5 critères) | Tableau comparatif (`docs/01` §5) |
| 8 | **Choix — recommandation** | **Lakehouse** : 3 arguments stratégiques | `docs/01` §6 |
| 9 | **Architecture — contexte (C4-1)** | Le Lakehouse, point d'intégration unique | Schéma C4 niveau 1 (`docs/03` §1) |
| 10 | **Architecture — composants (C4-2/3)** | Medallion Bronze/Silver/Gold + API + UI | Schéma composants (`docs/03` §2) |
| 11 | **Architecture — flux d'ingestion** | Une vente, du brut au KPI | Séquence d'ingestion (`docs/03` §3) |
| 12 | **Modèle de données** | Tables Bronze/Silver/Gold, 2 domaines (ventes, stocks) | `docs/02` §1 |
| 13 | **Spécification** | CDC (MoSCoW) + matrice des 5 risques | `docs/02` §2-3 |
| 14 | **Démonstration POC** ▶ | Live : pipeline + `GET /api/kpi/revenue/monthly` | `poc/` (ou vidéo de secours) |
| 15 | **Démonstration — dashboard** | KPI restitués dans une UI **accessible** | `poc/web/index.html` |
| 16 | **Recommandation — accessibilité = adoption** | L'accessibilité augmente l'adoption et réduit la dette de conformité | `docs/02` §4.3 |
| 17 | **Trajectoire & next steps** | CDC temps réel, sécurité API (OAuth2), couche IA agentique | Roadmap |
| 18 | **Synthèse & questions** | Un socle unique, gouverné, économique, ouvert | — |

---

## 2. Script de la démonstration live (slide 14-15)

> Objectif : prouver que le concept Lakehouse **fonctionne**, en < 3 minutes.

```bash
cd poc
python src/pipeline.py        # 1. construit Bronze → Silver → Gold (montrer les compteurs de lignes)
uvicorn src.api:app --reload  # 2. démarre l'API
```

1. Ouvrir **http://127.0.0.1:8000/docs** → exécuter `GET /api/kpi/revenue/monthly`
   → montrer le **JSON** (CA mensuel fiabilisé).
2. Ouvrir **http://127.0.0.1:8000/** → le **dashboard** affiche synthèse, CA par
   pays, top produits, alertes stock.
3. **Preuve d'accessibilité** : naviguer **au clavier** (Tab), montrer le focus
   visible et le lien d'évitement.

> **Filet de sécurité :** enregistrer une **capture vidéo** de cette séquence
> (exigée par le sujet en cas d'instabilité technique). La démo doit être
> reproductible depuis le README.

---

## 3. Point recommandation : « accessibilité = adoption » (slide 16)

- L'accessibilité du SI **augmente l'adoption** de l'outil par **l'ensemble** des
  collaborateurs de GlobalTrade, pas seulement les utilisateurs en situation de
  handicap (PSH).
- Intégrée **dès la conception**, elle **réduit la dette technique de conformité**
  (pas de coûteuse remise à niveau ultérieure).
- C'est un **levier business**, pas une contrainte réglementaire : meilleure
  adoption ⇒ meilleur ROI du Lakehouse.

---

## 4. Préparation à la justification orale (Q&A jury)

**Question attendue :** *« Quel est l'impact de l'asynchronisme / de la
fragmentation des données sur l'accès à l'information pour un utilisateur en
situation de handicap ? »*

**Éléments de réponse :**
- La **fragmentation** oblige l'utilisateur à consulter plusieurs outils aux
  ergonomies différentes : pour un utilisateur PSH (lecteur d'écran, navigation
  clavier), chaque interface non accessible est un **point de blocage** ; multiplier
  les sources multiplie les obstacles.
- L'**asynchronisme** (données batch, KPI recalculés) crée des **incohérences**
  temporelles : un utilisateur s'appuyant sur une synthèse vocale ne peut pas
  « scanner visuellement » pour repérer une donnée périmée — il dépend d'une
  **source unique, fiable et à jour**.
- Le **Lakehouse répond aux deux** : une **source unique gouvernée** (fin de la
  fragmentation) exposée via **une seule API et un dashboard accessible** (fin de
  la dispersion ergonomique), avec des données **fiabilisées** (fin des
  incohérences de l'asynchronisme).

**Autres questions probables & réponses courtes :**
- *Pourquoi pas un Data Warehouse ?* → Excellent en BI mais ferme la porte à
  l'IA, coûte cher et verrouille ; le Lakehouse fait BI **et** IA sur du Parquet ouvert.
- *Comment garantir le RGPD ?* → Traçabilité Bronze, droits par couche,
  pseudonymisation en Gold, rétention définie (cf. matrice risques R1).
- *Pourquoi DuckDB dans le POC ?* → Démontre le concept Lakehouse (SQL analytique
  + Parquet) sans infra ; en production : moteur distribué + table format ACID.

---

## 5. Répétition & timing

| Bloc | Slides | Durée cible |
|------|--------|-------------|
| Problématique + analyse | 1-6 | 6 min |
| Choix + architecture | 7-13 | 8 min |
| **Démonstration POC** | 14-15 | 4 min |
| Recommandations + synthèse | 16-18 | 2 min |
| **Questions jury** | — | 10 min |

✅ Vérifier : démo répétée 2 fois, vidéo de secours prête, rôles répartis
(qui parle / qui pilote la démo), réponses Q&A maîtrisées.
