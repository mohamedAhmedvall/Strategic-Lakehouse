"""
Couche SILVER — données nettoyées, typées, conformées.

Transformations appliquées (justifiées dans docs/02-specification-technique.md) :
  * typage explicite (dates, entiers, décimaux) ;
  * parsing des dates multi-formats (ISO + JJ/MM/AAAA) ;
  * dédoublonnage (clé naturelle) ;
  * filtrage des lignes invalides (quantités <= 0) ;
  * ré-imputation des prix unitaires manquants depuis le référentiel produits ;
  * normalisation des libellés (trim, casse des segments).

Bronze -> poc/lakehouse/silver/<table>.parquet
"""
from __future__ import annotations

from pathlib import Path

import duckdb

ROOT = Path(__file__).resolve().parents[1]
BRONZE = ROOT / "lakehouse" / "bronze"
SILVER = ROOT / "lakehouse" / "silver"


def _b(table: str) -> str:
    return f"read_parquet('{(BRONZE / f'{table}.parquet').as_posix()}')"


def _save(con: duckdb.DuckDBPyConnection, name: str, select_sql: str) -> None:
    out = SILVER / f"{name}.parquet"
    con.execute(f"COPY ({select_sql}) TO '{out.as_posix()}' (FORMAT PARQUET);")
    n = con.execute(f"SELECT count(*) FROM read_parquet('{out.as_posix()}')").fetchone()[0]
    print(f"  - {name:<16} {n:>6} lignes")


# Parsing de date robuste : essaie ISO puis JJ/MM/AAAA.
PARSE_DATE = (
    "coalesce(try_strptime({col}, '%Y-%m-%d'), "
    "try_strptime({col}, '%d/%m/%Y'))::DATE"
)

# DuckDB n'a pas initcap : capitalisation d'un mot simple (Enterprise, Electronics).
TITLE_CASE = "upper(substr(trim({col}),1,1)) || lower(substr(trim({col}),2))"


def run(con: duckdb.DuckDBPyConnection | None = None) -> None:
    con = con or duckdb.connect()
    SILVER.mkdir(parents=True, exist_ok=True)
    print("SILVER — nettoyage / typage / dédoublonnage :")

    # dim_products : typage des montants, trim des libellés.
    _save(con, "dim_products", f"""
        SELECT DISTINCT
            trim(product_id)                       AS product_id,
            trim(product_name)                     AS product_name,
            {TITLE_CASE.format(col='category')}    AS category,
            CAST(unit_cost AS DECIMAL(10,2))       AS unit_cost,
            CAST(unit_price AS DECIMAL(10,2))      AS unit_price,
            upper(trim(supplier_country))          AS supplier_country
        FROM {_b('erp_products')}
    """)

    # dim_customers : normalisation casse du segment, email nettoyé.
    _save(con, "dim_customers", f"""
        SELECT DISTINCT
            trim(customer_id)                      AS customer_id,
            trim(customer_name)                    AS customer_name,
            {TITLE_CASE.format(col='segment')}     AS segment,
            upper(trim(country))                   AS country,
            {PARSE_DATE.format(col='signup_date')} AS signup_date,
            nullif(trim(email), '')                AS email
        FROM {_b('crm_customers')}
    """)

    # fact_sales : cœur du nettoyage.
    #   - dates multi-formats -> DATE
    #   - dédoublonnage sur sale_id (garde 1 occurrence)
    #   - quantité > 0 uniquement (les retours négatifs sont écartés du CA)
    #   - prix manquant ré-imputé depuis dim_products
    _save(con, "fact_sales", f"""
        WITH parsed AS (
            SELECT
                trim(sale_id)                              AS sale_id,
                trim(product_id)                           AS product_id,
                trim(customer_id)                          AS customer_id,
                {PARSE_DATE.format(col='sale_date')}       AS sale_date,
                TRY_CAST(quantity AS INTEGER)              AS quantity,
                TRY_CAST(nullif(trim(unit_price), '') AS DECIMAL(10,2)) AS unit_price_raw,
                upper(trim(channel))                       AS channel,
                upper(trim(country))                       AS country,
                row_number() OVER (PARTITION BY trim(sale_id) ORDER BY 1) AS rn
            FROM {_b('erp_sales')}
        )
        SELECT
            p.sale_id, p.product_id, p.customer_id, p.sale_date, p.quantity,
            coalesce(p.unit_price_raw, d.unit_price)       AS unit_price,
            ROUND(p.quantity * coalesce(p.unit_price_raw, d.unit_price), 2) AS line_amount,
            p.channel, p.country
        FROM parsed p
        LEFT JOIN read_parquet('{(SILVER / 'dim_products.parquet').as_posix()}') d
               ON p.product_id = d.product_id
        WHERE p.rn = 1
          AND p.quantity IS NOT NULL AND p.quantity > 0
          AND p.sale_date IS NOT NULL
    """)

    # fact_inventory : typage des stocks (domaine métier n°2).
    _save(con, "fact_inventory", f"""
        SELECT DISTINCT
            {PARSE_DATE.format(col='snapshot_date')}  AS snapshot_date,
            trim(product_id)                          AS product_id,
            upper(trim(warehouse))                    AS warehouse,
            TRY_CAST(stock_qty AS INTEGER)            AS stock_qty,
            TRY_CAST(reorder_point AS INTEGER)        AS reorder_point
        FROM {_b('erp_inventory')}
        WHERE TRY_CAST(stock_qty AS INTEGER) IS NOT NULL
    """)

    # crm_interactions : typage des dates.
    _save(con, "crm_interactions", f"""
        SELECT DISTINCT
            trim(interaction_id)                          AS interaction_id,
            trim(customer_id)                             AS customer_id,
            {PARSE_DATE.format(col='interaction_date')}   AS interaction_date,
            upper(trim(channel))                          AS channel,
            upper(trim(interaction_type))                 AS interaction_type
        FROM {_b('crm_interactions')}
    """)


if __name__ == "__main__":
    run()
