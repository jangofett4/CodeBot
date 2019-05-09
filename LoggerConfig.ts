// This file is used for setting up logging.
// Bot is not fail-safe, it might abort with an exception. Always use 'node bot.js > bot.log' to keep logs.
import { Category,CategoryServiceFactory,CategoryConfiguration,LogLevel } from "typescript-logging";

CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info));

export const logCatBot = new Category("codebot");