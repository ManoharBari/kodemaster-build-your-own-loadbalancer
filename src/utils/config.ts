import Joi from "joi";
import * as fs from "fs";
import * as path from "path";

/**
 * Interface representing a backend server configuration
 */
export interface IBackendServer {
  domain: string;
  weight: number;
}

export interface SSLConfig {
  enabled: boolean;
  key_path: string;
  cert_path: string;
}

/**
 * Interface for BackendServerDetails compatibility
 */
export interface BackendServerConfig {
  url: string;
  weight?: number;
}

/**
 * Interface representing the complete configuration
 */
export interface IConfig {
  lbPORT: number;
  lbAlgo: "rand" | "rr" | "wrr";
  be_servers: IBackendServer[];
  ssl?: SSLConfig;
}

/**
 * Singleton Configuration Manager
 */
export class Config {
  private static instance: Config | null = null;
  private config: IConfig | null = null;

  // Public properties for LBServer compatibility
  public lbPort: number = 7000;
  public backendServers: BackendServerConfig[] = [];
  public health_check_interval?: number;
  public ssl?: SSLConfig;

  private constructor() {}

  /**
   * Joi validation schema
   */
  private static readonly configSchema = Joi.object({
    lbPORT: Joi.number().port().required(),
    lbAlgo: Joi.string().valid("rand", "rr", "wrr").required(),

    be_servers: Joi.array()
      .items(
        Joi.object({
          domain: Joi.string().uri().required(),
          weight: Joi.number().integer().min(1).required(),
        }),
      )
      .min(1)
      .required(),

    ssl: Joi.object({
      enabled: Joi.boolean().required(),
      key_path: Joi.string().required(),
      cert_path: Joi.string().required(),
    }).optional(),
  }).unknown(false);

  /**
   * Load and validate config
   */
  public static load(configPath: string = "./config.json"): Config {
    if (Config.instance !== null) {
      console.warn(
        "⚠️  Configuration already loaded. Returning existing instance...",
      );
      return Config.instance;
    }

    try {
      const absolutePath = path.resolve(process.cwd(), configPath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Configuration file not found at: ${absolutePath}`);
      }

      const fileContent = fs.readFileSync(absolutePath, "utf-8");

      let configData: any;
      try {
        configData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error(
          `Invalid JSON in configuration file: ${(parseError as Error).message}`,
        );
      }

      const { error, value } = Config.configSchema.validate(configData, {
        abortEarly: false,
        allowUnknown: false,
      });

      if (error) {
        const errorMessages = error.details
          .map((detail) => detail.message)
          .join("\n  - ");
        throw new Error(
          `Configuration validation failed:\n  - ${errorMessages}`,
        );
      }

      // Create singleton instance
      Config.instance = new Config();
      Config.instance.config = value as IConfig;

      // Map values
      Config.instance.lbPort = value.lbPORT;

      Config.instance.backendServers = value.be_servers.map(
        (server: IBackendServer) => ({
          url: server.domain,
          weight: server.weight,
        }),
      );

      // Assign SSL config
      if (value.ssl) {
        Config.instance.ssl = value.ssl;
      }

      console.log("✅ Configuration loaded and validated successfully");
      console.log(`   Port: ${value.lbPORT}`);
      console.log(`   Algorithm: ${value.lbAlgo}`);
      console.log(`   Backend Servers: ${value.be_servers.length}`);

      if (value.ssl?.enabled) {
        console.log("🔒 SSL enabled");
      }

      return Config.instance;
    } catch (error) {
      console.error("❌ Failed to load configuration:");
      console.error(`   ${(error as Error).message}`);
      process.exit(1);
    }
  }

  public static getInstance(): Config {
    if (Config.instance === null) {
      throw new Error("Configuration not loaded. Call Config.load() first.");
    }
    return Config.instance;
  }

  public static getConfig(): IConfig {
    if (Config.instance === null || Config.instance.config === null) {
      throw new Error("Configuration not loaded. Call Config.load() first.");
    }
    return Config.instance.config;
  }

  public static reset(): void {
    Config.instance = null;
  }
}
