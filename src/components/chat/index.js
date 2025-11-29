/**
 * CHAT COMPONENTS INDEX
 * ====================
 * 
 * Exportaciones centralizadas de todos los componentes del chat
 * para facilitar las importaciones y mantener la arquitectura limpia
 */

// Componentes principales
export { default as ChatLayout } from './ChatLayout';
export { default as ChatHeader } from './ChatHeader';
export { default as ChatMessageList } from './ChatMessageList';
export { default as ChatMessageBubble } from './ChatMessageBubble';
export { default as ChatInput } from './ChatInput';
export { default as ChatSuggestedQuestions } from './ChatSuggestedQuestions';
export { default as ChatLoadingBubble } from './ChatLoadingBubble';

// Re-exportar servicios para conveniencia
export * from '../../services/chat/energyModelService';