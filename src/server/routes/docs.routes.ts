import { Router, Request, Response } from 'express';
import { openApiSpec } from '../docs/openApiSpec';

const router = Router();

/**
 * GET /api/v1/docs/openapi.json
 * Returns raw OpenAPI 3.0 specification in JSON format
 */
router.get('/openapi.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(openApiSpec);
});

/**
 * GET /api/v1/docs
 * Serves modern interactive Swagger UI powered by official CDN
 */
router.get('/', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IntelliGrade REST API Documentation | Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232563eb'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>">
  <style>
    body { margin: 0; padding: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .top-banner { background: #1e293b; color: white; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; }
    .top-banner h1 { margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; display: flex; align-items: center; gap: 10px; }
    .top-banner a { color: #93c5fd; text-decoration: none; font-size: 13px; font-weight: 500; border: 1px solid #334155; padding: 6px 12px; border-radius: 6px; }
    .top-banner a:hover { background: #334155; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div class="top-banner">
    <h1>
      <span>🎓 IntelliGrade</span>
      <span style="font-size: 12px; font-weight: 400; background: #3b82f6; padding: 2px 8px; border-radius: 4px;">v2.5 Production</span>
    </h1>
    <a href="/api/v1/docs/openapi.json" target="_blank">Download OpenAPI JSON ↗</a>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/v1/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`);
});

export default router;
