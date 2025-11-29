/**
 * Índice de servicios del chat
 * =============================
 * Centraliza las exportaciones de los servicios del chat
 * para facilitar las importaciones en otros módulos
 */

export { detectUserType, getUserTypeDescription, hasEnoughContentForAnalysis } from './userTypeDetector';
export { buildDepartmentContext, buildGeneralContext, buildMunicipioContext } from './contextBuilder';
