import { computed } from 'vue';
import type { AriaProps } from '~/types';

export function useAccessibility() {
  function generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  function createAriaProps(props: Partial<AriaProps>): AriaProps {
    return {
      label: props.label,
      describedBy: props.describedBy,
      controls: props.controls,
      expanded: props.expanded,
      pressed: props.pressed,
      selected: props.selected,
      disabled: props.disabled,
      hidden: props.hidden
    };
  }

  function getAriaAttributes(props: AriaProps): Record<string, string | boolean | undefined> {
    const attributes: Record<string, string | boolean | undefined> = {};
    
    if (props.label) attributes['aria-label'] = props.label;
    if (props.describedBy) attributes['aria-describedby'] = props.describedBy;
    if (props.controls) attributes['aria-controls'] = props.controls;
    if (props.expanded !== undefined) attributes['aria-expanded'] = props.expanded;
    if (props.pressed !== undefined) attributes['aria-pressed'] = props.pressed;
    if (props.selected !== undefined) attributes['aria-selected'] = props.selected;
    if (props.disabled !== undefined) attributes['aria-disabled'] = props.disabled;
    if (props.hidden !== undefined) attributes['aria-hidden'] = props.hidden;
    
    return attributes;
  }

  function createLiveRegion(level: 'polite' | 'assertive' = 'polite') {
    const id = generateId('live-region');
    
    return {
      id,
      attributes: {
        'aria-live': level,
        'aria-atomic': 'true',
        'aria-relevant': 'text',
        role: 'status'
      }
    };
  }

  function createAnnouncement(message: string, level: 'polite' | 'assertive' = 'polite'): void {
    const { id, attributes } = createLiveRegion(level);
    
    // Create temporary element for announcement
    const announcement = document.createElement('div');
    announcement.id = id;
    Object.entries(attributes).forEach(([key, value]) => {
      announcement.setAttribute(key, value as string);
    });
    announcement.textContent = message;
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }

  function createFocusTrap(element: HTMLElement): () => void {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    function handleKeydown(event: KeyboardEvent): void {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
    
    element.addEventListener('keydown', handleKeydown);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleKeydown);
    };
  }

  function createSkipLink(targetId: string, text: string = 'Skip to main content'): string {
    return `
      <a href="#${targetId}" 
         class="skip-link" 
         style="position: absolute; top: -40px; left: 6px; z-index: 1000; padding: 8px 16px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;"
         onfocus="this.style.top='6px'"
         onblur="this.style.top='-40px'">
        ${text}
      </a>
    `;
  }

  return {
    generateId,
    createAriaProps,
    getAriaAttributes,
    createLiveRegion,
    createAnnouncement,
    createFocusTrap,
    createSkipLink
  };
} 