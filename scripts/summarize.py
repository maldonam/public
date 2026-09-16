"""Recompute the summary statistics used by assets/site.js from the synthetic sample.

Usage: python scripts/summarize.py data/S8.synthetic_cashy_sample.csv
Prints a JSON object with the same shape as STATS in assets/site.js.
"""
import json
import sys

import numpy as np
import pandas as pd


def main(path: str) -> None:
    df = pd.read_csv(path)
    incl = df["EligibilityTarget"] == "INCLUSION"

    months = sorted(df["month"].unique())
    month = {
        "labels": months,
        "all": [int((df["month"] == m).sum()) for m in months],
        "incl": [int(((df["month"] == m) & incl).sum()) for m in months],
    }

    vuln_order = ["Vulnerabilidad Baja", "Vulnerabilidad Moderada", "Vulnerabilidad Elevada", "Vulnerabilidad Severa"]
    vuln = {
        "labels": [v.replace("Vulnerabilidad ", "") for v in vuln_order],
        "all": [int((df["Vulnerability_Category"] == v).sum()) for v in vuln_order],
    }

    elig_counts = df["Elegibilidad"].value_counts()
    elig = {
        "labels": list(elig_counts.index),
        "all": [int(x) for x in elig_counts.values],
        "incl": [bool(v.startswith("Elegible")) for v in elig_counts.index],
    }

    bins = list(range(0, 90, 5))
    h_all, _ = np.histogram(df["FinalScore"], bins=bins)
    h_inc, _ = np.histogram(df.loc[incl, "FinalScore"], bins=bins)
    score = {"labels": [str(b) for b in bins[:-1]], "all": h_all.tolist(), "incl": h_inc.tolist()}

    office_series = df["OficinaACNUR"].fillna("(blank)")
    office_counts = office_series.value_counts()
    office = {
        "labels": list(office_counts.index),
        "all": [int(x) for x in office_counts.values],
        "rate": [round(float(incl[office_series == o].mean() * 100), 1) for o in office_counts.index],
    }

    print(json.dumps({"month": month, "vuln": vuln, "elig": elig, "score": score, "office": office}, indent=2))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "data/S8.synthetic_cashy_sample.csv")
