## Plane
azimuth: -90.0°   tilt: -90.0°   distance: -0.100 m
distance (plane -> ref point): -0.000 m

## Sampling
requested points: 800   actual points: 800

## Orientation candidates (ZXZ, deg)
rpy offset     : [0.0, -90.0, 0.0]
z1 (precession): [-135.0, -90.0, -45.0, 0.0, 45.0, 90.0, 135.0, 180.0]
x  (cone angle): [0.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0]
z2 (spin)      : [0.0]

## Stage C statistics
footprint area: 2.7129 m^2

## Coverage (progressive: xyz ⊇ norm reach ⊇ cone >= t)
  xyz            :   663 pts   2.7129 m^2 (= footprint)
  norm reach     :   380 pts   1.2886 m^2
  cone >=   0.0° :   186 pts   0.6307 m^2
  cone >=   9.7° :   178 pts   0.6036 m^2
  cone >=  19.5° :   166 pts   0.5629 m^2
  cone >=  29.8° :   154 pts   0.5222 m^2
note: xyz = position reachable (any orientation, incl. position-only fallback); norm reach
= approach ∥ n̂ feasible for AT LEAST ONE roll; cone rows require EVERY roll: cone 0 = all
rolls at zero tilt but no wider cone; x>0 = largest cone half-angle feasible at every rim
azimuth and spin. Norm-reach-by-some-rolls-only points count in NO cone row (shown grey).

## Cone bbox (cone >= 0°, bbox @ 0°)
points: 186
area  : 1.6108 m^2
length: 1.106 m   width: 1.456 m
fill  : 39.2% of bbox area is qualifying points