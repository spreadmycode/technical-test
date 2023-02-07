// Import React core
import React, { useEffect, useState } from "react";

// Import map libs
import Map, { Source, Layer, useMap } from "react-map-gl";
import * as turf from "@turf/turf";
import { Feature } from "@turf/turf";

// Import MUI & map styles
import "mapbox-gl/dist/mapbox-gl.css";
import LeftSideBar from "../LeftSidebar";
import RightSidebar from "../RightSidebar";
import { layerStyle, originalLayerBorderStyle, originalLayerStyle } from "../../constants";

const MapboxView = () => {
  // Map instance to handle mapview
  const { current: map } = useMap();

  // State variables
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
      <LeftSideBar
        map={map!}
        buildingProperties={buildingProperties}
        setBuildingProperties={setBuildingProperties}
        setBuilding={setBuilding}
        setGeojson={setGeojson}
        setViewState={setViewState}
      />

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
      <RightSidebar
        landArea={landArea}
        buildingArea={buildingArea}
        buildingFloorArea={buildingFloorArea}
        buildingHeight={buildingHeight}
        buildingVolume={buildingVolume}
      />
    </div>
  );
};

export default MapboxView;
