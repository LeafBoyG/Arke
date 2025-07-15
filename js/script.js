document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Toggle for Mobile
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            body.classList.toggle('no-scroll');
        });

        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    body.classList.remove('no-scroll');
                }
            });
        });
    }

    // 2. Header Scroll Effect
    const mainHeader = document.querySelector('.main-header');
    if (mainHeader) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        });
    }

    // 3. Intersection Observer for Fade-In Elements (.js-fade-in)
    const fadeInElements = document.querySelectorAll('.js-fade-in');

    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    fadeInElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (
            (element.classList.contains('hero-content') || element.classList.contains('hero-page-header') || element.classList.contains('hero-home')) &&
            rect.top < window.innerHeight && rect.bottom > 0
        ) {
            element.classList.add('is-visible');
        } else {
            fadeInObserver.observe(element);
        }
    });

    // 4. Lazy Loading Images (.lazy.blur-up)
    const lazyImages = document.querySelectorAll('img.lazy.blur-up');

    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.onload = () => {
                        img.classList.add('lazy-loaded');
                    };
                }
                observer.unobserve(img);
            }
        });
    }, {
        threshold: 0.2
    });

    lazyImages.forEach(img => {
        lazyLoadObserver.observe(img);
    });

  // 5. Rolling Year Animation
    const rollingYearElement = document.getElementById('rolling-year');
    const animationContainer = document.querySelector('.animation-container[data-target-year]');
    const historicalDistanceTextElement = document.querySelector('.historical-distance-text');

    const rawTargetYear = animationContainer ? parseInt(animationContainer.dataset.targetYear) : null;
    const isBCE = rawTargetYear < 0;
    const yearForAnimation = isBCE ? Math.abs(rawTargetYear) : rawTargetYear;

    if (rollingYearElement && !isNaN(yearForAnimation)) {
        function createDigitSlots(year) {
            rollingYearElement.innerHTML = '';
            const yearStr = String(year);
            for (let i = 0; i < yearStr.length; i++) {
                const digit = yearStr[i];
                const slot = document.createElement('div');
                slot.classList.add('digit-slot');

                const strip = document.createElement('div');
                strip.classList.add('digit-strip');

                // Add digits 0–9
                for (let d = 0; d <= 9; d++) {
                    const span = document.createElement('span');
                    span.textContent = d;
                    strip.appendChild(span);
                }

                // Add target digit again to end strip cleanly
                const finalSpan = document.createElement('span');
                finalSpan.textContent = digit;
                strip.appendChild(finalSpan);

                // Apply long transition duration
                strip.style.transition = 'transform 5s ease-in-out';

                slot.appendChild(strip);
                rollingYearElement.appendChild(slot);
            }

            if (historicalDistanceTextElement) {
                historicalDistanceTextElement.textContent = isBCE ? 'BCE' : 'AD';
                historicalDistanceTextElement.classList.add('bce-label');
            }
        }

        function resetDigitStrips() {
            const strips = rollingYearElement.querySelectorAll('.digit-strip');
            strips.forEach(strip => {
                strip.style.transition = 'none';
                strip.style.transform = 'translateY(0)';
                strip.offsetHeight; // force reflow
                strip.style.transition = 'transform 5s ease-in-out';
            });
        }

        function animateRollingYear(targetYear) {
            const yearStr = String(targetYear);
            const digitSlots = rollingYearElement.querySelectorAll('.digit-slot');

            digitSlots.forEach((slot, index) => {
                const targetDigit = parseInt(yearStr[index]);
                const strip = slot.querySelector('.digit-strip');
                const firstSpan = strip.children[0];
                const digitHeight = firstSpan.offsetHeight || 0;

                if (digitHeight > 0 && !isNaN(targetDigit)) {
                    strip.offsetWidth; // force reflow
                    const translateY = -targetDigit * digitHeight;
                    strip.style.transform = `translateY(${translateY}px)`;
                }
            });
        }

        let hasCreatedSlots = false;

        const yearAnimationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!hasCreatedSlots) {
                        createDigitSlots(yearForAnimation);
                        hasCreatedSlots = true;
                    } else {
                        resetDigitStrips();
                    }

                    setTimeout(() => {
                        animateRollingYear(yearForAnimation);
                    }, 50);
                }
            });
        }, { threshold: 0.5 });

        // Attach the observer
        if (animationContainer) {
            yearAnimationObserver.observe(animationContainer);

            // ✅ Trigger immediately on load if already visible
            const rect = animationContainer.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                createDigitSlots(yearForAnimation);
                setTimeout(() => {
                    animateRollingYear(yearForAnimation);
                }, 50);
            }
        }
    }

    // 6. Social Share Functionality (Copy Link)
    const copyLinkBtn = document.querySelector('.share-btn.copy-link');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch (err) {
                const textArea = document.createElement('textarea');
                textArea.value = window.location.href;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                textArea.style.top = '-9999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    alert('Link copied to clipboard!');
                } catch (err) {
                    console.error('Fallback: Failed to copy text', err);
                }
                document.body.removeChild(textArea);
            }
        });
    }

    // NEW FEATURE: Reading Progress Bar
    const readingProgressBar = document.querySelector('.reading-progress-bar');
    const articleContent = document.querySelector('.article-content');

    if (readingProgressBar && articleContent) {
        window.addEventListener('scroll', () => {
            const articleRect = articleContent.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const scrollDepth = -articleRect.top;
            const effectiveScrollHeight = articleContent.scrollHeight - viewportHeight;

            let progress = 0;
            if (effectiveScrollHeight > 0) {
                progress = (scrollDepth / effectiveScrollHeight) * 100;
                progress = Math.max(0, Math.min(100, progress));
            } else {
                progress = articleRect.top <= 0 ? 100 : 0;
            }

            readingProgressBar.style.width = `${progress}%`;
        });
    }

    // NEW FEATURE: Tooltips
    const tooltips = document.querySelectorAll('.tooltip');

    tooltips.forEach(tooltip => {
        let tooltipText = tooltip.dataset.tooltip;
        let tooltipElement;

        function showTooltip() {
            document.querySelectorAll('.tooltip-popup').forEach(popup => {
                popup.style.opacity = '0';
                popup.style.visibility = 'hidden';
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            });

            if (!tooltipElement) {
                tooltipElement = document.createElement('div');
                tooltipElement.classList.add('tooltip-popup');
                tooltipElement.textContent = tooltipText;
                document.body.appendChild(tooltipElement);
            }

            const rect = tooltip.getBoundingClientRect();
            tooltipElement.style.left = `${rect.left + (rect.width / 2)}px`;
            tooltipElement.style.top = `${rect.top - 10}px`;
            tooltipElement.style.transform = `translate(-50%, -100%)`;
            tooltipElement.style.opacity = '1';
            tooltipElement.style.visibility = 'visible';
        }

        function hideTooltip() {
            if (tooltipElement) {
                tooltipElement.style.opacity = '0';
                tooltipElement.style.visibility = 'hidden';
                setTimeout(() => {
                    if (tooltipElement && tooltipElement.parentNode) {
                        tooltipElement.parentNode.removeChild(tooltipElement);
                        tooltipElement = null;
                    }
                }, 300);
            }
        }

        tooltip.addEventListener('mouseenter', showTooltip);
        tooltip.addEventListener('mouseleave', hideTooltip);
        tooltip.addEventListener('focus', showTooltip);
        tooltip.addEventListener('blur', hideTooltip);

        let touchTimer;
        tooltip.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (tooltipElement && tooltipElement.style.visibility === 'visible') {
                hideTooltip();
            } else {
                showTooltip();
                touchTimer = setTimeout(hideTooltip, 3000);
            }
        });
        tooltip.addEventListener('touchend', () => {
            clearTimeout(touchTimer);
        });
    });

    // Update copyright
    const copyrightYearElement = document.querySelector('.copyright-year');
    if (copyrightYearElement) {
        copyrightYearElement.textContent = new Date().getFullYear();
    }
});
