/**
 * ==========================================
 * EDEE STUDIO — SECURITY MODULE
 * Protection côté client
 * ==========================================
 */

const EdeeSecurity = (() => {
    'use strict';

    // ============ CSP NONCE HELPER ============
    const generateNonce = () => {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    };

    // ============ XSS SANITIZER ============
    const sanitize = (str) => {
        if (typeof str !== 'string') return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        return str.replace(/[&<>"'`=/]/g, s => map[s]);
    };

    // ============ INPUT VALIDATION ============
    const validators = {
        name: (val) => {
            const clean = val.trim();
            if (clean.length < 2) return { valid: false, msg: 'Le nom doit contenir au moins 2 caractères.' };
            if (clean.length > 100) return { valid: false, msg: 'Le nom est trop long (max 100).' };
            if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(clean)) return { valid: false, msg: 'Le nom contient des caractères non autorisés.' };
            return { valid: true, value: sanitize(clean) };
        },
        email: (val) => {
            const clean = val.trim().toLowerCase();
            if (clean.length > 254) return { valid: false, msg: 'Email trop long.' };
            const emailRegex = /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z]{2,})+$/;
            if (!emailRegex.test(clean)) return { valid: false, msg: 'Veuillez entrer un email valide.' };
            return { valid: true, value: clean };
        },
        phone: (val) => {
            const clean = val.trim().replace(/\s+/g, '');
            if (clean === '') return { valid: true, value: '' };
            if (!/^\+?[0-9]{8,15}$/.test(clean)) return { valid: false, msg: 'Numéro de téléphone invalide.' };
            return { valid: true, value: clean };
        },
        message: (val) => {
            const clean = val.trim();
            if (clean.length < 10) return { valid: false, msg: 'Le message doit contenir au moins 10 caractères.' };
            if (clean.length > 2000) return { valid: false, msg: 'Le message est trop long (max 2000).' };
            return { valid: true, value: sanitize(clean) };
        },
        select: (val) => {
            if (!val || val === '') return { valid: false, msg: 'Veuillez sélectionner une option.' };
            return { valid: true, value: sanitize(val) };
        }
    };

    // ============ RATE LIMITER ============
    const rateLimiter = (() => {
        const submissions = [];
        const MAX_SUBMISSIONS = 3;
        const TIME_WINDOW = 300000; // 5 minutes

        return {
            canSubmit: () => {
                const now = Date.now();
                // Remove old entries
                while (submissions.length > 0 && now - submissions[0] > TIME_WINDOW) {
                    submissions.shift();
                }
                return submissions.length < MAX_SUBMISSIONS;
            },
            recordSubmission: () => {
                submissions.push(Date.now());
            },
            getRemaining: () => {
                const now = Date.now();
                while (submissions.length > 0 && now - submissions[0] > TIME_WINDOW) {
                    submissions.shift();
                }
                return MAX_SUBMISSIONS - submissions.length;
            },
            getResetTime: () => {
                if (submissions.length === 0) return 0;
                const oldest = submissions[0];
                const resetIn = TIME_WINDOW - (Date.now() - oldest);
                return Math.max(0, Math.ceil(resetIn / 1000));
            }
        };
    })();

    // ============ HONEYPOT CHECKER ============
    const checkHoneypot = (form) => {
        const honeypot = form.querySelector('[name="website_url"]');
        if (honeypot && honeypot.value !== '') {
            console.warn('[Security] Bot detected via honeypot');
            return false;
        }
        return true;
    };

    // ============ TIMING CHECK ============
    const timingCheck = (() => {
        let formLoadTime = null;
        const MIN_FILL_TIME = 3000; // 3 seconds minimum

        return {
            start: () => { formLoadTime = Date.now(); },
            isValid: () => {
                if (!formLoadTime) return true;
                return (Date.now() - formLoadTime) >= MIN_FILL_TIME;
            }
        };
    })();

    // ============ CSRF TOKEN GENERATOR ============
    const csrfToken = (() => {
        let token = null;

        return {
            generate: () => {
                token = generateNonce();
                sessionStorage.setItem('_csrf', token);
                return token;
            },
            get: () => token || sessionStorage.getItem('_csrf'),
            validate: (inputToken) => {
                const stored = sessionStorage.getItem('_csrf');
                return stored && stored === inputToken;
            }
        };
    })();

    // ============ ANTI-SPAM PATTERNS ============
    const spamPatterns = [
        /\b(viagra|cialis|casino|lottery|winner|congratulations)\b/i,
        /(http[s]?:\/\/.*){3,}/i,  // More than 3 URLs
        /(.)\1{10,}/,              // Repeated characters
        /\[url=/i,                 // BBCode
        /<script/i,                // Script tags
        /javascript:/i,            // JS protocol
        /on\w+\s*=/i,             // Event handlers
    ];

    const isSpam = (text) => {
        return spamPatterns.some(pattern => pattern.test(text));
    };

    // ============ CONTENT SECURITY ============
    const preventClickjacking = () => {
        if (window.self !== window.top) {
            document.body.innerHTML = '';
            window.top.location = window.self.location;
        }
    };

    const disableDevToolsWarning = () => {
        console.log(
            '%c⚠️ ATTENTION',
            'color: #ef4444; font-size: 2rem; font-weight: bold;'
        );
        console.log(
            '%cCe navigateur est destiné aux développeurs. Si quelqu\'un vous a demandé de coller quelque chose ici, c\'est probablement une arnaque.',
            'color: #a3a3a3; font-size: 1rem;'
        );
    };

    // ============ RIGHT CLICK PROTECTION ============
    const protectImages = () => {
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                showToast('Les images sont protégées par le droit d\'auteur.', 'error');
            }
        });
    };

    // ============ DRAG PROTECTION ============
    const preventDrag = () => {
        document.querySelectorAll('img').forEach(img => {
            img.setAttribute('draggable', 'false');
            img.addEventListener('dragstart', e => e.preventDefault());
        });
    };

    // ============ INITIALIZE ============
    const init = () => {
        preventClickjacking();
        disableDevToolsWarning();
        protectImages();
        preventDrag();
        csrfToken.generate();
        timingCheck.start();
    };

    // ============ PUBLIC API ============
    return {
        init,
        sanitize,
        validators,
        rateLimiter,
        checkHoneypot,
        timingCheck,
        csrfToken,
        isSpam,
        generateNonce
    };
})();

// Auto-initialize
document.addEventListener('DOMContentLoaded', EdeeSecurity.init);