| config | az° | tilt° | dist (m) | →L1 (m) | pts (req/act) | footprint (m²) | coverage | bbox |
|---|---|---|---|---|---|---|---|---|
| config050 | 0.0 | 90.0 | 0.567 | -0.501 | 800/804 | 2.7834 | ≥0°: 380 pts / 1.3155 m² · ≥10°: 294 pts / 1.0178 m² · ≥19°: 211 pts / 0.7305 m² · ≥30°: 134 pts / 0.4639 m² | ≥0°: 1.8997 m² (1.534×1.239 m), fill 69% |
| config062 | 0.0 | 90.0 | 0.692 | -0.626 | 800/801 | 2.4291 | ≥0°: 497 pts / 1.5072 m² · ≥10°: 399 pts / 1.2100 m² · ≥19°: 305 pts / 0.9250 m² · ≥30°: 233 pts / 0.7066 m² | ≥0°: 1.8856 m² (1.488×1.267 m), fill 80% |
| config075 | 0.0 | 90.0 | 0.817 | -0.751 | 800/803 | 1.9345 | ≥0°: 550 pts / 1.3250 m² · ≥10°: 458 pts / 1.1033 m² · ≥19°: 362 pts / 0.8721 m² · ≥30°: 274 pts / 0.6601 m² | ≥0°: 1.5669 m² (1.328×1.180 m), fill 85% |
| config100 | 0.0 | 90.0 | 1.067 | -1.001 | 800/802 | 0.6566 | ≥0°: 665 pts / 0.5444 m² · ≥10°: 493 pts / 0.4036 m² · ≥19°: 314 pts / 0.2571 m² · ≥30°: 148 pts / 0.1212 m² | ≥0°: 0.6664 m² (0.831×0.802 m), fill 82% |

**Errored configs:**
- config112: workplane footprint is empty — the plane does not intersect the FK cloud's convex hull; adjust azimuth/tilt/distance or use a larger q-grid