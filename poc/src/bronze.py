"""
Couche BRONZE — ingestion brute.

Principe medallion : on charge les fichiers source TELS QUELS (aucune
transformation métier), en ajoutant uniquement des métadonnées de traçabilité
(_source_system, _source_file, _ingested_at). Tout est conservé en texte pour
ne perdre aucune information et pouvoir rejouer l'historique.

Source -> poc/lakehouse/bronze/<table>.parquet
"""
from __future__ import annotations

from pathlib import Path

import duckdb

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
BRONZE = ROOT / "lakehouse" / "bronze"

# table bronze -> (silo logique, chemin du CSV source)
SOURCES = {
    "erp_products":      ("ERP",       DATA / "erp" / "g_dim_products.csv"),
    "erp_sales":         ("ERP",       DATA / "erp" / "g_fact_sales.csv"),
    "erp_inventory":     ("ERP",       DATA / "erp" / "g_fact_inventory.csv"),
    "crm_customers":     ("CRM",       DATA / "crm" / "g_dim_customers.csv"),
    "crm_interactions":  ("CRM",       DATA / "crm" / "crm_interactions.csv"),
    "analytics_sales":   ("ANALYTICS", DATA / "analytics" / "sales_daily.csv"),
}


def run(con: duckdb.DuckDBPyConnection | None = None) -> None:
    con = con or duckdb.connect()
    BRONZE.mkdir(parents=True, exist_ok=True)
    print("BRONZE — ingestion brute :")
    for table, (system, csv_path) in SOURCES.items():
        if not csv_path.exists():
            raise FileNotFoundError(f"Source manquante : {csv_path} (lancez generate_data.py)")
        out = BRONZE / f"{table}.parquet"
        # all_varchar=true : on n'impose AUCUN typage en Bronze (raw fidèle).
        con.execute(
            f"""
            COPY (
                SELECT
                    *,
                    '{system}'            AS _source_system,
                    '{csv_path.name}'     AS _source_file,
                    now()                 AS _ingested_at
                FROM read_csv_auto('{csv_path.as_posix()}', all_varchar=true)
            ) TO '{out.as_posix()}' (FORMAT PARQUET);
            """
        )
        n = con.execute(f"SELECT count(*) FROM read_parquet('{out.as_posix()}')").fetchone()[0]
        print(f"  - {table:<18} {n:>6} lignes -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    run()
