/**
 * Animation Manager
 * Centralized system to manage all animations and prevent conflicts
 * Ensures no two animations are simultaneously applied to the same element
 */

export interface AnimationState {
	elementId: string;
	animationName: string;
	isActive: boolean;
	startTime: number;
	duration: number;
}

export interface AnimationManager {
	startAnimation(elementId: string, animationName: string, duration: number): void;
	stopAnimation(elementId: string): void;
	isAnimating(elementId: string): boolean;
	getActiveAnimation(elementId: string): AnimationState | null;
	clearAnimationState(elementId: string): void;
}

/**
 * Implementation of AnimationManager
 * Tracks active animations and prevents simultaneous animations on the same element
 */
export class AnimationManagerImpl implements AnimationManager {
	private activeAnimations: Map<string, AnimationState> = new Map();
	private animationTimeouts: Map<string, NodeJS.Timeout> = new Map();

	/**
	 * Start an animation on an element
	 * If an animation is already active, it will be stopped first
	 */
	startAnimation(elementId: string, animationName: string, duration: number): void {
		// Stop any existing animation on this element
		if (this.isAnimating(elementId)) {
			this.stopAnimation(elementId);
		}

		const animationState: AnimationState = {
			elementId,
			animationName,
			isActive: true,
			startTime: Date.now(),
			duration,
		};

		this.activeAnimations.set(elementId, animationState);

		// Auto-cleanup after animation duration
		const timeout = setTimeout(() => {
			this.clearAnimationState(elementId);
		}, duration);

		this.animationTimeouts.set(elementId, timeout);
	}

	/**
	 * Stop an animation on an element
	 */
	stopAnimation(elementId: string): void {
		const timeout = this.animationTimeouts.get(elementId);
		if (timeout) {
			clearTimeout(timeout);
			this.animationTimeouts.delete(elementId);
		}

		const animation = this.activeAnimations.get(elementId);
		if (animation) {
			animation.isActive = false;
		}
	}

	/**
	 * Check if an element is currently animating
	 */
	isAnimating(elementId: string): boolean {
		const animation = this.activeAnimations.get(elementId);
		return animation ? animation.isActive : false;
	}

	/**
	 * Get the active animation state for an element
	 */
	getActiveAnimation(elementId: string): AnimationState | null {
		const animation = this.activeAnimations.get(elementId);
		return animation && animation.isActive ? animation : null;
	}

	/**
	 * Clear animation state for an element
	 */
	clearAnimationState(elementId: string): void {
		const timeout = this.animationTimeouts.get(elementId);
		if (timeout) {
			clearTimeout(timeout);
			this.animationTimeouts.delete(elementId);
		}
		this.activeAnimations.delete(elementId);
	}

	/**
	 * Clear all animation states (useful for cleanup)
	 */
	clearAllAnimations(): void {
		this.animationTimeouts.forEach((timeout) => clearTimeout(timeout));
		this.animationTimeouts.clear();
		this.activeAnimations.clear();
	}
}

// Export a singleton instance
export const animationManager = new AnimationManagerImpl();
