import React from "react";
import { render, fireEvent } from "@testing-library/react";
import MapboxView from ".";

describe("MapboxView", () => {
  test("should render the map view with default state", () => {
    const { container } = render(<MapboxView />);
    expect(container).toMatchSnapshot();
  });

  test('should open the file browser when the "Open" button is clicked', () => {
    const { getByText } = render(<MapboxView />);
    const fileInput = document.createElement("input");
    fileInput.click = jest.fn();
    window.HTMLInputElement.prototype.click = jest.fn();
    window.HTMLInputElement.prototype.click = jest.fn();
    // @ts-ignore
    window.HTMLInputElement.prototype.files = [
      new File(
        ['{"type": "FeatureCollection", "features": []}'],
        "file.geojson",
        { type: "application/json" }
      ),
    ];
    fireEvent.click(getByText("Open"));
    expect(fileInput.click).toHaveBeenCalled();
  });

  test("should update the state when the building properties form is updated", () => {
    const { getByLabelText } = render(<MapboxView />);
    fireEvent.change(getByLabelText("Floor Area"), { target: { value: 70 } });
    fireEvent.change(getByLabelText("Number of Floors"), {
      target: { value: 7 },
    });
    fireEvent.change(getByLabelText("Height Per Floor"), {
      target: { value: 2 },
    });

    // @ts-ignore
    expect(getByLabelText("Floor Area").value).toBe("70");
    // @ts-ignore
    expect(getByLabelText("Number of Floors").value).toBe("7");
    // @ts-ignore
    expect(getByLabelText("Height Per Floor").value).toBe("2");
  });
});
