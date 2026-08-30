window.WATCH_DATA = {
  cities: [
    { id: "mumbai", name: "Mumbai", lat: 19.076, lon: 72.8777 },
    { id: "chennai", name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { id: "guwahati", name: "Guwahati", lat: 26.1445, lon: 91.7362 },
    { id: "chennai-sub", name: "Kolkata", lat: 22.5726, lon: 88.3639 },
    { id: "pune", name: "Pune", lat: 18.5204, lon: 73.8567 },
    { id: "dehradun", name: "Dehradun", lat: 30.3165, lon: 78.0322 },
    { id: "shimla", name: "Shimla", lat: 31.1048, lon: 77.1734 },
    { id: "wayanad", name: "Wayanad", lat: 11.6854, lon: 76.132 },
    { id: "gangtok", name: "Gangtok", lat: 27.3314, lon: 88.6138 },
  ],
  floodZones: [
    {
      name: "Mumbai coastal & low-lying wards",
      city: "mumbai",
      drainage: 0.35,
      latlngs: [
        [19.12, 72.82],
        [19.12, 72.9],
        [18.98, 72.9],
        [18.98, 72.82],
      ],
    },
    {
      name: "Chennai Adyar–Cooum floodplain",
      city: "chennai",
      drainage: 0.4,
      latlngs: [
        [13.1, 80.22],
        [13.1, 80.3],
        [13.0, 80.3],
        [13.0, 80.22],
      ],
    },
    {
      name: "Guwahati Brahmaputra fringe",
      city: "guwahati",
      drainage: 0.3,
      latlngs: [
        [26.2, 91.68],
        [26.2, 91.8],
        [26.1, 91.8],
        [26.1, 91.68],
      ],
    },
    {
      name: "Kolkata east wetlands edge",
      city: "chennai-sub",
      drainage: 0.38,
      latlngs: [
        [22.62, 88.35],
        [22.62, 88.45],
        [22.5, 88.45],
        [22.5, 88.35],
      ],
    },
  ],
  slideZones: [
    {
      name: "Dehradun Himalayan foothill slopes",
      city: "dehradun",
      slope: 0.78,
      latlngs: [
        [30.4, 77.95],
        [30.4, 78.15],
        [30.22, 78.15],
        [30.22, 77.95],
      ],
    },
    {
      name: "Shimla hill slopes",
      city: "shimla",
      slope: 0.88,
      latlngs: [
        [31.16, 77.1],
        [31.16, 77.24],
        [31.05, 77.24],
        [31.05, 77.1],
      ],
    },
    {
      name: "Wayanad highland escarpment",
      city: "wayanad",
      slope: 0.86,
      latlngs: [
        [11.8, 75.95],
        [11.8, 76.25],
        [11.5, 76.25],
        [11.5, 75.95],
      ],
    },
    {
      name: "Gangtok steep urban slopes",
      city: "gangtok",
      slope: 0.9,
      latlngs: [
        [27.38, 88.55],
        [27.38, 88.68],
        [27.28, 88.68],
        [27.28, 88.55],
      ],
    },
  ],
  guidance: {
    safe: [
      "Keep drains near your home clear of plastic and silt.",
      "Save official alert numbers and a small go-bag (torch, copies of IDs, medicines).",
      "Know the highest floor or nearest high ground on your street.",
    ],
    watch: [
      "Avoid underpasses and known waterlogging spots after heavy bursts of rain.",
      "Move vehicles off low lanes. Charge phones and power banks.",
      "If you live below a cut slope, watch for new cracks, tilting trees, or muddy seepage.",
    ],
    warning: [
      "Do not walk or drive through moving water. 15 cm can knock a person down.",
      "Stay away from nallahs, river banks, and steep cut slopes.",
      "Prepare to move family, documents, and livestock to higher ground.",
    ],
    severe: [
      "Leave immediately if water is entering rooms or if you hear slope rumble / see sudden debris.",
      "Follow local administration / NDMA / disaster-management orders. Do not wait for perfect confirmation.",
      "Help neighbors who may need extra time: elderly, disability, infants.",
    ],
  },
};
