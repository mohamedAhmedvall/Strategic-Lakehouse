"""
Couche GOLD — agrégats métier prêts pour la BI / l'IA.

Chaque table Gold répond à une question business et alimente directement
l'API et le dashboard. Modélisation orientée KPI (un fait conformé Silver ->
plusieurs marts d'agrégation).

Silver -> poc/lakehouse/gold/<kpi>.parquet
"""
from __future__ import annotations

from pathlib import Path

import duckdb

ROOT = Path(__file__).resolve().parents[1]
SILVER = ROOT / "lakehouse" / "silver"
GOLD = ROOT / "lakehouse" / "gold"


def _s(table: str) -> str:
    return f"read_parquet('{(SILVER / f'{table}.parquet').as_posix()}')"


def _save(con: duckdb.DuckDBPyConnection, name: str, select_sql: str) -> None:
    out = GOLD / f"{name}.parquet"
    con.execute(f"COPY ({select_sql}) TO '{out.as_posix()}' (FORMAT PARQUET);")
    n = con.execute(f"SELECT count(*) FROM read_parquet('{out.as_posix()}')").fetchone()[0]
    print(f"  - {name:<22} {n:>5} lignes")


def run(con: duckdb.DuckDBPyConnection | None = None) -> None:
    con = con or duckdb.connect()
    GOLD.mkdir(parents=True, exist_ok=True)
    print("GOLD — agrégats métier (KPI) :")

    # CA mensuel (KPI principal exposé en démo).
    _save(con, "kpi_revenue_monthly", f"""
        SELECT
            strftime(sale_date, '%Y-%m')   AS month,
            COUNT(*)                       AS orders,
            ROUND(SUM(line_amount), 2)     AS revenue
        FROM {_s('fact_sales')}
        GROUP BY 1 ORDER BY 1
    """)

    # CA par pays.
    _save(con, "kpi_revenue_by_country", f"""
        SELECT country,
               COUNT(*)                    AS orders,
               ROUND(SUM(line_amount), 2)  AS revenue
        FROM {_s('fact_sales')}
        GROUP BY 1 ORDER BY revenue DESC
    """)

    # CA par canal.
    _save(con, "kpi_revenue_by_channel", f"""
        SELECT channel,
               COUNT(*)                    AS orders,
               ROUND(SUM(line_amount), 2)  AS revenue
        FROM {_s('fact_sales')}
        GROUP BY 1 ORDER BY revenue DESC
    """)

    # Top produits par chiffre d'affaires.
    _save(con, "kpi_top_products", f"""
        SELECT
            s.product_id,
            p.product_name,
            p.category,
            SUM(s.quantity)                AS units_sold,
            ROUND(SUM(s.line_amount), 2)   AS revenue
        FROM {_s('fact_sales')} s
        LEFT JOIN {_s('dim_products')} p ON s.product_id = p.product_id
        GROUP BY 1, 2, 3 ORDER BY revenue DESC
    """)

    # Risque de rupture : dernier snapshot de stock sous le point de réappro.
    _save(con, "kpi_stock_at_risk", f"""
        WITH latest AS (
            SELECT *, row_number() OVER (
                       PARTITION BY product_id, warehouse
                       ORDER BY snapshot_date DESC) AS rn
            FROM {_s('fact_inventory')}
        )
        SELECT
            l.product_id, p.product_name, l.warehouse,
            l.stock_qty, l.reorder_point,
            (l.reorder_point - l.stock_qty) AS shortfall
        FROM latest l
        LEFT JOIN {_s('dim_products')} p ON l.product_id = p.product_id
        WHERE l.rn = 1 AND l.stock_qty < l.reorder_point
        ORDER BY shortfall DESC
    """)

    # Vue 360 client : CA par segment (jointure ventes x CRM).
    _save(con, "kpi_revenue_by_segment", f"""
        SELECT
            c.segment,
            COUNT(DISTINCT s.customer_id)  AS active_customers,
            ROUND(SUM(s.line_amount), 2)   AS revenue
        FROM {_s('fact_sales')} s
        LEFT JOIN {_s('dim_customers')} c ON s.customer_id = c.customer_id
        GROUP BY 1 ORDER BY revenue DESC
    """)


if __name__ == "__main__":
    run()
