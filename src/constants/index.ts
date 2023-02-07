import { LayerProps } from "react-map-gl";

// Building styles
export const layerStyle = {
  id: "room-extrusion",
  type: "fill-extrusion",
  source: "floorplan",
  paint: {
    "fill-extrusion-color": "#f9d272",
    "fill-extrusion-height": ["get", "height"],
    "fill-extrusion-base": ["get", "base"],
    "fill-extrusion-opacity": 1,
  },
} as LayerProps;

// Bottom layer styles
export const originalLayerStyle = {
  id: "room",
  type: "fill",
  source: "original",
  paint: {
    "fill-color": "#0080ff",
    "fill-opacity": 0.5,
  },
} as LayerProps;

// Bottom border styles
export const originalLayerBorderStyle = {
  id: "outline",
  type: "line",
  source: "original",
  paint: {
    "line-color": "#000",
    "line-width": 2,
  },
} as LayerProps;
