import { nxpress, NxpressServerOptions } from "@nxpress/core";
import config from "@/nxpress.config.json";

const app = nxpress(config as NxpressServerOptions);
const PORT = process.env.PORT || config.port;

app.listen(PORT, () => {
  console.log(`Nxpress server running on http://localhost:${PORT}`);
});
