"""
API BI — couche Gold exposée en JSON (FastAPI).

Lit les tables Gold (Parquet) via DuckDB et expose les KPI métier.
Sert également le dashboard accessible (poc/web/index.html) à la racine.

Lancement :
    cd poc
    uvicorn src.api:app --reload
    -> http://127.0.0.1:8000           (dashboard)
    -> http://127.0.0.1:8000/docs      (Swagger / démo live)
    -> http://127.0.0.1:8000/api/kpi/revenue/monthly
"""
from __future__ import annotations

from decimal import Decimal
from pathlib import Path

import duckdb
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parents[1]
GOLD = ROOT / "lakehouse" / "gold"
WEB = ROOT / "web"

app = FastAPI(
    title="GlobalTrade — Strategic Lakehouse API",
    description="Expose les KPI de la couche Gold du Lakehouse (POC medallion).",
    version="1.0.0",
)


def query_gold(table: str, order_limit: str = "") -> list[dict]:
    """Lit une table Gold Parquet et renvoie une liste de dicts."""
    path = GOLD / f"{table}.parquet"
    if not path.exists():
        raise HTTPException(
            status_code=503,
            detail=f"Table Gold '{table}' absente. Lancez d'abord : python src/pipeline.py",
        )
    con = duckdb.connect()
    rel = con.execute(f"SELECT * FROM read_parquet('{path.as_posix()}') {order_limit}")
    cols = [c[0] for c in rel.description]

    def conv(v):  # DECIMAL -> float pour un JSON numérique propre
        return float(v) if isinstance(v, Decimal) else v

    return [{c: conv(v) for c, v in zip(cols, row)} for row in rel.fetchall()]


@app.get("/health", tags=["meta"])
def health() -> dict:
    """État du service et disponibilité de la couche Gold."""
    ready = GOLD.exists() and any(GOLD.glob("*.parquet"))
    return {"status": "ok", "gold_ready": ready}


@app.get("/api/kpi/revenue/monthly", tags=["kpi"])
def revenue_monthly() -> list[dict]:
    """Chiffre d'affaires et nombre de commandes par mois."""
    return query_gold("kpi_revenue_monthly", "ORDER BY month")


@app.get("/api/kpi/revenue/by-country", tags=["kpi"])
def revenue_by_country() -> list[dict]:
    """Chiffre d'affaires par pays."""
    return query_gold("kpi_revenue_by_country", "ORDER BY revenue DESC")


@app.get("/api/kpi/revenue/by-channel", tags=["kpi"])
def revenue_by_channel() -> list[dict]:
    """Chiffre d'affaires par canal de vente."""
    return query_gold("kpi_revenue_by_channel", "ORDER BY revenue DESC")


@app.get("/api/kpi/revenue/by-segment", tags=["kpi"])
def revenue_by_segment() -> list[dict]:
    """Chiffre d'affaires par segment client (jointure ventes x CRM)."""
    return query_gold("kpi_revenue_by_segment", "ORDER BY revenue DESC")


@app.get("/api/products/top", tags=["kpi"])
def top_products(limit: int = Query(10, ge=1, le=40)) -> list[dict]:
    """Top N produits par chiffre d'affaires."""
    return query_gold("kpi_top_products", f"ORDER BY revenue DESC LIMIT {limit}")


@app.get("/api/stock/at-risk", tags=["kpi"])
def stock_at_risk() -> list[dict]:
    """Produits sous le point de réapprovisionnement (risque de rupture)."""
    return query_gold("kpi_stock_at_risk", "ORDER BY shortfall DESC")


@app.get("/api/kpi/summary", tags=["kpi"])
def summary() -> dict:
    """Agrégat de tête pour le dashboard (CA total, commandes, alertes stock)."""
    monthly = query_gold("kpi_revenue_monthly")
    risk = query_gold("kpi_stock_at_risk")
    total_rev = round(sum(r["revenue"] for r in monthly), 2)
    total_orders = sum(r["orders"] for r in monthly)
    return {
        "total_revenue": total_rev,
        "total_orders": total_orders,
        "months_covered": len(monthly),
        "stock_alerts": len(risk),
    }


# --------------------------------------------------------------------------- #
# Dashboard accessible servi à la racine
# --------------------------------------------------------------------------- #
@app.get("/", include_in_schema=False, response_model=None)
def dashboard() -> FileResponse | JSONResponse:
    index = WEB / "index.html"
    if not index.exists():
        return JSONResponse({"message": "API up. Dashboard absent."}, status_code=200)
    return FileResponse(index)


if WEB.exists():
    app.mount("/web", StaticFiles(directory=WEB), name="web")
