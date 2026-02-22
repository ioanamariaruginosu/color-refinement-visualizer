let currentStep = 0;

/** Move to the previous step if one exists. */
function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        renderStep(currentStep);
    }
}

function nextStep() {
    if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep(currentStep);
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') prevStep();
    if (e.key === 'ArrowRight') nextStep();
});

/**
 * Update all step-bar elements to reflect the given step index.
 * - Updates title and description text
 * - Enables/disables prev/next buttons
 * - Updates the step counter (e.g. "2 / 5")
 * - Refreshes progress dot states
 *
 * @param {number} idx - The step index to display.
 */
function updateStepUI(idx) {
    const step = steps[idx];

    document.getElementById('stepTitle').textContent = step.title;
    document.getElementById('stepDesc').textContent = step.desc;
    document.getElementById('stepCounter').textContent = `${idx + 1} / ${steps.length}`;
    document.getElementById('prevBtn').disabled = idx === 0;
    document.getElementById('nextBtn').disabled = idx === steps.length - 1;

    refreshProgressDots(idx);
}

/**
 * Build the row of progress dots from scratch.
 * Called once when a new run starts.
 * Capped at 20 dots to avoid overflow on long runs.
 */
function buildProgressDots() {
    const container = document.getElementById('progressDots');
    container.innerHTML = '';
    const count = Math.min(steps.length, 20);
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        container.appendChild(dot);
    }
}

/**
 * Update dot CSS classes to reflect which step is current.
 * - Past steps: class "done" (accent color)
 * - Current step: class "current" (accent2, slightly larger)
 * - Future steps: no extra class (gray)
 *
 * @param {number} idx - Current step index.
 */
function refreshProgressDots(idx) {
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach((dot, i) => {
        dot.className = 'progress-dot';
        if (i < idx) dot.classList.add('done');
        else if (i === idx) dot.classList.add('current');
    });
}

(function attachSwipe() {
    const area = document.getElementById('graphArea');
    let startX = 0;
    let startY = 0;

    area.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    area.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;

        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) nextStep();
            else prevStep();
        }
    }, { passive: true });
})();
