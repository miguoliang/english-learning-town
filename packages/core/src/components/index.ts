/**
 * ECS Components - Modular Component Organization
 *
 * Components are organized by domain responsibility following SRP:
 * - spatial: Position, size, collision, velocity
 * - visual: Rendering, animation, visual presentation
 * - interaction: User input, interactive elements
 * - game: Player, NPC, buildings, game-specific entities
 * - enhanced: Health, AI, physics, audio, advanced features
 */

// Spatial Components
export * from "./spatial";

// Visual Components
export * from "./visual";

// Interaction Components
export * from "./interaction";

// Game-Specific Components
export * from "./game";

// Enhanced Gameplay Components
export * from "./enhanced";
