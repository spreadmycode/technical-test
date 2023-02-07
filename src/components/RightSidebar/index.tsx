import { Typography } from "@mui/material";

type Props = {
  landArea: number;
  buildingArea: number;
  buildingFloorArea: number;
  buildingVolume: number;
  buildingHeight: number;
};

const RightSidebar = ({
  landArea,
  buildingArea,
  buildingFloorArea,
  buildingHeight,
  buildingVolume,
}: Props) => {
  return (
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
  );
};

export default RightSidebar;
