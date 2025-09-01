// Simple analytics tracking for game events using free tools
class GameAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.plausibleEnabled = typeof plausible !== 'undefined';
        this.gaEnabled = typeof gtag !== 'undefined';
        this.analyticsEnabled = true;
        this.minimalTrackingEnabled = true; // Enable minimal tracking by default
        
        // Ad-specific metrics
        this.adMetrics = {
            impressions: {
                banner: 0,
                interstitial: 0,
                rewarded: 0,
                native: 0,
                offerwall: 0
            },
            clicks: {
                banner: 0,
                interstitial: 0,
                rewarded: 0,
                native: 0,
                offerwall: 0
            },
            revenue: {
                banner: 0,
                interstitial: 0,
                rewarded: 0,
                native: 0,
                offerwall: 0,
                total: 0
            },
            ecpm: {
                banner: 0,
                interstitial: 0,
                rewarded: 0,
                native: 0,
                offerwall: 0
            },
            completionRate: {
                rewarded: 0,
                offerwall: 0
            }
        };
        
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
        
        // Load ad metrics from localStorage
        this.loadAdMetrics();
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

    // Enable or disable full analytics
    setAnalyticsEnabled(enabled) {
        this.analyticsEnabled = enabled;
        console.log('Full analytics ' + (enabled ? 'enabled' : 'disabled'));
    }
    
    // Enable or disable minimal tracking (for game functionality only)
    setMinimalTrackingEnabled(enabled) {
        this.minimalTrackingEnabled = enabled;
        console.log('Minimal tracking ' + (enabled ? 'enabled' : 'disabled'));
    }

    trackEvent(eventName, eventData = {}) {
        // Skip if all analytics are disabled
        if (!this.analyticsEnabled && !this.minimalTrackingEnabled) {
            return;
        }
        
        // If only minimal tracking is enabled, filter out personal data
        if (!this.analyticsEnabled && this.minimalTrackingEnabled) {
            // Filter out personal data, only keep functional data
            const allowedEvents = ['page_load', 'session_end', 'game_start', 'game_reset'];
            if (!allowedEvents.includes(eventName)) {
                return; // Skip non-essential events when full analytics are disabled
            }
            
            // Strip personal data from event data
            const safeEventData = {};
            const allowedFields = ['duration', 'timestamp'];
            for (const field of allowedFields) {
                if (eventData[field] !== undefined) {
                    safeEventData[field] = eventData[field];
                }
            }
            eventData = safeEventData;
        }

        const event = {
            sessionId: this.sessionId,
            eventName: eventName,
            eventData: eventData,
            timestamp: new Date().toISOString()
        };

        this.events.push(event);
        console.log('Tracked event:', event);

        // Send to free analytics services if full analytics enabled
        if (this.analyticsEnabled) {
            this.sendToFreeAnalytics(eventName, eventData);
        }

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

    trackAdWatched(adType = 'rewarded', coinReward = 20) {
        this.trackEvent('ad_watched', {
            adType: adType,
            coinReward: coinReward
        });
    }
    
    // Track ad impressions and revenue
    trackAdImpression(adType, estimatedRevenue) {
        // Update impression count
        this.adMetrics.impressions[adType] = (this.adMetrics.impressions[adType] || 0) + 1;
        
        // Update revenue
        const revenue = estimatedRevenue || 0;
        this.adMetrics.revenue[adType] = (this.adMetrics.revenue[adType] || 0) + revenue;
        this.adMetrics.revenue.total += revenue;
        
        // Calculate eCPM (effective cost per mille)
        const impressions = this.adMetrics.impressions[adType];
        this.adMetrics.ecpm[adType] = impressions > 0 ? (this.adMetrics.revenue[adType] / impressions) * 1000 : 0;
        
        // Track the event
        this.trackEvent('ad_impression', {
            adType: adType,
            revenue: revenue,
            totalImpressions: impressions,
            ecpm: this.adMetrics.ecpm[adType]
        });
        
        // Save metrics
        this.saveAdMetrics();
    }
    
    // Track ad clicks
    trackAdClick(adType) {
        this.adMetrics.clicks[adType] = (this.adMetrics.clicks[adType] || 0) + 1;
        
        this.trackEvent('ad_click', {
            adType: adType,
            clicks: this.adMetrics.clicks[adType]
        });
        
        this.saveAdMetrics();
    }
    
    // Track ad completion (for rewarded videos)
    trackAdCompletion(adType, completed) {
        // Only track completion rates for applicable ad types
        if (adType !== 'rewarded' && adType !== 'offerwall') return;
        
        const completions = (this.adMetrics.completions?.[adType] || 0) + (completed ? 1 : 0);
        const attempts = (this.adMetrics.attempts?.[adType] || 0) + 1;
        
        if (!this.adMetrics.completions) this.adMetrics.completions = {};
        if (!this.adMetrics.attempts) this.adMetrics.attempts = {};
        
        this.adMetrics.completions[adType] = completions;
        this.adMetrics.attempts[adType] = attempts;
        
        // Calculate completion rate
        this.adMetrics.completionRate[adType] = attempts > 0 ? (completions / attempts) * 100 : 0;
        
        this.trackEvent('ad_completion', {
            adType: adType,
            completed: completed,
            completionRate: this.adMetrics.completionRate[adType]
        });
        
        this.saveAdMetrics();
    }
    
    // Load ad metrics from localStorage
    loadAdMetrics() {
        try {
            const metrics = localStorage.getItem('game_ad_metrics');
            if (metrics) {
                this.adMetrics = JSON.parse(metrics);
            }
        } catch (e) {
            console.error('Error loading ad metrics:', e);
        }
    }
    
    // Save ad metrics to localStorage
    saveAdMetrics() {
        try {
            localStorage.setItem('game_ad_metrics', JSON.stringify(this.adMetrics));
        } catch (e) {
            console.error('Error saving ad metrics:', e);
        }
    }
    
    // Get ad revenue report
    getAdRevenueReport() {
        return {
            totalRevenue: this.adMetrics.revenue.total.toFixed(2),
            revenueByType: Object.fromEntries(
                Object.entries(this.adMetrics.revenue)
                    .filter(([key]) => key !== 'total')
                    .map(([key, value]) => [key, value.toFixed(2)])
            ),
            impressions: this.adMetrics.impressions,
            clicks: this.adMetrics.clicks,
            ecpm: Object.fromEntries(
                Object.entries(this.adMetrics.ecpm).map(([key, value]) => [key, value.toFixed(2)])
            ),
            completionRate: Object.fromEntries(
                Object.entries(this.adMetrics.completionRate).map(([key, value]) => [key, value.toFixed(2) + '%'])
            ),
            lastUpdated: new Date().toISOString()
        };
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
            // Combine game analytics and ad metrics
            const gameData = JSON.parse(localStorage.getItem('game_analytics') || '[]');
            const exportData = {
                gameEvents: gameData,
                adMetrics: this.adMetrics,
                revenueReport: this.getAdRevenueReport(),
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'game_analytics_export.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert(`Analytics exported successfully!\n\nTotal ad revenue: $${exportData.revenueReport.totalRevenue}`);
        } catch (e) {
            console.log('Error exporting analytics:', e);
            alert('Error exporting analytics: ' + e.message);
        }
    }
}

// Initialize analytics
const analytics = new GameAnalytics();

// Make analytics globally accessible for other scripts
window.gameAnalytics = analytics;