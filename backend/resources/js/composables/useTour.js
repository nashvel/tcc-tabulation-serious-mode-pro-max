import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

export function useTour(tourKey, steps) {
  const isActive = ref(false);
  const currentStep = ref(0);
  const tooltipStyle = ref({});
  const arrowStyle = ref({});
  const placement = ref('bottom');

  // Check if tour was completed before
  const tourCompleted = () => {
    return localStorage.getItem(`tour_${tourKey}_completed`) === 'true';
  };

  const markTourCompleted = () => {
    localStorage.setItem(`tour_${tourKey}_completed`, 'true');
  };

  const startTour = () => {
    currentStep.value = 0;
    isActive.value = true;
    nextTick(() => positionTooltip());
  };

  const endTour = (completed = true) => {
    isActive.value = false;
    if (completed) markTourCompleted();
  };

  const nextStep = () => {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++;
      nextTick(() => positionTooltip());
    } else {
      endTour(true);
    }
  };

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
      nextTick(() => positionTooltip());
    }
  };

  const positionTooltip = () => {
    const step = steps[currentStep.value];
    if (!step?.target) return;

    const target = document.querySelector(step.target);
    if (!target) {
      // Target not found, skip to next or end
      if (currentStep.value < steps.length - 1) {
        currentStep.value++;
        nextTick(() => positionTooltip());
      } else {
        endTour(true);
      }
      return;
    }

    const rect = target.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 150;
    const padding = 12;
    const arrowSize = 8;

    // Highlight the target
    target.style.position = 'relative';
    target.style.zIndex = '1001';
    target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.3)';
    target.style.borderRadius = '8px';

    // Determine best placement
    let preferredPlacement = step.placement || 'bottom';
    placement.value = preferredPlacement;

    let top, left, arrowTop, arrowLeft;

    switch (preferredPlacement) {
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrowTop = -arrowSize;
        arrowLeft = tooltipWidth / 2 - arrowSize;
        break;
      case 'top':
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrowTop = tooltipHeight;
        arrowLeft = tooltipWidth / 2 - arrowSize;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        arrowTop = tooltipHeight / 2 - arrowSize;
        arrowLeft = tooltipWidth;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        arrowTop = tooltipHeight / 2 - arrowSize;
        arrowLeft = -arrowSize;
        break;
    }

    // Keep tooltip in viewport
    left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - tooltipHeight - 10));

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
  };

  // Cleanup highlights when tour ends or step changes
  const cleanupHighlights = () => {
    document.querySelectorAll('[style*="z-index: 1001"]').forEach(el => {
      el.style.zIndex = '';
      el.style.boxShadow = '';
      el.style.position = '';
      el.style.borderRadius = '';
    });
  };

  // Watch for step changes to cleanup previous highlights
  const handleStepChange = () => {
    cleanupHighlights();
    if (isActive.value) {
      nextTick(() => positionTooltip());
    }
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
