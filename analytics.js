// Simple analytics tracking for game events using free tools
class GameAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.plausibleEnabled = typeof plausible !== 'undefined';
        this.gaEnabled = typeof gtag !== 'undefined';
        this.init();
    }

    init() {
        // Track page load
        this.trackEvent('page_load', {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });

        // Track before unload to capture session duration
        window.addEventListener('beforeunload', () => {
            this.trackEvent('session_end', {
                duration: Date.now() - this.sessionStart
            });
            this.sendEvents();
        });

        this.sessionStart = Date.now();
        
        // Initialize with free analytics if available
        this.initFreeAnalytics();
    }

    initFreeAnalytics() {
        // Try to initialize Plausible Analytics (free, privacy-focused)
        // To use: add <script defer data-domain="yourdomain.com" src="https://plausible.io/js/plausible.js"></script> to your HTML
        
        // Try to initialize Google Analytics (free tier available)
        // To use: add Google Analytics script to your HTML
        
        console.log('Free analytics initialized. Plausible:', this.plausibleEnabled, 'GA:', this.gaEnabled);
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    trackEvent(eventName, eventData = {}) {
        const event = {
            sessionId: this.sessionId,
            eventName: eventName,
            eventData: eventData,
            timestamp: new Date().toISOString()
        };

        this.events.push(event);
        console.log('Tracked event:', event);

        // Send to free analytics services
        this.sendToFreeAnalytics(eventName, eventData);

        // Send events in batches of 10
        if (this.events.length >= 10) {
            this.sendEvents();
        }
    }

    sendToFreeAnalytics(eventName, eventData) {
        // Send to Plausible Analytics if available
        if (this.plausibleEnabled) {
            try {
                plausible(eventName, { props: eventData });
            } catch (e) {
                console.log('Plausible error:', e);
            }
        }

        // Send to Google Analytics if available
        if (this.gaEnabled) {
            try {
                gtag('event', eventName, eventData);
            } catch (e) {
                console.log('GA error:', e);
            }
        }
    }

    sendEvents() {
        if (this.events.length === 0) return;

        // For completely free solution without backend, we can:
        // 1. Store in localStorage for session analysis
        // 2. Send to free analytics services
        // 3. Display in console for development

        console.log('Analytics events batch:', this.events);

        // Store in localStorage for later analysis
        try {
            const existingData = JSON.parse(localStorage.getItem('game_analytics') || '[]');
            const newData = existingData.concat(this.events);
            localStorage.setItem('game_analytics', JSON.stringify(newData.slice(-1000))); // Keep last 1000 events
        } catch (e) {
            console.log('Error saving analytics to localStorage:', e);
        }

        // Clear events after processing
        this.events = [];
    }

    // Game-specific tracking methods
    trackGameStart() {
        this.trackEvent('game_start');
    }

    trackGameReset() {
        this.trackEvent('game_reset');
    }

    trackElementTap(elementType, level) {
        this.trackEvent('element_tap', {
            elementType: elementType,
            level: level
        });
    }

    trackMerge(elementsMerged, newLevel) {
        this.trackEvent('merge', {
            elementsMerged: elementsMerged,
            newLevel: newLevel
        });
    }

    trackPurchase(coinsSpent, itemPurchased) {
        this.trackEvent('purchase', {
            coinsSpent: coinsSpent,
            itemPurchased: itemPurchased,
            coinBalance: window.game ? window.game.coins : 0
        });
    }

    trackAdWatched() {
        this.trackEvent('ad_watched', {
            coinReward: 20
        });
    }

    trackCoinBalance(coins) {
        this.trackEvent('coin_balance', {
            coins: coins
        });
    }

    trackScore(score) {
        this.trackEvent('score_update', {
            score: score
        });
    }
    
    // Method to export analytics data
    exportAnalytics() {
        try {
            const data = localStorage.getItem('game_analytics');
            if (data) {
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'game_analytics.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (e) {
            console.log('Error exporting analytics:', e);
        }
    }
}

// Initialize analytics
const analytics = new GameAnalytics();

// Make analytics globally accessible for other scripts
window.gameAnalytics = analytics;