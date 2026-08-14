"use client";

/**
 * TNT BRANCH MAP — MapLibre GL, US + Canada only.
 *
 * Presentational. All state (selection, hover, filtering) is owned by the
 * parent so the search panel, the markers and the detail card stay in lockstep.
 * Replaces the dotted SVG backdrop only; nothing else in the section changed.
 *
 * BASEMAP. MapLibre renders no tiles of its own, so a vector source is
 * required for roads/water/land/labels. This uses OpenFreeMap's dark style —
 * free, keyless, no signup — and then RECOLOURS it in code rather than shipping
 * a hand-authored style JSON. Recolouring walks the loaded layers and paints by
 * layer TYPE, so it survives the upstream style renaming or reordering its
 * layers, which a hardcoded id list would not.
 *
 * MARKERS are real <button> elements inside maplibre Markers, not canvas
 * symbols — so they are tabbable, carry aria labels and focus rings, and can be
 * animated with plain CSS. Filtering fades them rather than removing them, so
 * the change reads as emphasis rather than as content vanishing.
 */

// maplibre-gl v6 ships NO default export — named imports only.
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Map as MlMap,
  Marker,
  NavigationControl,
  LngLatBounds,
  setWorkerUrl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Branch } from "@/components/site/branchLocatorData";

/** Minimal shape of a style layer — enough to repaint, without importing the
 *  full style-spec types (which v6 does not re-export). */
type StyleLayerLike = {
  id: string;
  type: string;
  "source-layer"?: string;
};

const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

/**
 * MapLibre parses vector tiles in a Web Worker it normally bundles inline.
 * Under Turbopack that worker is created and then dies immediately — no error
 * surfaces, the style simply never finishes loading and NO tiles are ever
 * requested, so the basemap stays blank while markers and controls look fine.
 *
 * Pointing at the standalone worker build served from /public sidesteps the
 * bundler entirely. `maplibre-gl-worker.mjs` imports `maplibre-gl-shared.mjs`
 * relatively, so both files must sit at the web root together — see the note in
 * package.json's copy step if these are ever refreshed after an upgrade.
 */
let workerConfigured = false;
function ensureWorker() {
  if (workerConfigured) return;
  setWorkerUrl("/maplibre-gl-worker.mjs");
  workerConfigured = true;
}

/** Premium industrial palette — black, charcoal, TNT gold. */
const THEME = {
  gold: "#F5A623",
  // Land must differ from the backdrop or the coastline disappears and the map
  // reads as a flat rectangle.
  backdrop: "#0C0C0C",
  land: "#1B1B1B", // charcoal
  water: "#050505", // near black
  road: "#2E2E2E", // dark gray
  label: "#9A9A9A", // light gray
  labelHalo: "#000000",
};

/** US + Canada. Excludes the far Arctic so the fit isn't mostly empty ice. */
const BOUNDS: [[number, number], [number, number]] = [
  [-141, 24],
  [-52, 60],
];

const FIT = { padding: 48, duration: 0 } as const;

export interface BranchMapProps {
  branches: Branch[];
  visibleIds: Set<string>;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  className?: string;
}

/**
 * Repaint a loaded style into the TNT palette.
 *
 * Water is detected by source-layer/id rather than by a fixed list because
 * every basemap names its layers differently; type is the reliable signal and
 * the water check is the one heuristic worth making.
 */
function applyTheme(map: MlMap) {
  const layers = map.getStyle()?.layers as StyleLayerLike[] | undefined;
  if (!layers) return;

  for (const layer of layers) {
    const id = layer.id;
    const isWater = /water|ocean|sea|river|lake/i.test(
      `${id} ${layer["source-layer"] ?? ""}`,
    );
    try {
      switch (layer.type) {
        case "background":
          map.setPaintProperty(id, "background-color", THEME.backdrop);
          break;
        case "fill":
          map.setPaintProperty(id, "fill-color", isWater ? THEME.water : THEME.land);
          map.setPaintProperty(id, "fill-opacity", 1);
          break;
        case "line":
          map.setPaintProperty(id, "line-color", isWater ? THEME.water : THEME.road);
          break;
        case "symbol":
          map.setPaintProperty(id, "text-color", THEME.label);
          map.setPaintProperty(id, "text-halo-color", THEME.labelHalo);
          map.setPaintProperty(id, "text-halo-width", 1.2);
          break;
        case "fill-extrusion":
          // Flatten 3D buildings — they fight the markers for attention.
          map.setLayoutProperty(id, "visibility", "none");
          break;
      }
    } catch {
      // A layer that doesn't accept a given paint property is not a failure;
      // skip it rather than aborting the whole repaint.
    }
  }
}

export function BranchMap({
  branches,
  visibleIds,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  className = "",
}: BranchMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  // Marker instances only, for teardown. Per-marker DOM state is applied by
  // querying `data-branch-id` instead of holding element references — mutating
  // objects reached through a ref trips react-hooks/immutability, and the query
  // is a handful of nodes.
  const markersRef = useRef<Marker[]>([]);
  // Handlers change identity on every parent render; markers are built once, so
  // they read the latest through refs instead of being torn down and rebuilt.
  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);
  useEffect(() => {
    onSelectRef.current = onSelect;
    onHoverRef.current = onHover;
  }, [onSelect, onHover]);

  // Read by the ResizeObserver so a late resize doesn't yank the camera off a
  // branch the visitor has already chosen.
  const selectedIdRef = useRef(selectedId);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const branchList = useMemo(() => branches, [branches]);

  // ---- Map + markers: created once ---------------------------------------
  useEffect(() => {
    const host = hostRef.current;
    if (!host || mapRef.current) return;

    ensureWorker();

    const map = new MlMap({
      container: host,
      style: STYLE_URL,
      bounds: BOUNDS,
      fitBoundsOptions: FIT,
      // North America only — no world-spanning pan, no zooming out past the
      // continent, which is what "do not display the entire world" means in
      // interaction terms as well as on first paint.
      maxBounds: [
        [-170, 10],
        [-30, 75],
      ],
      minZoom: 2,
      maxZoom: 12,
      attributionControl: { compact: true },
      // The section already animates plenty; a spinning globe is not the point.
      dragRotate: false,
      pitchWithRotate: false,
    });
    mapRef.current = map;
    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __tntMap?: MlMap }).__tntMap = map;
    }

    // Zoom in / zoom out only — no compass, no fullscreen, no geolocate.
    map.addControl(
      new NavigationControl({ showCompass: false, showZoom: true }),
      "top-right",
    );
    map.touchZoomRotate.disableRotation();

    // MapLibre swallows source/tile failures unless you listen — without this a
    // broken basemap looks identical to an empty one.
    map.on("error", (e) => {
      console.error("[branch-map]", (e as { error?: Error })?.error?.message ?? e);
    });

    // `style.load`, NOT `styledata`. applyTheme calls setPaintProperty, and
    // every setPaintProperty fires `styledata` — listening to that recurses
    // forever and starves the tile requests, so the basemap never renders.
    // `style.load` fires once per style, which is exactly the trigger wanted.
    map.on("style.load", () => {
      applyTheme(map);
      map.resize();
    });

    for (const b of branchList) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "tnt-marker";
      el.dataset.branchId = b.id;
      el.setAttribute(
        "aria-label",
        `${b.city} — ${b.region}, operated by ${b.brand}`,
      );
      el.innerHTML = `<span class="tnt-marker__pulse" aria-hidden="true"></span><span class="tnt-marker__dot" aria-hidden="true"></span>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(b.id);
      });
      el.addEventListener("mouseenter", () => onHoverRef.current(b.id));
      el.addEventListener("mouseleave", () => onHoverRef.current(null));
      el.addEventListener("focus", () => onHoverRef.current(b.id));
      el.addEventListener("blur", () => onHoverRef.current(null));

      const marker = new Marker({ element: el })
        .setLngLat([b.lng, b.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }

    // The map is lazy-imported into a grid cell sized by aspect-ratio, so the
    // container can still be 0×0 when MapLibre initialises. It then computes
    // zero covering tiles and — with nothing to trigger a recompute — never
    // requests any, leaving a blank basemap with no error. Observing the host
    // and resizing is what makes the tiles load.
    const ro = new ResizeObserver(() => {
      const m = mapRef.current;
      if (!m) return;
      m.resize();
      if (!selectedIdRef.current) m.fitBounds(BOUNDS, FIT);
    });
    ro.observe(host);

    const markers = markersRef.current;
    return () => {
      ro.disconnect();
      for (const marker of markers) marker.remove();
      markers.length = 0;
      map.remove();
      mapRef.current = null;
    };
  }, [branchList]);

  // ---- Marker state: cheap class toggles, no re-creation ------------------
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    for (const el of host.querySelectorAll<HTMLButtonElement>("[data-branch-id]")) {
      const id = el.dataset.branchId;
      if (!id) continue;
      const visible = visibleIds.has(id);
      el.classList.toggle("is-dimmed", !visible);
      el.classList.toggle("is-selected", id === selectedId);
      el.classList.toggle("is-hovered", id === hoveredId);
      // A dimmed marker must also leave the tab order, or keyboard users walk
      // branches the filter has excluded.
      el.tabIndex = visible ? 0 : -1;
    }
  }, [visibleIds, selectedId, hoveredId]);

  // ---- Fly to selection ---------------------------------------------------
  const flyTo = useCallback(
    (b: Branch) => {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo({
        center: [b.lng, b.lat],
        zoom: Math.max(map.getZoom(), 5.2),
        duration: reduced ? 0 : 1100,
        essential: true,
      });
    },
    [reduced],
  );

  useEffect(() => {
    if (!selectedId) return;
    const b = branchList.find((x) => x.id === selectedId);
    if (b) flyTo(b);
  }, [selectedId, branchList, flyTo]);

  // Refit when the filter changes the visible set, so switching to Canada
  // actually shows Canada rather than leaving you over Texas.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || visibleIds.size === 0) return;
    const pts = branchList.filter((b) => visibleIds.has(b.id));
    if (pts.length < 2) return;
    const bounds = new LngLatBounds();
    for (const b of pts) bounds.extend([b.lng, b.lat]);
    map.fitBounds(bounds, { padding: 64, duration: reduced ? 0 : 900, maxZoom: 6 });
  }, [visibleIds, branchList, reduced]);

  return (
    <div
      ref={hostRef}
      role="application"
      aria-label="Map of TNT Crane & Rigging branches across the United States and Canada"
      className={`tnt-map relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0B] ${className}`}
    />
  );
}

export default BranchMap;
