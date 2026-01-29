/**
 * Enum representing the health status of a backend server
 */
export enum BEServerHealth {
  /**
   * Server is healthy and can receive requests
   */
  HEALTHY = 'HEALTHY',
  
  /**
   * Server is unhealthy and should not receive requests
   */
  UNHEALTHY = 'UNHEALTHY'
}