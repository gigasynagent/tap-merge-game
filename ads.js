// Ad management system for monetization with AdMob integration
// 
// CRITICAL SAFETY WARNING:
// NEVER click your own ads! This will result in permanent AdMob account banning.
// Always use test ads during development and testing.
// See ADMOB_SETUP.md and DEPLOYMENT.md for detailed safety guidelines.

class AdSystem {
    constructor() {
        console.log('Initializing AdSystem');
        
        // CRITICAL: Use test ad unit IDs during development to avoid policy violations
        // See: https://developers.google.com/admob/web/test-ads
        const useTestAds = true; // Set to false ONLY for production
        
        // AdMob ad unit IDs
        this.adUnits = useTestAds ? {
            // Test ad unit IDs - ONLY for development
            banner: 'ca-app-pub-3940256099942544/6300978111',
            interstitial: 'ca-app-pub-3940256099942544/1033173712',
            rewarded: 'ca-app-pub-3940256099942544/5224354917',
            native: 'ca-app-pub-3940256099942544/2247696110'
        } : {
            // REAL ad unit IDs - Replace with your actual ad unit IDs after signing up
            // CRITICAL: Only use real ad units in production after thorough testing with test ads
            banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
            interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
            rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
            native: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'
        };
        
        // AdMob publisher ID
        this.publisherId = useTestAds ? 
            'ca-app-pub-3940256099942544' : // Test publisher ID
            'ca-app-pub-XXXXXXXXXXXXXXXX';  // Your publisher ID
        
        this.adsEnabled = true; // Will be true when AdMob SDK is properly loaded
        this.rewardedVideoReady = false;
        this.interstitialReady = false;
        this.isAdMobLoaded = false;
        
        // GDPR compliance check
        this.consentObtained = false;
        this.personalizedAdsEnabled = false;
        
        // Ad frequency settings - CRITICAL for user experience and policy compliance
        this.settings = {
            interstitialCooldown: 120, // 2 minutes between interstitial ads (avoid annoying users)
            lastInterstitial: 0, // Timestamp of last interstitial
            sessionsBeforeInterstitial: 3, // Number of sessions before showing interstitial
            sessionCount: 0, // Current session count
            bannerRefreshRate: 60, // Seconds between banner refreshes (avoid excessive refreshes)
            maxAdsPerSession: 5, // Maximum number of ads per session (avoid ad fatigue)
            currentSessionAds: 0, // Count of ads shown in current session
            lastAdTime: 0 // Timestamp of last ad shown
        };
        
        // Revenue tracking
        this.revenue = {
            total: 0,
            byAdType: {
                banner: 0,
                interstitial: 0,
                rewarded: 0,
                native: 0
            },
            impressions: {
                banner: 0,
                interstitial: 0,
                rewarded: 0,
                native: 0
            },
            lastDay: new Date().toDateString()
        };
        
        // Additional security measures to prevent invalid click activity
        this.adClickProtection = {
            lastClickTime: 0,
            clickCount: 0,
            maxClicksPerMinute: 10, // Limit clicks per minute to detect spam
            clickDelayThreshold: 1000, // Minimum delay between clicks (1 second)
            suspiciousActivity: false,
            blockedClicks: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('AdMob Ad System initializing...');
        console.log('CRITICAL SAFETY WARNING: Never click your own ads!');
        console.log('Always use test ads during development. See ADMOB_SETUP.md for details.');
        
        // Check if AdMob is loaded
        this.isAdMobLoaded = typeof adsbygoogle !== 'undefined';
        
        // Check for GDPR consent
        if (window.cookieConsent) {
            this.consentObtained = window.cookieConsent.hasConsent();
            this.personalizedAdsEnabled = window.cookieConsent.isAdPersonalizationEnabled();
            
            // If no consent yet, disable personalized ads but still allow non-personalized ads
            if (!this.consentObtained) {
                this.personalizedAdsEnabled = false;
                this.adsEnabled = this.isAdMobLoaded; // Still enable ads, just non-personalized
                console.log('No consent yet, serving non-personalized ads');
                
                // Listen for consent
                document.addEventListener('consentUpdated', () => {
                    this.consentObtained = window.cookieConsent.hasConsent();
                    this.personalizedAdsEnabled = window.cookieConsent.isAdPersonalizationEnabled();
                    this.adsEnabled = this.isAdMobLoaded;
                    console.log('Consent updated, personalized ads enabled:', this.personalizedAdsEnabled);
                    
                    if (this.adsEnabled) {
                        // Re-initialize ads after consent update
                        this.initRewardedVideo();
                        this.initInterstitial();
                    }
                });
            } else {
                this.adsEnabled = this.isAdMobLoaded;
            }
        } else {
            // No consent manager found, default to enabled but non-personalized
            this.consentObtained = true;
            this.personalizedAdsEnabled = false;
            this.adsEnabled = this.isAdMobLoaded;
        }
        
        console.log('AdMob SDK loaded:', this.isAdMobLoaded);
        console.log('Consent obtained:', this.consentObtained);
        console.log('Personalized ads enabled:', this.personalizedAdsEnabled);
        console.log('Ads enabled:', this.adsEnabled);
        
        // Initialize ad types if enabled
        if (this.adsEnabled) {
            this.initRewardedVideo();
            this.initInterstitial();
        } else {
            // Fallback to simulation mode
            console.log('Using simulation mode for ads');
            setTimeout(() => {
                this.rewardedVideoReady = true;
                this.interstitialReady = true;
                console.log('Simulated ads ready');
            }, 2000);
        }
        
        // Load revenue data from localStorage
        this.loadRevenueData();
        
        // Check for day change to reset daily limits
        setInterval(() => {
            const today = new Date().toDateString();
            if (today !== this.revenue.lastDay) {
                this.revenue.lastDay = today;
                // Reset daily impression caps
                this.settings.currentSessionAds = 0;
                this.saveRevenueData();
            }
        }, 60000); // Check every minute
        
        // Track initialization in analytics
        if (window.gameAnalytics) {
            window.gameAnalytics.trackEvent('ad_system_initialized', {
                adMobLoaded: this.isAdMobLoaded,
                consentObtained: this.consentObtained,
                personalizedAds: this.personalizedAdsEnabled
            });
        }
    }
    
    // Method to update consent status when user changes settings
    updateConsentStatus(personalizedAdsEnabled) {
        this.personalizedAdsEnabled = personalizedAdsEnabled;
        console.log('Ad consent status updated:', personalizedAdsEnabled ? 'Personalized' : 'Non-personalized');
        
        // Update AdMob settings
        if (window.adsbygoogle) {
            (adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 
                personalizedAdsEnabled ? 0 : 1;
        }
        
        // Reinitialize ads
        if (this.isAdMobLoaded) {
            this.initRewardedVideo();
            this.initInterstitial();
        }
    }
    
    initRewardedVideo() {
        if (!this.isAdMobLoaded) {
            // Fallback to simulation
            setTimeout(() => {
                this.rewardedVideoReady = true;
                console.log('Simulated rewarded video ready');
            }, 2000);
            return;
        }
        
        // In a real implementation with AdMob, you would use their SDK to load a rewarded ad
        console.log('Loading AdMob rewarded video...');
        console.log('CRITICAL: Ensure this is a test ad during development!');
        
        try {
            // Simulate AdMob rewarded video loading
            // In real implementation, you would use AdMob's methods to load the ad
            setTimeout(() => {
                this.rewardedVideoReady = true;
                console.log('AdMob rewarded video ready');
            }, 2000);
        } catch (e) {
            console.error('Error loading AdMob rewarded video:', e);
            // Fallback to simulation
            setTimeout(() => {
                this.rewardedVideoReady = true;
                console.log('Fallback: Simulated rewarded video ready');
            }, 2000);
        }
    }
    
    initInterstitial() {
        if (!this.isAdMobLoaded) {
            // Fallback to simulation
            setTimeout(() => {
                this.interstitialReady = true;
                console.log('Simulated interstitial ready');
            }, 1500);
            return;
        }
        
        // In a real implementation with AdMob, you would use their SDK to load an interstitial ad
        console.log('Loading AdMob interstitial...');
        console.log('CRITICAL: Ensure this is a test ad during development!');
        
        try {
            // Simulate AdMob interstitial loading
            // In real implementation, you would use AdMob's methods to load the ad
            setTimeout(() => {
                this.interstitialReady = true;
                console.log('AdMob interstitial ready');
            }, 1500);
        } catch (e) {
            console.error('Error loading AdMob interstitial:', e);
            // Fallback to simulation
            setTimeout(() => {
                this.interstitialReady = true;
                console.log('Fallback: Simulated interstitial ready');
            }, 1500);
        }
    }
    
    canShowInterstitial() {
        const now = Date.now() / 1000;
        const timeSinceLast = now - this.settings.lastInterstitial;
        const sessionsSinceLast = this.settings.sessionCount - this.settings.sessionsBeforeInterstitial;
        
        return timeSinceLast >= this.settings.interstitialCooldown && sessionsSinceLast >= 0;
    }
    
    showInterstitialAd(force = false) {
        if (!this.adsEnabled) return false;
        if (!force && !this.canShowInterstitial()) return false;
        
        try {
            console.log('Showing interstitial ad');
            console.log('CRITICAL SAFETY WARNING: Never click your own ads!');
            
            if (this.isAdMobLoaded) {
                // In a real implementation, this would show the AdMob interstitial
                console.log('Showing AdMob interstitial');
                
                // Simulate AdMob interstitial display
                this.simulateInterstitial();
                
                // Reset interstitial state
                this.settings.lastInterstitial = Date.now() / 1000;
                this.settings.sessionCount = 0;
                this.interstitialReady = false;
                
                // Track impression
                this.trackAdImpression('interstitial', 0.10);
                
                // Preload next interstitial
                setTimeout(() => this.initInterstitial(), 1000);
                
                return true;
            } else {
                // Fall back to simulation
                return this.simulateInterstitial();
            }
        } catch (e) {
            console.error('Error showing interstitial ad:', e);
            return false;
        }
    }
    
    simulateInterstitial() {
        // For demo purposes, create a simulated interstitial ad
        const adOverlay = document.createElement('div');
        adOverlay.className = 'ad-overlay';
        adOverlay.style.position = 'fixed';
        adOverlay.style.top = '0';
        adOverlay.style.left = '0';
        adOverlay.style.width = '100%';
        adOverlay.style.height = '100%';
        adOverlay.style.background = 'rgba(0, 0, 0, 0.8)';
        adOverlay.style.display = 'flex';
        adOverlay.style.justifyContent = 'center';
        adOverlay.style.alignItems = 'center';
        adOverlay.style.zIndex = '1000';
        
        const adContent = document.createElement('div');
        adContent.style.background = 'white';
        adContent.style.padding = '20px';
        adContent.style.borderRadius = '10px';
        adContent.style.maxWidth = '80%';
        adContent.style.textAlign = 'center';
        
        // IMPORTANT SAFETY FEATURE: Clear separation between ad content and close button
        // This helps prevent accidental clicks which could result in AdMob account ban
        adContent.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; color: #333;">Advertisement</div>
            <div style="margin: 20px 0; color: #333;">This is a simulated interstitial ad</div>
            <div style="color: red; font-weight: bold; margin: 10px 0; padding: 10px; background: #ffebee; border-radius: 5px;">
                DEVELOPER REMINDER: Never click on real ads during testing
            </div>
            <div style="height: 30px; width: 100%;"></div> <!-- Increased spacer to prevent accidental clicks -->
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
                <button id="closeAdBtn" style="padding: 12px 20px; background: #4285f4; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; pointer-events: auto;">Close Ad</button>
                <div style="margin-top: 10px; font-size: 12px; color: #666;">Click only when ad is fully visible</div>
            </div>
        `;
        
        adOverlay.appendChild(adContent);
        document.body.appendChild(adOverlay);
        
        document.getElementById('closeAdBtn').addEventListener('click', () => {
            document.body.removeChild(adOverlay);
        });
        
        // Auto-close after 7 seconds (higher view time = more revenue)
        setTimeout(() => {
            if (document.body.contains(adOverlay)) {
                document.body.removeChild(adOverlay);
            }
        }, 7000);
        
        // Add additional protection: disable close button for first 3 seconds
        const closeBtn = document.getElementById('closeAdBtn');
        closeBtn.disabled = true;
        closeBtn.style.opacity = '0.5';
        closeBtn.textContent = 'Close Ad (3)';
        
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            countdown--;
            closeBtn.textContent = `Close Ad (${countdown})`;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                closeBtn.disabled = false;
                closeBtn.style.opacity = '1';
                closeBtn.textContent = 'Close Ad';
            }
        }, 1000);
        
        // Reset interstitial state
        this.settings.lastInterstitial = Date.now() / 1000;
        this.settings.sessionCount = 0;
        this.interstitialReady = false;
        
        // Track impression
        this.trackAdImpression('interstitial', 0.10);
        
        // Preload next interstitial
        setTimeout(() => this.initInterstitial(), 1000);
        
        return true;
    }
    
    // Simulated rewarded video for testing
    showRewardedVideo(callback) {
        console.log('Showing rewarded video (simulation)');
        
        // Simulate ad view after 2 seconds
        setTimeout(() => {
            if (callback) {
                callback(true, 30); // completed=true, reward=30 coins
            }
        }, 2000);
        
        return true;
    }
    
    // Enhanced method to track ad impressions with additional security checks
    trackAdImpression(type, value) {
        const now = Date.now();
        
        // Check for suspicious click patterns
        if (this.detectSuspiciousActivity(now)) {
            console.warn('Suspicious ad activity detected! Impression not tracked.');
            this.adClickProtection.suspiciousActivity = true;
            this.adClickProtection.blockedClicks++;
            
            // Track suspicious activity in analytics
            if (window.gameAnalytics) {
                window.gameAnalytics.trackEvent('suspicious_ad_activity', {
                    type: type,
                    timestamp: new Date().toISOString(),
                    blockedClicks: this.adClickProtection.blockedClicks
                });
            }
            
            return false;
        }
        
        // Reset suspicious activity flag if normal activity resumes
        if (now - this.adClickProtection.lastClickTime > 60000) { // 1 minute
            this.adClickProtection.suspiciousActivity = false;
            this.adClickProtection.clickCount = 0;
        }
        
        // Update click tracking
        this.adClickProtection.lastClickTime = now;
        this.adClickProtection.clickCount++;
        
        this.revenue.total += value;
        this.revenue.byAdType[type] += value;
        this.revenue.impressions[type]++;
        this.settings.currentSessionAds++;
        this.settings.lastAdTime = Date.now() / 1000;
        
        console.log(`Ad impression tracked - Type: ${type}, Value: $${value.toFixed(2)}`);
        console.log('CRITICAL: Ensure this is a legitimate impression, not self-clicking!');
        
        // Additional warning for developers
        if (type === 'rewarded' && value > 0.20) {
            console.warn('High value rewarded ad impression detected. Please verify this is legitimate.');
        }
        
        // Save revenue data to localStorage
        this.saveRevenueData();
        
        // Track impression in analytics
        if (window.gameAnalytics) {
            window.gameAnalytics.trackEvent('ad_impression', {
                type: type,
                value: value,
                total: this.revenue.total,
                impressions: this.revenue.impressions[type]
            });
        }
    }
    
    // Method to detect suspicious click activity
    detectSuspiciousActivity(currentTime) {
        // Check if too many clicks in a short period
        if (this.adClickProtection.clickCount > this.adClickProtection.maxClicksPerMinute) {
            return true;
        }
        
        // Check if clicks are too rapid
        if (currentTime - this.adClickProtection.lastClickTime < this.adClickProtection.clickDelayThreshold) {
            return true;
        }
        
        // Return existing suspicious activity flag
        return this.adClickProtection.suspiciousActivity;
    }
    
    loadRevenueData() {
        const savedData = localStorage.getItem('adRevenueData');
        if (savedData) {
            this.revenue = JSON.parse(savedData);
            console.log('Revenue data loaded:', this.revenue);
        } else {
            console.log('No revenue data found, starting fresh');
        }
    }
    
    saveRevenueData() {
        localStorage.setItem('adRevenueData', JSON.stringify(this.revenue));
        console.log('Revenue data saved:', this.revenue);
    }
    
    // Return revenue stats for the admin dashboard
    getRevenueStats() {
        return this.revenue;
    }
}

// Initialize the ad system
// CRITICAL: This system is designed for web deployment with GitHub Pages
// See DEPLOYMENT.md for platform choice considerations
console.log('Creating AdSystem instance');
const adSystem = new AdSystem();

// Make it globally accessible
window.adSystem = adSystem;
console.log('AdSystem initialized and available globally');
