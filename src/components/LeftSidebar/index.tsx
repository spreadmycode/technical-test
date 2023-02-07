import { useRef, useState } from "react";
import { Button, Slider, Typography } from "@mui/material";
import { Feature } from "@turf/turf";
import * as turf from "@turf/turf";
import { MapRef } from "react-map-gl";

export type BuildingProperty = {
  floorArea: number;
  numberOfFloors: number;
  heightPerFloor: number;
};

export type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
};

type Props = {
  buildingProperties: BuildingProperty;
  setBuildingProperties: (properties: BuildingProperty) => void;
  setGeojson: (feature: Feature) => void;
  setBuilding: (feature: Feature) => void;
  setViewState: (viewState: ViewState) => void;
  map: MapRef;
};

const LeftSideBar = ({
  buildingProperties,
  setBuildingProperties,
  setGeojson,
  setBuilding,
  setViewState,
  map,
}: Props) => {
  // File input ref for Geojson
  const fileRef = useRef(null);

  // State variables
  const [fileName, setFileName] = useState("");

  // Open file browser to select Geojson
  const onOpenFile = () => {
    if (!fileRef) return;

    // @ts-ignore
    fileRef.current.click();
  };

  // Form event handler
  const onBuildingPropertiesChange = (
    event: Event,
    value: number | number[],
    property: keyof typeof buildingProperties
  ) => {
    setBuildingProperties({ ...buildingProperties, [property]: value });
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

  return (
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
        id="file-input"
        ref={fileRef}
        type="file"
        style={{ visibility: "hidden" }}
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
          id="floor-area-slider"
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
          id="number-of-floors-slider"
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
          id="height-per-floor-slider"
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
  );
};

export default LeftSideBar;
