# Urban-Flood-And-Landslide-Prediction-System

A neighborhood early-warning map for urban flooding and landslide risk. People can pin a place, see rainfall-driven risk scores, mapped hazard zones, safety steps, and local reports.

This is a decision-support tool. It does not replace IMD, NDMA, or local disaster-management orders.

What it does





Map of indicative floodplains and landslide-prone slopes



Live 7-day rainfall from Open-Meteo



Transparent risk scores (0–100) for flood and landslide



Clear Watch / Warning / Severe guidance



“Use my location”, city chips, and place search



Community reports stored in the browser (localStorage)



Share a short risk summary with family



How to open





Open index.html in a browser (Chrome or Edge).



For GPS and some search features, serve the folder over http://localhost if double-clicking the file is blocked.

Hazard polygons are starting layers for Indian cities that often face monsoon floods or hill-slope failures. Click anywhere else on the map: rainfall still drives the score.

Risk model (simple, on purpose)





Flood: next 24h and 48h rainfall, plus a boost if the pin is inside a mapped low-lying / poor-drainage zone.



Landslide: 72h rainfall, count of wet days (≥10 mm), plus a boost on steep mapped slopes.

Treat scores as relative caution, not an engineering forecast.

Next steps that would help more people





Official flood-inundation and landslide-susceptibility GIS from state agencies



SMS / WhatsApp alerts for a ward, not only this screen



Multilingual UI (Hindi, Tamil, Assamese, Malayalam, …)



A small Node or Python backend if you want shared reports across phones
