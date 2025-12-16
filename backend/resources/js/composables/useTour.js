import { ref, onUnmounted } from 'vue';

export function useTour(tourKey, steps) {
  const isActive = ref(false);
  const currentStep = ref(0);
  const tooltipStyle = ref({});
  const arrowStyle = ref({});
  const placement = ref('bottom');
  let highlightedElement = null;

  // Check if tour was completed before
  const tourCompleted = () => {
    return localStorage.getItem(`tour_${tourKey}_completed`) === 'true';
  };

  const markTourCompleted = () => {
    localStorage.setItem(`tour_${tourKey}_completed`, 'true');
  };

  // Cleanup highlights
  const cleanupHighlights = () => {
    if (highlightedElement) {
      highlightedElement.style.position = '';
      highlightedElement.style.zIndex = '';
      highlightedElement.style.boxShadow = '';
      highlightedElement.style.borderRadius = '';
      highlightedElement.style.background = '';
      highlightedElement.removeAttribute('data-tour-highlight');
      highlightedElement = null;
    }
    // Also cleanup any orphaned highlights
    document.querySelectorAll('[data-tour-highlight="true"]').forEach(el => {
      el.style.position = '';
      el.style.zIndex = '';
      el.style.boxShadow = '';
      el.style.borderRadius = '';
      el.style.background = '';
      el.removeAttribute('data-tour-highlight');
    });
  };

  const startTour = () => {
    cleanupHighlights();
    currentStep.value = 0;
    isActive.value = true;
    // Use longer delay to ensure DOM is ready
    setTimeout(() => {
      positionTooltip();
    }, 200);
  };

  const endTour = (completed = true) => {
    cleanupHighlights();
    isActive.value = false;
    if (completed) markTourCompleted();
  };

  const nextStep = () => {
    cleanupHighlights();
    if (currentStep.value < steps.length - 1) {
      currentStep.value++;
      setTimeout(() => positionTooltip(), 150);
    } else {
      endTour(true);
    }
  };

  const prevStep = () => {
    cleanupHighlights();
    if (currentStep.value > 0) {
      currentStep.value--;
      setTimeout(() => positionTooltip(), 150);
    }
  };

  const positionTooltip = () => {
    const step = steps[currentStep.value];
    if (!step?.target) return;

    // Try multiple selectors (first match wins)
    const selectors = step.target.split(',').map(s => s.trim());
    let target = null;
    
    for (const selector of selectors) {
      target = document.querySelector(selector);
      if (target) break;
    }

    if (!target) {
      console.warn(`[Tour] Target not found: ${step.target}`);
      // Target not found, skip to next or end
      if (currentStep.value < steps.length - 1) {
        currentStep.value++;
        setTimeout(() => positionTooltip(), 150);
      } else {
        endTour(true);
      }
      return;
    }

    // Scroll target into view if needed
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Wait for scroll to complete
    setTimeout(() => {
      const rect = target.getBoundingClientRect();
      const tooltipWidth = 300;
      const tooltipHeight = 140;
      const padding = 16;
      const arrowSize = 8;

      // Highlight the target
      highlightedElement = target;
      target.setAttribute('data-tour-highlight', 'true');
      target.style.position = 'relative';
      target.style.zIndex = '1001';
      target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.5), 0 0 30px rgba(79, 70, 229, 0.3)';
      target.style.borderRadius = '8px';
      target.style.background = 'white';

      // Determine best placement based on available space
      let preferredPlacement = step.placement || 'bottom';
      
      // Auto-adjust placement if not enough space
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;

      if (preferredPlacement === 'bottom' && spaceBelow < tooltipHeight + padding) {
        preferredPlacement = spaceAbove > spaceBelow ? 'top' : 'bottom';
      } else if (preferredPlacement === 'top' && spaceAbove < tooltipHeight + padding) {
        preferredPlacement = spaceBelow > spaceAbove ? 'bottom' : 'top';
      } else if (preferredPlacement === 'right' && spaceRight < tooltipWidth + padding) {
        preferredPlacement = spaceLeft > spaceRight ? 'left' : 'right';
      } else if (preferredPlacement === 'left' && spaceLeft < tooltipWidth + padding) {
        preferredPlacement = spaceRight > spaceLeft ? 'right' : 'left';
      }

      placement.value = preferredPlacement;

      let top, left, arrowTop, arrowLeft;

      switch (preferredPlacement) {
        case 'bottom':
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrowTop = -arrowSize * 2;
          arrowLeft = tooltipWidth / 2 - arrowSize;
          break;
        case 'top':
          top = rect.top - tooltipHeight - padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrowTop = tooltipHeight - 4;
          arrowLeft = tooltipWidth / 2 - arrowSize;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - padding;
          arrowTop = tooltipHeight / 2 - arrowSize;
          arrowLeft = tooltipWidth - 4;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + padding;
          arrowTop = tooltipHeight / 2 - arrowSize;
          arrowLeft = -arrowSize * 2;
          break;
      }

      // Keep tooltip in viewport
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

      tooltipStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`,
        zIndex: 1002
      };

      arrowStyle.value = {
        position: 'absolute',
        top: `${arrowTop}px`,
        left: `${arrowLeft}px`
      };
    }, 150);
  };

  onUnmounted(() => {
    cleanupHighlights();
  });

  return {
    isActive,
    currentStep,
    tooltipStyle,
    arrowStyle,
    placement,
    startTour,
    endTour,
    nextStep,
    prevStep,
    tourCompleted
  };
}
