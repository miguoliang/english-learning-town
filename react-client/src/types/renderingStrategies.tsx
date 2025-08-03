/**
 * Rendering Strategies for Range objects
 * Strategy pattern for different visual representations
 */

import type { ReactNode } from 'react';

export interface RenderingStrategy {
  render(props: RenderProps): ReactNode;
}

export interface RenderProps {
  screenX: number;
  screenY: number;
  screenWidth: number;
  screenHeight: number;
  onClick?: () => void;
}

/**
 * Static image rendering strategy
 */
export class StaticImageStrategy implements RenderingStrategy {
  constructor(
    private readonly imageUrl: string,
    private readonly alt: string = 'Range image'
  ) {}

  render({ screenX, screenY, screenWidth, screenHeight, onClick }: RenderProps): ReactNode {
    return (
      <img
        src={this.imageUrl}
        alt={this.alt}
        style={{
          position: 'absolute',
          left: screenX,
          top: screenY,
          width: screenWidth,
          height: screenHeight,
          cursor: onClick ? 'pointer' : 'default',
          objectFit: 'cover'
        }}
        onClick={onClick}
      />
    );
  }
}

/**
 * Emoji/icon rendering strategy
 */
export class EmojiStrategy implements RenderingStrategy {
  constructor(
    private readonly emoji: string,
    private readonly backgroundColor?: string,
    private readonly borderColor?: string
  ) {}

  render({ screenX, screenY, screenWidth, screenHeight, onClick }: RenderProps): ReactNode {
    return (
      <div
        style={{
          position: 'absolute',
          left: screenX,
          top: screenY,
          width: screenWidth,
          height: screenHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.min(screenWidth, screenHeight) * 0.6,
          cursor: onClick ? 'pointer' : 'default',
          backgroundColor: this.backgroundColor,
          border: this.borderColor ? `2px solid ${this.borderColor}` : 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          userSelect: 'none'
        }}
        onClick={onClick}
      >
        {this.emoji}
      </div>
    );
  }
}

/**
 * Animated GIF rendering strategy
 */
export class AnimatedGifStrategy implements RenderingStrategy {
  constructor(
    private readonly gifUrl: string,
    private readonly alt: string = 'Animated range'
  ) {}

  render({ screenX, screenY, screenWidth, screenHeight, onClick }: RenderProps): ReactNode {
    return (
      <img
        src={this.gifUrl}
        alt={this.alt}
        style={{
          position: 'absolute',
          left: screenX,
          top: screenY,
          width: screenWidth,
          height: screenHeight,
          cursor: onClick ? 'pointer' : 'default',
          objectFit: 'cover',
          imageRendering: 'pixelated' // For retro game feel
        }}
        onClick={onClick}
      />
    );
  }
}

/**
 * CSS-based animated rendering strategy
 */
export class CSSAnimationStrategy implements RenderingStrategy {
  constructor(
    private readonly content: ReactNode,
    private readonly animationClass: string,
    private readonly backgroundColor?: string
  ) {}

  render({ screenX, screenY, screenWidth, screenHeight, onClick }: RenderProps): ReactNode {
    return (
      <div
        className={this.animationClass}
        style={{
          position: 'absolute',
          left: screenX,
          top: screenY,
          width: screenWidth,
          height: screenHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
          backgroundColor: this.backgroundColor,
          borderRadius: '8px',
          userSelect: 'none'
        }}
        onClick={onClick}
      >
        {this.content}
      </div>
    );
  }
}

/**
 * Sprite sheet animation strategy
 */
export class SpriteSheetStrategy implements RenderingStrategy {
  constructor(
    private readonly spriteSheetUrl: string,
    private readonly frameWidth: number,
    private readonly frameHeight: number,
    private readonly frameCount: number,
    private readonly animationSpeed: number = 500 // ms per frame
  ) {}

  render({ screenX, screenY, screenWidth, screenHeight, onClick }: RenderProps): ReactNode {
    const keyframes = Array.from({ length: this.frameCount }, (_, i) => {
      const percentage = (i / (this.frameCount - 1)) * 100;
      const backgroundPositionX = -i * this.frameWidth;
      return `${percentage}% { background-position: ${backgroundPositionX}px 0; }`;
    }).join(' ');

    const animationName = `sprite-${Math.random().toString(36).substr(2, 9)}`;
    const animationDuration = this.frameCount * this.animationSpeed;

    // Inject keyframes into document
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ${animationName} {
        ${keyframes}
      }
    `;
    document.head.appendChild(style);

    return (
      <div
        style={{
          position: 'absolute',
          left: screenX,
          top: screenY,
          width: screenWidth,
          height: screenHeight,
          backgroundImage: `url(${this.spriteSheetUrl})`,
          backgroundSize: `${this.frameWidth * this.frameCount}px ${this.frameHeight}px`,
          backgroundRepeat: 'no-repeat',
          animation: `${animationName} ${animationDuration}ms infinite`,
          cursor: onClick ? 'pointer' : 'default'
        }}
        onClick={onClick}
      />
    );
  }
}