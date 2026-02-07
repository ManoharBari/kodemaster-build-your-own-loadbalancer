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
}

/**
 * Singleton Configuration Manager
 * Loads and validates the config.json file at startup
 */
export class Config {
  private static instance: Config | null = null;
  private config: IConfig | null = null;

  // Public properties for LBServer compatibility
  public lbPort: number = 7000;
  public backendServers: BackendServerConfig[] = [];
  public health_check_interval?: number = 10;

  /**
   * Private constructor to enforce Singleton pattern
   */
  private constructor() {}

  /**
   * Joi validation schema for the configuration
   */
  private static readonly configSchema = Joi.object({
    lbPORT: Joi.number().port().required().messages({
      "number.base": "lbPORT must be a number",
      "number.port": "lbPORT must be a valid port number (0-65535)",
      "any.required": "lbPORT is required",
    }),
    lbAlgo: Joi.string().valid("rand", "rr", "wrr").required().messages({
      "string.base": "lbAlgo must be a string",
      "any.only": "lbAlgo must be one of [rand, rr, wrr]",
      "any.required": "lbAlgo is required",
    }),
    be_servers: Joi.array()
      .items(
        Joi.object({
          domain: Joi.string().uri().required().messages({
            "string.base": "domain must be a string",
            "string.uri": "domain must be a valid URI",
            "any.required": "domain is required for each backend server",
          }),
          weight: Joi.number().integer().min(1).required().messages({
            "number.base": "weight must be a number",
            "number.integer": "weight must be an integer",
            "number.min": "weight must be at least 1",
            "any.required": "weight is required for each backend server",
          }),
        }),
      )
      .min(1)
      .required()
      .messages({
        "array.base": "be_servers must be an array",
        "array.min": "be_servers must contain at least 1 server",
        "any.required": "be_servers is required",
      }),
  }).unknown(false); // Strict validation - no extra fields allowed

  /**
   * Load and validate the configuration file
   * Should be called once at application startup
   * @param configPath - Path to the config file (defaults to ./config.json)
   */
  public static load(configPath: string = "./config.json"): Config {
    if (Config.instance !== null) {
      console.warn(
        "⚠️  Configuration already loaded. Returning existing instance...",
      );
      return Config.instance;
    }

    try {
      // Resolve the absolute path
      const absolutePath = path.resolve(process.cwd(), configPath);

      // Check if file exists
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Configuration file not found at: ${absolutePath}`);
      }

      // Read the configuration file
      const fileContent = fs.readFileSync(absolutePath, "utf-8");

      // Parse JSON
      let configData: any;
      try {
        configData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error(
          `Invalid JSON in configuration file: ${(parseError as Error).message}`,
        );
      }

      // Validate using Joi
      const { error, value } = Config.configSchema.validate(configData, {
        abortEarly: false, // Collect all errors
        allowUnknown: false, // Strict mode
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

      // Map to public properties for LBServer compatibility
      Config.instance.lbPort = value.lbPORT;
      Config.instance.backendServers = value.be_servers.map(
        (server: IBackendServer) => ({
          url: server.domain,
          weight: server.weight,
        }),
      );

      console.log("✅ Configuration loaded and validated successfully");
      console.log(`   Port: ${value.lbPORT}`);
      console.log(`   Algorithm: ${value.lbAlgo}`);
      console.log(`   Backend Servers: ${value.be_servers.length}`);

      return Config.instance;
    } catch (error) {
      console.error("❌ Failed to load configuration:");
      console.error(`   ${(error as Error).message}`);
      process.exit(1); // Fail fast
    }
  }

  /**
   * Get the singleton configuration instance
   * @returns The Config instance
   * @throws Error if configuration hasn't been loaded yet
   */
  public static getInstance(): Config {
    if (Config.instance === null) {
      throw new Error(
        "Configuration not loaded. Call Config.load() first before accessing config.",
      );
    }
    return Config.instance;
  }

  /**
   * Get the singleton configuration instance (backward compatibility)
   * @returns The validated configuration object
   * @throws Error if configuration hasn't been loaded yet
   */
  public static getConfig(): IConfig {
    if (Config.instance === null || Config.instance.config === null) {
      throw new Error(
        "Configuration not loaded. Call Config.load() first before accessing config.",
      );
    }
    return Config.instance.config;
  }

  /**
   * Reset the singleton instance (useful for testing)
   * @internal
   */
  public static reset(): void {
    Config.instance = null;
  }
}
