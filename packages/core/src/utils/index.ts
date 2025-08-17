/**
 * Utilities Index - Modular Utility Organization
 * 
 * Utilities are organized by functional responsibility following SRP:
 * - performance: Entity pooling, component caching, query optimization
 * - archetypes: Predefined entity creation patterns
 * - spatial: Spatial indexing and collision detection
 * - math: Mathematical operations and calculations
 * - components: Component management and manipulation
 */

// Performance Utilities
export * from './performance';

// Entity Archetypes
export * from './archetypes';

// Spatial Utilities
export * from './spatial';

// Math Utilities
export * from './math';

// Component Utilities
export * from './components';