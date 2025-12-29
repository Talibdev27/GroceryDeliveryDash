import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import multer from "multer";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { autoFixDatabase } from "../scripts/auto-fix-database";

const app = express();
app.set("trust proxy", 1);
// CORS (safe default: allow same-origin in production; allow configured origins otherwise)
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (_origin, callback) => {
    if (app.get("env") === "production" && allowedOrigins.length === 0) {
      // In production, if no CORS_ORIGIN provided we assume same-origin and deny cross-site
      return callback(null, false);
    }
    if (!allowedOrigins.length || (typeof _origin === "string" && allowedOrigins.includes(_origin))) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Multer configuration for file uploads (memory storage for Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."));
  },
});

// Make upload middleware available to routes
app.set("upload", upload);

// Session configuration
const SESSION_SECRET = process.env.SESSION_SECRET;
const DEFAULT_SECRET = "your-secret-key-change-in-production";

if (!SESSION_SECRET || SESSION_SECRET === DEFAULT_SECRET) {
  if (app.get("env") === "production") {
    throw new Error(
      "SESSION_SECRET environment variable must be set in production. " +
      "Generate a strong secret with: openssl rand -base64 32"
    );
  } else {
    console.warn(
      "⚠️  WARNING: Using default SESSION_SECRET. " +
      "Set SESSION_SECRET environment variable for production."
    );
  }
}

app.use(session({
  secret: SESSION_SECRET || DEFAULT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Auto-fix database on startup
  try {
    await autoFixDatabase();
  } catch (error) {
    console.error("Database auto-fix failed:", error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on port 4000 for development
  // this serves both the API and the client.
  const port = process.env.PORT || 4000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
