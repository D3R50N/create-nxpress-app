import { nxpress } from '@nxpress/core';

const app = nxpress({
  engine: '{{ENGINE}}',
  appDir: '{{APP_DIR}}',
  componentsDir: '{{COMPONENTS_DIR}}',
  publicDir: '{{PUBLIC_DIR}}',
  globals: {
    title: '{{TITLE}}',
    description: '{{DESCRIPTION}}',
  },
});

const PORT = process.env.PORT || {{PORT}};
app.listen(PORT, () => {
  console.log(`Nxpress server running on http://localhost:${PORT}`);
});
