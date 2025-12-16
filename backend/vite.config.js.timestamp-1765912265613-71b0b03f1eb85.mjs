// vite.config.js
import { defineConfig, loadEnv } from "file:///C:/Users/user/OneDrive/Desktop/mini-capstone/tabulation-systemv2/backend/node_modules/vite/dist/node/index.js";
import laravel from "file:///C:/Users/user/OneDrive/Desktop/mini-capstone/tabulation-systemv2/backend/node_modules/laravel-vite-plugin/dist/index.js";
import tailwindcss from "file:///C:/Users/user/OneDrive/Desktop/mini-capstone/tabulation-systemv2/backend/node_modules/@tailwindcss/vite/dist/index.mjs";
import vue from "file:///C:/Users/user/OneDrive/Desktop/mini-capstone/tabulation-systemv2/backend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import fs from "fs";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\user\\OneDrive\\Desktop\\mini-capstone\\tabulation-systemv2\\backend";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = env.VITE_DEV_SERVER_HOST || "localhost";
  const rewriteHotFile = () => ({
    name: "rewrite-hot-file",
    configureServer(server) {
      server.httpServer?.once("listening", () => {
        const hotFile = path.resolve(__vite_injected_original_dirname, "public/hot");
        setTimeout(() => {
          if (fs.existsSync(hotFile)) {
            fs.writeFileSync(hotFile, `http://${host}:5173`);
            console.log(`
  \u2713 Hot file set to: http://${host}:5173
`);
          }
        }, 100);
      });
    }
  });
  return {
    plugins: [
      laravel({
        input: ["resources/css/app.css", "resources/js/app.js"],
        refresh: true,
        detectTls: false
      }),
      vue({
        template: {
          transformAssetUrls: {
            base: null,
            includeAbsolute: false
          }
        }
      }),
      tailwindcss(),
      rewriteHotFile()
    ],
    resolve: {
      alias: {
        vue: "vue/dist/vue.esm-bundler.js"
      }
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      cors: true,
      origin: `http://${host}:5173`,
      hmr: {
        host
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXE9uZURyaXZlXFxcXERlc2t0b3BcXFxcbWluaS1jYXBzdG9uZVxcXFx0YWJ1bGF0aW9uLXN5c3RlbXYyXFxcXGJhY2tlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHVzZXJcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxtaW5pLWNhcHN0b25lXFxcXHRhYnVsYXRpb24tc3lzdGVtdjJcXFxcYmFja2VuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvdXNlci9PbmVEcml2ZS9EZXNrdG9wL21pbmktY2Fwc3RvbmUvdGFidWxhdGlvbi1zeXN0ZW12Mi9iYWNrZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgbGFyYXZlbCBmcm9tICdsYXJhdmVsLXZpdGUtcGx1Z2luJztcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgICAvLyBMb2FkIGVudiBmaWxlXG4gICAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gICAgY29uc3QgaG9zdCA9IGVudi5WSVRFX0RFVl9TRVJWRVJfSE9TVCB8fCAnbG9jYWxob3N0JztcblxuICAgIC8vIEN1c3RvbSBwbHVnaW4gdG8gcmV3cml0ZSB0aGUgaG90IGZpbGUgd2l0aCBjb3JyZWN0IGhvc3RcbiAgICBjb25zdCByZXdyaXRlSG90RmlsZSA9ICgpID0+ICh7XG4gICAgICAgIG5hbWU6ICdyZXdyaXRlLWhvdC1maWxlJyxcbiAgICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgICAgICAgc2VydmVyLmh0dHBTZXJ2ZXI/Lm9uY2UoJ2xpc3RlbmluZycsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBob3RGaWxlID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3B1YmxpYy9ob3QnKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaG90RmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoaG90RmlsZSwgYGh0dHA6Ly8ke2hvc3R9OjUxNzNgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBcXG4gIFx1MjcxMyBIb3QgZmlsZSBzZXQgdG86IGh0dHA6Ly8ke2hvc3R9OjUxNzNcXG5gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICAgIGxhcmF2ZWwoe1xuICAgICAgICAgICAgICAgIGlucHV0OiBbJ3Jlc291cmNlcy9jc3MvYXBwLmNzcycsICdyZXNvdXJjZXMvanMvYXBwLmpzJ10sXG4gICAgICAgICAgICAgICAgcmVmcmVzaDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBkZXRlY3RUbHM6IGZhbHNlLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB2dWUoe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybUFzc2V0VXJsczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1ZGVBYnNvbHV0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgdGFpbHdpbmRjc3MoKSxcbiAgICAgICAgICAgIHJld3JpdGVIb3RGaWxlKCksXG4gICAgICAgIF0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGFsaWFzOiB7XG4gICAgICAgICAgICAgICAgdnVlOiAndnVlL2Rpc3QvdnVlLmVzbS1idW5kbGVyLmpzJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHNlcnZlcjoge1xuICAgICAgICAgICAgaG9zdDogJzAuMC4wLjAnLFxuICAgICAgICAgICAgcG9ydDogNTE3MyxcbiAgICAgICAgICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgICAgICAgICBjb3JzOiB0cnVlLFxuICAgICAgICAgICAgb3JpZ2luOiBgaHR0cDovLyR7aG9zdH06NTE3M2AsXG4gICAgICAgICAgICBobXI6IHtcbiAgICAgICAgICAgICAgICBob3N0OiBob3N0LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBaLFNBQVMsY0FBYyxlQUFlO0FBQ2hjLE9BQU8sYUFBYTtBQUNwQixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxRQUFRO0FBQ2YsT0FBTyxVQUFVO0FBTGpCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBRXRDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUMzQyxRQUFNLE9BQU8sSUFBSSx3QkFBd0I7QUFHekMsUUFBTSxpQkFBaUIsT0FBTztBQUFBLElBQzFCLE1BQU07QUFBQSxJQUNOLGdCQUFnQixRQUFRO0FBQ3BCLGFBQU8sWUFBWSxLQUFLLGFBQWEsTUFBTTtBQUN2QyxjQUFNLFVBQVUsS0FBSyxRQUFRLGtDQUFXLFlBQVk7QUFDcEQsbUJBQVcsTUFBTTtBQUNiLGNBQUksR0FBRyxXQUFXLE9BQU8sR0FBRztBQUN4QixlQUFHLGNBQWMsU0FBUyxVQUFVLElBQUksT0FBTztBQUMvQyxvQkFBUSxJQUFJO0FBQUEsbUNBQWlDLElBQUk7QUFBQSxDQUFTO0FBQUEsVUFDOUQ7QUFBQSxRQUNKLEdBQUcsR0FBRztBQUFBLE1BQ1YsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBRUEsU0FBTztBQUFBLElBQ0gsU0FBUztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ0osT0FBTyxDQUFDLHlCQUF5QixxQkFBcUI7QUFBQSxRQUN0RCxTQUFTO0FBQUEsUUFDVCxXQUFXO0FBQUEsTUFDZixDQUFDO0FBQUEsTUFDRCxJQUFJO0FBQUEsUUFDQSxVQUFVO0FBQUEsVUFDTixvQkFBb0I7QUFBQSxZQUNoQixNQUFNO0FBQUEsWUFDTixpQkFBaUI7QUFBQSxVQUNyQjtBQUFBLFFBQ0o7QUFBQSxNQUNKLENBQUM7QUFBQSxNQUNELFlBQVk7QUFBQSxNQUNaLGVBQWU7QUFBQSxJQUNuQjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ0wsT0FBTztBQUFBLFFBQ0gsS0FBSztBQUFBLE1BQ1Q7QUFBQSxJQUNKO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDSixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixNQUFNO0FBQUEsTUFDTixRQUFRLFVBQVUsSUFBSTtBQUFBLE1BQ3RCLEtBQUs7QUFBQSxRQUNEO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
