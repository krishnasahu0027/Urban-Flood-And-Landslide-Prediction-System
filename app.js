(function () {
  const data = window.WATCH_DATA;
  const REPORTS_KEY = "flw-reports-v1";

  const map = L.map("map", { zoomControl: true }).setView([22.5, 80], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  const floodLayer = L.layerGroup().addTo(map);
  const slideLayer = L.layerGroup().addTo(map);
  const reportLayer = L.layerGroup().addTo(map);
  let marker = null;
  let selected = { lat: null, lon: null, name: "Selected point" };
  let requestSeq = 0;

  data.floodZones.forEach((zone) => {
    L.polygon(zone.latlngs, {
      color: "#2f9ed8",
      weight: 1,
      fillOpacity: 0.28,
    })
      .bindPopup(`<strong>${zone.name}</strong><br>Indicative urban flood zone`)
      .addTo(floodLayer);
  });

  data.slideZones.forEach((zone) => {
    L.polygon(zone.latlngs, {
      color: "#c9843a",
      weight: 1,
      fillOpacity: 0.28,
    })
      .bindPopup(`<strong>${zone.name}</strong><br>Indicative landslide-prone slope`)
      .addTo(slideLayer);
  });

  const chips = document.getElementById("city-chips");
  data.cities.forEach((city) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = city.name;
    btn.addEventListener("click", () => {
      [...chips.children].forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      choosePlace(city.lat, city.lon, city.name);
    });
    chips.appendChild(btn);
  });

  function pointInPolygon(lat, lon, latlngs) {
    let inside = false;
    for (let i = 0, j = latlngs.length - 1; i < latlngs.length; j = i++) {
      const yi = latlngs[i][0];
      const xi = latlngs[i][1];
      const yj = latlngs[j][0];
      const xj = latlngs[j][1];
      const intersect = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function nearestZoneFactor(lat, lon, zones, key) {
    const hit = zones.find((z) => pointInPolygon(lat, lon, z.latlngs));
    if (hit) return { inside: true, name: hit.name, value: hit[key] };
    let best = { inside: false, name: "", value: 0, dist: Infinity };
    zones.forEach((z) => {
      const cy = z.latlngs.reduce((s, p) => s + p[0], 0) / z.latlngs.length;
      const cx = z.latlngs.reduce((s, p) => s + p[1], 0) / z.latlngs.length;
      const dist = Math.hypot(lat - cy, lon - cx);
      if (dist < best.dist) best = { inside: false, name: z.name, value: z[key] * Math.max(0, 1 - dist / 1.2), dist };
    });
    return best;
  }

  function levelFromScore(score) {
    if (score >= 75) return "severe";
    if (score >= 55) return "warning";
    if (score >= 35) return "watch";
    return "safe";
  }

  function label(level) {
    return { safe: "Low", watch: "Watch", warning: "Warning", severe: "Severe" }[level];
  }

  function floodScore(rain24, rain48, zone) {
    const rainPart = Math.min(70, rain24 * 1.1 + rain48 * 0.35);
    const urban = zone.inside ? 22 : zone.value * 18;
    return Math.round(Math.min(100, rainPart + urban));
  }

  function slideScore(rain72, wetDays, zone) {
    const rainPart = Math.min(55, rain72 * 0.55);
    const wetPart = Math.min(15, wetDays * 4);
    const slopePart = zone.inside ? 28 : zone.value * 22;
    return Math.round(Math.min(100, rainPart + wetPart + slopePart));
  }

  function setBadge(el, level) {
    el.className = "badge " + level;
    el.textContent = label(level);
  }

  function worse(a, b) {
    const rank = { safe: 0, watch: 1, warning: 2, severe: 3 };
    return rank[a] >= rank[b] ? a : b;
  }

  function renderActions(floodLevel, slideLevel) {
    const list = data.guidance[worse(floodLevel, slideLevel)];
    document.getElementById("actions").innerHTML = list.map((item) => `<li>${item}</li>`).join("");
  }

  async function fetchRain(lat, lon) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lon);
    url.searchParams.set("hourly", "precipitation");
    url.searchParams.set("daily", "precipitation_sum");
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("timezone", "auto");
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather request failed");
    return res.json();
  }

  function summarizeRain(json) {
    const hourly = json.hourly.precipitation || [];
    const rain24 = hourly.slice(0, 24).reduce((a, b) => a + (b || 0), 0);
    const rain48 = hourly.slice(0, 48).reduce((a, b) => a + (b || 0), 0);
    const rain72 = hourly.slice(0, 72).reduce((a, b) => a + (b || 0), 0);
    const daily = json.daily.precipitation_sum || [];
    const wetDays = daily.filter((mm) => mm >= 10).length;
    return { rain24, rain48, rain72, wetDays, daily, dates: json.daily.time || [] };
  }

  function renderRain(summary) {
    const ul = document.getElementById("rain-days");
    ul.innerHTML = summary.daily
      .map((mm, i) => {
        const day = (summary.dates[i] || "").slice(5);
        return `<li><div>${day}</div><strong>${Math.round(mm)} mm</strong></li>`;
      })
      .join("");
  }

  async function choosePlace(lat, lon, name) {
    const seq = ++requestSeq;
    selected = { lat, lon, name };
    document.getElementById("place-name").textContent = name;
    document.getElementById("place-coords").textContent = `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    map.setView([lat, lon], 11);
    if (marker) marker.remove();
    marker = L.marker([lat, lon]).addTo(map).bindPopup(name).openPopup();

    const floodZone = nearestZoneFactor(lat, lon, data.floodZones, "drainage");
    const slideZone = nearestZoneFactor(lat, lon, data.slideZones, "slope");

    try {
      const json = await fetchRain(lat, lon);
      if (seq !== requestSeq) return;
      const rain = summarizeRain(json);
      renderRain(rain);
      const fScore = floodScore(rain.rain24, rain.rain48, { inside: floodZone.inside, value: 1 - (floodZone.value || 0.5) });
      const sScore = slideScore(rain.rain72, rain.wetDays, slideZone);
      const fLevel = levelFromScore(fScore);
      const sLevel = levelFromScore(sScore);
      document.getElementById("flood-score").textContent = `Risk score ${fScore} / 100 · next 24h rain ${rain.rain24.toFixed(1)} mm`;
      document.getElementById("slide-score").textContent = `Risk score ${sScore} / 100 · 72h rain ${rain.rain72.toFixed(1)} mm`;
      document.getElementById("flood-why").textContent = floodZone.inside
        ? `Inside ${floodZone.name}. Urban drainage is easily overwhelmed.`
        : "Not inside a mapped floodplain layer. Score is driven mainly by forecast rainfall.";
      document.getElementById("slide-why").textContent = slideZone.inside
        ? `Inside ${slideZone.name}. Steep cut slopes fail after prolonged rain.`
        : "Not inside a mapped landslide layer. Hills nearby still deserve caution after long rains.";
      setBadge(document.getElementById("flood-badge"), fLevel);
      setBadge(document.getElementById("slide-badge"), sLevel);
      renderActions(fLevel, sLevel);
      selected.summary = `${name}: flood ${label(fLevel)} (${fScore}), landslide ${label(sLevel)} (${sScore}). 24h rain ${rain.rain24.toFixed(1)} mm.`;
    } catch (err) {
      if (seq !== requestSeq) return;
      document.getElementById("search-status").textContent =
        "Could not reach rainfall forecast. Check internet, then try again. Safety tips still apply.";
      renderActions("watch", "watch");
    }
  }

  map.on("click", (e) => {
    choosePlace(e.latlng.lat, e.latlng.lng, "Pinned location");
  });

  document.getElementById("locate-btn").addEventListener("click", () => {
    if (!navigator.geolocation) {
      document.getElementById("search-status").textContent = "This browser cannot share location.";
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => choosePlace(pos.coords.latitude, pos.coords.longitude, "Your location"),
      () => {
        document.getElementById("search-status").textContent =
          "Location permission denied. Search a city or tap the map.";
      }
    );
  });

  async function searchPlace(query) {
    const q = query.trim();
    if (!q) return;
    document.getElementById("search-status").textContent = "Searching…";
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const hits = await res.json();
    if (!hits.length) {
      document.getElementById("search-status").textContent = "No place found. Try a nearby city name.";
      return;
    }
    document.getElementById("search-status").textContent = "";
    choosePlace(Number(hits[0].lat), Number(hits[0].lon), hits[0].display_name.split(",")[0]);
  }

  document.getElementById("search-btn").addEventListener("click", () => {
    searchPlace(document.getElementById("place-search").value);
  });
  document.getElementById("place-search").addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchPlace(e.target.value);
  });

  document.getElementById("share-btn").addEventListener("click", async () => {
    const text = selected.summary || "Check flood and landslide risk: open Flood & Landslide Watch and pin your area.";
    if (navigator.share) {
      await navigator.share({ title: "Flood & Landslide Watch", text });
    } else {
      await navigator.clipboard.writeText(text);
      document.getElementById("search-status").textContent = "Risk summary copied.";
    }
  });

  function loadReports() {
    try {
      return JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveReports(items) {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(items));
  }

  function drawReports() {
    reportLayer.clearLayers();
    loadReports().forEach((r) => {
      L.circleMarker([r.lat, r.lon], {
        radius: 8,
        color: "#e24b4b",
        fillOpacity: 0.85,
      })
        .bindPopup(`<strong>${r.kind}</strong> · ${r.severity}<br>${r.note || ""}<br><small>${r.when}</small>`)
        .addTo(reportLayer);
    });
  }

  document.getElementById("report-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (selected.lat == null) {
      document.getElementById("search-status").textContent = "Choose a location first, then submit a report.";
      return;
    }
    const form = e.target;
    const report = {
      lat: selected.lat,
      lon: selected.lon,
      kind: form.kind.value,
      severity: form.severity.value,
      note: form.note.value.trim(),
      when: new Date().toLocaleString(),
    };
    const items = loadReports();
    items.push(report);
    saveReports(items);
    drawReports();
    form.reset();
    document.getElementById("search-status").textContent = "Report pinned for people using this browser.";
  });

  drawReports();
  renderActions("safe", "safe");
})();
