// Import React core
import { useEffect, useRef, useState } from "react";

// Import map libs
import Map, { Source, Layer, useMap, LayerProps } from "react-map-gl";
import * as turf from "@turf/turf";
import { Feature } from "@turf/turf";

// Import MUI & map styles
import { Button, Slider, Typography } from "@mui/material";
import "mapbox-gl/dist/mapbox-gl.css";

const MapboxView = () => {
  // File input ref for Geojson
  const fileRef = useRef(null);

  // Map instance to handle mapview
  const { current: map } = useMap();

  // State variables
  const [fileName, setFileName] = useState("");
  const [geojson, setGeojson] = useState<Feature>();
  const [building, setBuilding] = useState<Feature>();
  const [buildingArea, setBuildingArea] = useState<number>(0);
  const [landArea, setLandArea] = useState<number>(0);
  const [buildingFloorArea, setBuildingFloorArea] = useState<number>(0);
  const [buildingVolume, setBuildingVolume] = useState<number>(0);
  const [buildingHeight, setBuildingHeight] = useState<number>(0);
  const [viewState, setViewState] = useState({
    longitude: 6.1432,
    latitude: 46.2044,
    zoom: 10,
  });
  const [buildingProperties, setBuildingProperties] = useState({
    floorArea: 80,
    numberOfFloors: 10,
    heightPerFloor: 3,
  });

  // Building styles
  const layerStyle = {
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
  const originalLayerStyle = {
    id: "room",
    type: "fill",
    source: "original",
    paint: {
      "fill-color": "#0080ff",
      "fill-opacity": 0.5,
    },
  } as LayerProps;

  // Bottom border styles
  const originalLayerBorderStyle = {
    id: "outline",
    type: "line",
    source: "original",
    paint: {
      "line-color": "#000",
      "line-width": 2,
    },
  } as LayerProps;

  // Open file browser to select Geojson
  const onOpenFile = () => {
    if (!fileRef) return;

    // @ts-ignore
    fileRef.current.click();
  };

  // Parsing Geojson file to render the building
  const onPlotUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const geojson = JSON.parse(reader.result as string);

      const feature = {
        type: "Feature",
        properties: { height: 22, base: 12 },
        geometry: geojson,
      } as Feature;
      setGeojson(feature);
      setBuilding(feature);

      const polyCenter = turf.centerOfMass(geojson);
      if (polyCenter && polyCenter.geometry.coordinates) {
        setViewState({
          latitude: polyCenter.geometry.coordinates[1],
          longitude: polyCenter.geometry.coordinates[0],
          zoom: 16,
        });
        map?.flyTo({
          center: polyCenter.geometry.coordinates as [number, number],
          zoom: 16,
        });
      }
    };
  };

  // Form event handler
  const onBuildingPropertiesChange = (
    event: Event,
    value: number | number[],
    property: keyof typeof buildingProperties
  ) => {
    setBuildingProperties({ ...buildingProperties, [property]: value });
  };

  // Modify mapview whenever metadata changes
  useEffect(() => {
    if (!geojson) return;

    const generatedBuilding = [];

    const buffer = turf.buffer(
      geojson,
      (-30 * (100 - buildingProperties.floorArea)) / 100,
      {
        units: "meters",
      }
    );

    if (!buffer) return;

    const bHeight =
      buildingProperties.numberOfFloors * buildingProperties.heightPerFloor;
    const bArea = turf.area(buffer);

    setLandArea(turf.area(geojson));
    setBuildingArea(bArea * buildingProperties.numberOfFloors);
    setBuildingFloorArea(bArea);
    setBuildingHeight(bHeight);
    setBuildingVolume(bArea * bHeight);

    const floorSeparatorSize = 0.5;
    if (buildingProperties.numberOfFloors >= 1) {
      for (let i = 0; i < buildingProperties.numberOfFloors; i++) {
        generatedBuilding.push({
          ...buffer,
          properties: {
            height: (i + 1) * buildingProperties.heightPerFloor,
            base: i * buildingProperties.heightPerFloor + floorSeparatorSize,
          },
        });
      }
    }

    // @ts-ignore
    setBuilding(turf.featureCollection(generatedBuilding));
  }, [buildingProperties, geojson]);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {/* Form sidebar */}
      <div
        style={{
          width: 300,
          padding: 20,
          gap: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <input
          ref={fileRef}
          type="file"
          style={{ display: "none" }}
          accept=".geojson"
          onChange={(e) => onPlotUpload(e.target.files![0])}
        />
        <Button variant="contained" onClick={() => onOpenFile()}>
          LOAD GEOJSON
        </Button>
        <div style={{ width: "100%", marginTop: "10px" }}>
          <Typography variant="caption" component="p">
            {fileName}
          </Typography>
        </div>
        <div style={{ width: "100%", marginTop: "20px" }}>
          <Typography id="coverage-slider" gutterBottom>
            lot coverage %: {buildingProperties.floorArea}
          </Typography>
          <Slider
            value={buildingProperties.floorArea}
            min={0}
            max={100}
            onChange={(e, v) => onBuildingPropertiesChange(e, v, "floorArea")}
            aria-labelledby="coverage-slider"
          />
        </div>
        <div style={{ width: "100%", marginTop: "20px" }}>
          <Typography id="floornumber-slider" gutterBottom>
            floor number: {buildingProperties.numberOfFloors}
          </Typography>
          <Slider
            value={buildingProperties.numberOfFloors}
            min={0}
            max={100}
            onChange={(e, v) =>
              onBuildingPropertiesChange(e, v, "numberOfFloors")
            }
            aria-labelledby="floornumber-slider"
          />
        </div>
        <div style={{ width: "100%", marginTop: "20px" }}>
          <Typography id="floorheight-slider" gutterBottom>
            floor height: {buildingProperties.heightPerFloor}
          </Typography>
          <Slider
            value={buildingProperties.heightPerFloor}
            min={0}
            max={100}
            onChange={(e, v) =>
              onBuildingPropertiesChange(e, v, "heightPerFloor")
            }
            aria-labelledby="floorheight-slider"
          />
        </div>
      </div>

      {/* Mapview */}
      <div style={{ width: "100%" }}>
        <Map
          mapboxAccessToken="pk.eyJ1Ijoic3dlcnQiLCJhIjoiY2s3bHNtdjF2MDJ1eTNmcGowanU5MHR4ZiJ9.hzhWj9bhgD5itpWAPc3nNA"
          {...viewState}
          initialViewState={{
            longitude: viewState.longitude,
            latitude: viewState.latitude,
            zoom: 16,
            pitch: 45,
          }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          style={{ width: "100%", height: "100vh" }}
          onMove={(evt) => setViewState(evt.viewState)}
        >
          <Source
            id="original"
            type="geojson"
            data={geojson as GeoJSON.Feature}
          >
            <Layer {...originalLayerStyle} />
            <Layer {...originalLayerBorderStyle} />
          </Source>
          <Source
            id="my-data"
            type="geojson"
            data={building as GeoJSON.Feature}
          >
            <Layer {...layerStyle} />
          </Source>
        </Map>
      </div>

      {/* Statistics sidebar */}
      <div
        style={{
          width: 400,
          padding: 10,
          gap: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h4">
          Statistiques
        </Typography>
        <Typography variant="body1" component="p">
          Land Area (m2) / {landArea.toFixed(2)}
        </Typography>
        <Typography variant="body1" component="p">
          Building Area (m2) / {buildingArea.toFixed(2)}
        </Typography>
        <Typography variant="body1" component="p">
          Building Floor Area (m2) / {buildingFloorArea.toFixed(2)}
        </Typography>
        <Typography variant="body1" component="p">
          Building Volume (m3) / {buildingVolume.toFixed(2)}
        </Typography>
        <Typography variant="body1" component="p">
          Building height (m) / {buildingHeight}
        </Typography>
      </div>
    </div>
  );
};

export default MapboxView;
