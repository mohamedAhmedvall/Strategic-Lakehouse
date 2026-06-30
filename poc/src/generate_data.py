"""
Génère un jeu de données simulant les 3 silos de GlobalTrade Solutions.

Inspiré du dataset commercial fragmenté du sujet (g_dim_products, g_fact_sales,
g_dim_customers...). Les données sont VOLONTAIREMENT imparfaites (doublons,
formats de dates hétérogènes, valeurs manquantes, quantités négatives, casse
incohérente) afin de justifier le travail de nettoyage de la couche Silver.

Sorties (CSV) :
  poc/data/erp/       -> silo ERP on-prem      (produits, ventes, stocks)
  poc/data/crm/       -> silo CRM SaaS          (clients, interactions)
  poc/data/analytics/ -> silo fichiers analytiques (ventes agrégées)
"""
from __future__ import annotations

import csv
import random
from datetime import date, timedelta
from pathlib import Path

# Déterministe : la démo doit être reproductible (cf. README).
random.seed(42)

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

CATEGORIES = ["Electronics", "Home", "Sports", "Toys", "Grocery"]
CHANNELS = ["WEB", "STORE", "MOBILE", "PARTNER"]
COUNTRIES = ["FR", "DE", "ES", "IT", "BE"]
SEGMENTS = ["SMB", "Enterprise", "Retail"]

START = date(2024, 1, 1)
END = date(2025, 12, 31)
N_PRODUCTS = 40
N_CUSTOMERS = 200
N_SALES = 6000
N_INTERACTIONS = 1500


def _rand_date(start: date, end: date) -> date:
    return start + timedelta(days=random.randint(0, (end - start).days))


def _write_csv(path: Path, header: list[str], rows: list[list]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(header)
        w.writerows(rows)
    print(f"  - {path.relative_to(ROOT)} ({len(rows)} lignes)")


# --------------------------------------------------------------------------- #
# Silo 1 — ERP on-prem (GlobalTrade ERP)
# --------------------------------------------------------------------------- #
def gen_erp() -> tuple[list[str], list[str]]:
    # g_dim_products
    products, product_ids = [], []
    for i in range(1, N_PRODUCTS + 1):
        pid = f"P{i:04d}"
        product_ids.append(pid)
        cost = round(random.uniform(2, 200), 2)
        price = round(cost * random.uniform(1.3, 2.5), 2)
        products.append([
            pid,
            f"{random.choice(['Wireless','Smart','Classic','Pro','Eco'])} "
            f"{random.choice(['Mouse','Lamp','Ball','Cube','Mug','Bottle','Drone'])}",
            random.choice(CATEGORIES),
            cost,
            price,
            random.choice(["CN", "FR", "DE", "PL", "VN"]),
        ])
    _write_csv(
        DATA / "erp" / "g_dim_products.csv",
        ["product_id", "product_name", "category", "unit_cost", "unit_price", "supplier_country"],
        products,
    )

    # g_dim_customers vit dans le CRM ; ici on génère seulement les ID partagés
    customer_ids = [f"C{i:04d}" for i in range(1, N_CUSTOMERS + 1)]

    # g_fact_sales (messy)
    price_lookup = {p[0]: p[4] for p in products}
    sales = []
    for i in range(1, N_SALES + 1):
        pid = random.choice(product_ids)
        d = _rand_date(START, END)
        # formats de date hétérogènes selon l'export
        if random.random() < 0.25:
            sale_date = d.strftime("%d/%m/%Y")
        else:
            sale_date = d.isoformat()
        qty = random.randint(1, 12)
        # 2% de quantités aberrantes (retours mal codés)
        if random.random() < 0.02:
            qty = -qty
        unit_price = price_lookup[pid]
        # 3% de prix manquants (à ré-imputer en Silver)
        up_field = "" if random.random() < 0.03 else unit_price
        sales.append([
            f"S{i:06d}", pid, random.choice(customer_ids), sale_date,
            qty, up_field, random.choice(CHANNELS), random.choice(COUNTRIES),
        ])
    # 1.5% de doublons exacts (rejeu d'ingestion ERP)
    dupes = random.sample(sales, k=int(len(sales) * 0.015))
    sales.extend(dupes)
    random.shuffle(sales)
    _write_csv(
        DATA / "erp" / "g_fact_sales.csv",
        ["sale_id", "product_id", "customer_id", "sale_date", "quantity", "unit_price", "channel", "country"],
        sales,
    )

    # g_fact_inventory (stocks) — domaine métier n°2
    inventory = []
    snapshots = [START + timedelta(days=30 * m) for m in range(0, 24)]
    for snap in snapshots:
        for pid in product_ids:
            stock = random.randint(0, 500)
            reorder = random.choice([20, 50, 100])
            inventory.append([snap.isoformat(), pid, random.choice(["WH-PAR", "WH-LYO", "WH-LIL"]), stock, reorder])
    _write_csv(
        DATA / "erp" / "g_fact_inventory.csv",
        ["snapshot_date", "product_id", "warehouse", "stock_qty", "reorder_point"],
        inventory,
    )
    return product_ids, customer_ids


# --------------------------------------------------------------------------- #
# Silo 2 — CRM SaaS (GlobalTrade CRM Cloud)
# --------------------------------------------------------------------------- #
def gen_crm(customer_ids: list[str]) -> None:
    customers = []
    for cid in customer_ids:
        name = f"{random.choice(['Acme','Globex','Initech','Umbrella','Soylent','Hooli'])} "\
               f"{random.choice(['SARL','GmbH','SA','Ltd','SAS'])}"
        # casse incohérente sur le segment (Enterprise / enterprise / ENTERPRISE)
        seg = random.choice(SEGMENTS)
        seg = random.choice([seg, seg.lower(), seg.upper()])
        # 4% d'emails manquants
        email = "" if random.random() < 0.04 else f"contact@{name.split()[0].lower()}.example"
        customers.append([
            cid, name, seg, random.choice(COUNTRIES),
            _rand_date(date(2020, 1, 1), date(2023, 12, 31)).isoformat(), email,
        ])
    _write_csv(
        DATA / "crm" / "g_dim_customers.csv",
        ["customer_id", "customer_name", "segment", "country", "signup_date", "email"],
        customers,
    )

    interactions = []
    for i in range(1, N_INTERACTIONS + 1):
        interactions.append([
            f"I{i:06d}", random.choice(customer_ids),
            _rand_date(START, END).isoformat(),
            random.choice(["EMAIL", "CALL", "CHAT", "MEETING"]),
            random.choice(["SUPPORT", "SALES", "ONBOARDING", "CHURN_RISK"]),
        ])
    _write_csv(
        DATA / "crm" / "crm_interactions.csv",
        ["interaction_id", "customer_id", "interaction_date", "channel", "interaction_type"],
        interactions,
    )


# --------------------------------------------------------------------------- #
# Silo 3 — Fichiers analytiques (GlobalTrade Analytics)
# --------------------------------------------------------------------------- #
def gen_analytics() -> None:
    # Export agrégé dérivé des ventes, avec son propre lot de doublons.
    rows = []
    cur = START
    while cur <= END:
        for ch in CHANNELS:
            for co in COUNTRIES:
                if random.random() < 0.35:  # tous les couples ne sont pas exportés chaque jour
                    rows.append([
                        cur.isoformat(), ch, co,
                        round(random.uniform(100, 8000), 2),
                        random.randint(1, 60),
                    ])
        cur += timedelta(days=1)
    dupes = random.sample(rows, k=int(len(rows) * 0.02))
    rows.extend(dupes)
    _write_csv(
        DATA / "analytics" / "sales_daily.csv",
        ["date", "channel", "country", "gross_amount", "orders"],
        rows,
    )


def main() -> None:
    print("Génération des données source (3 silos)…")
    product_ids, customer_ids = gen_erp()
    gen_crm(customer_ids)
    gen_analytics()
    print("Terminé.")


if __name__ == "__main__":
    main()
