import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const simpleGlslPlugin = () => {
  return {
    name: 'vite-plugin-simple-glsl',
    transform(code, id) {
      if (id.endsWith('.glsl') || id.endsWith('.vert') || id.endsWith('.frag')) {
        const dir = path.dirname(id);
        const processed = code.replace(/#include\s+[<"']?([^>"'\s]+)[>"']?/g, (match, includePath) => {
          const filePath = path.resolve(dir, includePath);
          if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf-8');
          }
          return match;
        });
        return `export default ${JSON.stringify(processed)};`;
      }
    }
  };
};

export default defineConfig({
  plugins: [simpleGlslPlugin()]
});

