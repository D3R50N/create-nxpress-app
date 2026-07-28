import { nxpress } from '@nxpress/core';

const app = nxpress({
  engine: '{{ENGINE}}',
});

const PORT = process.env.PORT || {{PORT}};
app.listen(PORT, () => {
  console.log(`Nxpress server running on http://localhost:${PORT}`);
});
