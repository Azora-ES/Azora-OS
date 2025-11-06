/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Orchestrator Logger with Winston
 */

import winston from 'winston';
import path from 'path';
import { ORCHESTRATOR_CONFIG } from '../orchestrator-config';

const logDir = path.join(__dirname, '../../../logs/orchestrator');

// Create custom format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]`;
    if (service) msg += ` [${service}]`;
    msg += `: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    
    return msg;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: ORCHESTRATOR_CONFIG.logLevel,
  format: customFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDir, 'orchestrator.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    // File transport for errors only
    new winston.transports.File({
      filename: path.join(logDir, 'orchestrator-errors.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5
    })
  ]
});

// Create service-specific logger
export function createServiceLogger(serviceName: string) {
  return {
    debug: (message: string, meta?: any) => 
      logger.debug(message, { service: serviceName, ...meta }),
    info: (message: string, meta?: any) => 
      logger.info(message, { service: serviceName, ...meta }),
    warn: (message: string, meta?: any) => 
      logger.warn(message, { service: serviceName, ...meta }),
    error: (message: string, meta?: any) => 
      logger.error(message, { service: serviceName, ...meta })
  };
}

// Log orchestrator startup
logger.info('Master Orchestrator Logger initialized', {
  logLevel: ORCHESTRATOR_CONFIG.logLevel,
  logDir
});
