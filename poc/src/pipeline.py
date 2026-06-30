"""
Orchestrateur du pipeline Lakehouse de bout en bout :

    generate_data -> BRONZE -> SILVER -> GOLD

Usage :
    python -m src.pipeline            # depuis poc/
    python src/pipeline.py            # depuis poc/

Toutes les étapes partagent une même connexion DuckDB en mémoire.
"""
from __future__ import annotations

import duckdb

import generate_data
import bronze
import silver
import gold


def main() -> None:
    print("=" * 60)
    print("PIPELINE STRATEGIC LAKEHOUSE — Bronze -> Silver -> Gold")
    print("=" * 60)
    generate_data.main()
    con = duckdb.connect()
    bronze.run(con)
    silver.run(con)
    gold.run(con)
    print("=" * 60)
    print("Pipeline terminé. Données Gold prêtes pour l'API.")
    print("Lancez l'API : uvicorn src.api:app --reload  (puis http://127.0.0.1:8000)")
    print("=" * 60)


if __name__ == "__main__":
    main()
