import React from "react";
import { render, fireEvent, queryByAttribute } from "@testing-library/react";
import MapboxView from "..";

describe("MapboxView component", () => {
  it("should render MapboxView component", () => {
    const { getByText } = render(<MapboxView />);
    const openFileButton = getByText("LOAD GEOJSON");
    expect(openFileButton).toBeInTheDocument();
  });

  it("should handle file input", () => {
    const dom = render(<MapboxView />);
    const getById = queryByAttribute.bind(null, "id");

    const openFileButton = dom.getByText("LOAD GEOJSON");
    fireEvent.click(openFileButton);

    const fileInput = getById(dom.container, "file-input");
    expect(fileInput).toBeInTheDocument();

    const file = new File([""], "test.geojson", { type: "application/json" });
    fireEvent.change(fileInput!, { target: { files: [file] } });

    const fileNameDisplay = dom.getByText("test.geojson");
    expect(fileNameDisplay).toBeInTheDocument();
  });

  it("should display building properties", () => {
    const dom = render(<MapboxView />);

    const floorAreaLabel = dom.getByText(new RegExp("Statistiques", "i"));
    expect(floorAreaLabel).toBeInTheDocument();

    const numberOfFloorsLabel = dom.getByText(new RegExp("Land Area", "i"));
    expect(numberOfFloorsLabel).toBeInTheDocument();

    const heightPerFloorLabel = dom.getByText(new RegExp("Building Area", "i"));
    expect(heightPerFloorLabel).toBeInTheDocument();
  });
});
