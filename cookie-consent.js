/**
 * GDPR-Compliant Cookie Consent Management
 * 
 * This script implements a GDPR-compliant cookie consent banner
 * that informs users about data collection and gets their consent
 * before loading personalized ads.
 */

class CookieConsentManager {
    constructor() {
        this.consentGiven = false;
        this.adPersonalizationEnabled = false;
        this.analyticsEnabled = false;
        this.cookieBannerShown = false;
        this.consentKey = 'tap_merge_consent';
        this.consentVersion = '1.0';
        this.privacyDialogOpen = false;
        this.bannerElement = null;
        
        // Enhanced consent tracking
        this.consentLog = [];
        
        // Try to load saved consent
        this.loadSavedConsent();
        
        // If no saved consent, show the banner
        if (!this.cookieBannerShown && !this.consentGiven) {
            this.showConsentBanner();
        } else if (this.consentGiven) {
            // Initialize ad settings based on saved preferences
            this.applyConsent();
        }
    }
    
    /**
     * Show the cookie consent banner
     */
    showConsentBanner() {
        if (this.cookieBannerShown) return;
        
        // First, check if a banner already exists and remove it
        const existingBanner = document.getElementById('cookie-consent-banner');
        if (existingBanner && document.body.contains(existingBanner)) {
            document.body.removeChild(existingBanner);
        }
        
        // Create consent banner element
        const banner = document.createElement('div');
        this.bannerElement = banner; // Store reference to banner
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';
        banner.style.position = 'fixed';
        banner.style.bottom = '0';
        banner.style.left = '0';
        banner.style.right = '0';
        banner.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        banner.style.color = 'white';
        banner.style.padding = '15px';
        banner.style.zIndex = '9999';
        banner.style.display = 'flex';
        banner.style.flexDirection = 'column';
        banner.style.alignItems = 'center';
        banner.style.justifyContent = 'center';
        banner.style.textAlign = 'center';
        banner.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.2)';
        
        // Banner content with improved messaging
        banner.innerHTML = `
            <div style="max-width: 800px;">
                <h3 style="margin-top: 0;">We Value Your Privacy</h3>
                <p>This free game is supported by advertising. You can play regardless of your choices below.</p>
                <p>Personalized ads help us provide better content and maintain this game for free. Non-personalized ads will still be shown if you decline.</p>
                <div style="margin: 15px 0;">
                    <label style="margin-right: 20px;">
                        <input type="checkbox" id="consent-personalized-ads" checked> Allow personalized ads
                    </label>
                    <label>
                        <input type="checkbox" id="consent-analytics" checked> Allow analytics
                    </label>
                </div>
                <div style="margin-top: 10px;">
                    <a href="privacy-policy.html" target="_blank" style="color: #99ccff; margin-right: 15px;">Privacy Policy</a>
                    <button id="reject-all-cookies" style="background: #666; color: white; border: none; padding: 8px 15px; margin-right: 10px; border-radius: 4px; cursor: pointer;">Reject All</button>
                    <button id="accept-selected-cookies" style="background: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Accept Selected</button>
                </div>
            </div>
        `;
        
        // Add banner to document
        document.body.appendChild(banner);
        this.cookieBannerShown = true;
        
        // Add event listeners
        const acceptButton = document.getElementById('accept-selected-cookies');
        const rejectButton = document.getElementById('reject-all-cookies');
        
        // Clear any previous event listeners
        const newAcceptButton = acceptButton.cloneNode(true);
        const newRejectButton = rejectButton.cloneNode(true);
        
        acceptButton.parentNode.replaceChild(newAcceptButton, acceptButton);
        rejectButton.parentNode.replaceChild(newRejectButton, rejectButton);
        
        newAcceptButton.addEventListener('click', () => {
            this.adPersonalizationEnabled = document.getElementById('consent-personalized-ads').checked;
            this.analyticsEnabled = document.getElementById('consent-analytics').checked;
            this.saveConsent();
            this.applyConsent();
            this.hideBanner();
        });
        
        newRejectButton.addEventListener('click', () => {
            this.adPersonalizationEnabled = false;
            this.analyticsEnabled = false;
            this.saveConsent();
            this.applyConsent();
            this.hideBanner();
        });
    }
    
    /**
     * Hide the consent banner
     */
    hideBanner() {
        try {
            // Try to get the banner in three different ways to ensure we find it
            const banner = this.bannerElement || 
                          document.getElementById('cookie-consent-banner') || 
                          document.querySelector('.cookie-consent-banner');
            
            if (banner && document.body.contains(banner)) {
                document.body.removeChild(banner);
                console.log('Banner successfully removed');
            } else {
                console.log('Banner not found or already removed');
            }
            
            this.bannerElement = null;
            this.cookieBannerShown = false;
        } catch (e) {
            console.error('Error removing consent banner:', e);
        }
    }
    
    /**
     * Save user consent preferences with enhanced security
     */
    saveConsent() {
        this.consentGiven = true;
        
        // Log consent action
        this.consentLog.push({
            action: 'consent_saved',
            timestamp: new Date().toISOString(),
            adPersonalization: this.adPersonalizationEnabled,
            analytics: this.analyticsEnabled
        });
        
        try {
            const consentData = {
                version: this.consentVersion,
                timestamp: new Date().toISOString(),
                adPersonalization: this.adPersonalizationEnabled,
                analytics: this.analyticsEnabled,
                log: this.consentLog // Include consent log for security monitoring
            };
            
            // Add secure encoding if security module is available
            if (window.gameSecurity && window.gameSecurity.secureBase64Encode) {
                const secureConsentData = window.gameSecurity.secureBase64Encode(consentData);
                localStorage.setItem(this.consentKey, secureConsentData);
            } else {
                localStorage.setItem(this.consentKey, JSON.stringify(consentData));
            }
            
            console.log('Consent preferences saved:', consentData);
            
            // Track consent in analytics if enabled
            if (this.analyticsEnabled && window.gameAnalytics) {
                window.gameAnalytics.trackEvent('consent_given', {
                    adPersonalization: this.adPersonalizationEnabled,
                    analytics: this.analyticsEnabled,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error('Error saving consent preferences:', e);
        }
    }
    
    /**
     * Load saved consent preferences
     */
    loadSavedConsent() {
        try {
            const savedConsent = localStorage.getItem(this.consentKey);
            if (!savedConsent) return false;
            
            let consentData;
            
            // Try to decode with security module if available
            if (window.gameSecurity && window.gameSecurity.secureBase64Decode) {
                consentData = window.gameSecurity.secureBase64Decode(savedConsent);
            } else {
                consentData = JSON.parse(savedConsent);
            }
            
            // Verify consent version - if outdated, show banner again
            if (consentData.version !== this.consentVersion) {
                console.log('Consent version outdated, requesting new consent');
                return false;
            }
            
            this.consentGiven = true;
            this.adPersonalizationEnabled = consentData.adPersonalization;
            this.analyticsEnabled = consentData.analytics;
            
            console.log('Loaded saved consent preferences:', consentData);
            return true;
        } catch (e) {
            console.error('Error loading consent preferences:', e);
            return false;
        }
    }
    
    /**
     * Apply consent settings to AdMob and analytics with additional safeguards
     */
    applyConsent() {
        console.log('Applying consent settings:', {
            adPersonalization: this.adPersonalizationEnabled,
            analytics: this.analyticsEnabled
        });
        
        // Apply settings to AdMob
        if (window.adsbygoogle) {
            // Set non-personalized ads if user opted out
            if (!this.adPersonalizationEnabled) {
                console.log('Setting non-personalized ads');
                (adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1;
                
                // Additional safeguard: log non-personalized ad setting
                console.log('NON-PERSONALIZED ADS ACTIVATED - User has opted out of ad personalization');
            } else {
                console.log('Setting personalized ads');
                (adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 0;
                
                // Log personalized ad setting
                console.log('PERSONALIZED ADS ACTIVATED - User has consented to ad personalization');
            }
        }
        
        // Apply settings to analytics - but always allow game to function
        if (window.gameAnalytics) {
            if (this.analyticsEnabled) {
                window.gameAnalytics.setAnalyticsEnabled(true);
                console.log('Analytics enabled');
            } else {
                window.gameAnalytics.setAnalyticsEnabled(false);
                console.log('Analytics disabled');
            }
            
            // Even if analytics are disabled, still enable minimal tracking
            // for game functionality (no personal data)
            window.gameAnalytics.setMinimalTrackingEnabled(true);
        }
        
        // Notify AdSystem about consent change
        if (window.adSystem) {
            window.adSystem.updateConsentStatus(this.adPersonalizationEnabled);
        }
        
        // Dispatch an event to notify other components
        const event = new CustomEvent('consentUpdated', {
            detail: {
                adPersonalization: this.adPersonalizationEnabled,
                analytics: this.analyticsEnabled
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Check if user has given consent
     */
    hasConsent() {
        return this.consentGiven;
    }
    
    /**
     * Check if ad personalization is enabled
     */
    isAdPersonalizationEnabled() {
        return this.adPersonalizationEnabled;
    }
    
    /**
     * Check if analytics is enabled
     */
    isAnalyticsEnabled() {
        return this.analyticsEnabled;
    }
    
    /**
     * Update privacy settings (can be called from settings menu)
     */
    updatePrivacySettings(adPersonalization, analytics) {
        this.adPersonalizationEnabled = adPersonalization;
        this.analyticsEnabled = analytics;
        this.saveConsent();
        this.applyConsent();
        
        // Dispatch an event to notify other components
        const event = new CustomEvent('consentUpdated', {
            detail: {
                adPersonalization: this.adPersonalizationEnabled,
                analytics: this.analyticsEnabled
            }
        });
        document.dispatchEvent(event);
        
        return {
            success: true,
            message: 'Privacy settings updated successfully'
        };
    }
    
    /**
     * Shows the privacy settings dialog programmatically
     */
    showPrivacySettings() {
        if (this.privacyDialogOpen) {
            // If dialog is already open, first try to close it
            this.closePrivacyDialog();
            return;
        }
        
        // Store original values in case user cancels
        const originalAdPersonalization = this.adPersonalizationEnabled;
        const originalAnalytics = this.analyticsEnabled;
        
        const settings = document.createElement('div');
        settings.id = 'privacy-settings-dialog';
        settings.className = 'privacy-settings';
        
        settings.innerHTML = `
            <h3>Privacy Settings</h3>
            <p>Manage how your data is used in our game. Your choices won't affect your ability to play.</p>
            <div style="margin: 15px 0; background: #f9f9f9; padding: 10px; border-radius: 5px;">
                <label style="display: block; margin-bottom: 10px;">
                    <input type="checkbox" id="settings-personalized-ads" ${this.adPersonalizationEnabled ? 'checked' : ''}> 
                    <span style="font-weight: bold;">Allow personalized ads</span>
                </label>
                <p style="margin: 5px 0 15px 25px; font-size: 0.9em; color: #666;">
                    When enabled, you'll see more relevant ads based on your interests.
                    If disabled, you'll still see ads but they won't be personalized.
                </p>
                
                <label style="display: block;">
                    <input type="checkbox" id="settings-analytics" ${this.analyticsEnabled ? 'checked' : ''}> 
                    <span style="font-weight: bold;">Allow analytics</span>
                </label>
                <p style="margin: 5px 0 0 25px; font-size: 0.9em; color: #666;">
                    Helps us improve the game by understanding how it's used.
                    Basic game functions will still work if disabled.
                </p>
            </div>
            <div style="margin-top: 20px; text-align: right;">
                <a href="privacy-policy.html" target="_blank" style="color: #667eea; margin-right: 15px;">Privacy Policy</a>
                <button id="cancel-privacy-settings" style="background: #ccc; border: none; padding: 8px 15px; margin-right: 10px; border-radius: 4px; cursor: pointer;">Cancel</button>
                <button id="save-privacy-settings" style="background: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Save</button>
            </div>
        `;
        
        document.body.appendChild(settings);
        this.privacyDialogOpen = true;
        this.settingsDialog = settings; // Store reference
        
        // Add event listeners with direct DOM references
        const cancelButton = document.getElementById('cancel-privacy-settings');
        const saveButton = document.getElementById('save-privacy-settings');
        
        cancelButton.addEventListener('click', () => {
            // Restore original values when canceling (GDPR requirement)
            this.adPersonalizationEnabled = originalAdPersonalization;
            this.analyticsEnabled = originalAnalytics;
            
            // Close the dialog
            this.closePrivacyDialog();
        });
        
        saveButton.addEventListener('click', () => {
            const personalized = document.getElementById('settings-personalized-ads').checked;
            const analytics = document.getElementById('settings-analytics').checked;
            
            this.updatePrivacySettings(personalized, analytics);
            this.closePrivacyDialog();
            
            alert('Privacy settings updated successfully!');
        });
    }
    
    /**
     * Close the privacy dialog
     */
    closePrivacyDialog() {
        const dialog = document.getElementById('privacy-settings-dialog');
        if (dialog && document.body.contains(dialog)) {
            document.body.removeChild(dialog);
        }
        this.privacyDialogOpen = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cookie consent manager
    if (!window.cookieConsent) {
        window.cookieConsent = new CookieConsentManager();
    }
    
    // Fix any existing cookie banner that might be stuck
    setTimeout(() => {
        // Check for any orphaned consent banners
        const existingBanners = document.querySelectorAll('#cookie-consent-banner, .cookie-consent-banner');
        existingBanners.forEach(banner => {
            // Find buttons within this banner
            const acceptBtn = banner.querySelector('#accept-selected-cookies, [id*="accept"]');
            const rejectBtn = banner.querySelector('#reject-all-cookies, [id*="reject"]');
            
            // Add proper event listeners if they don't exist
            if (acceptBtn) {
                const newAcceptBtn = acceptBtn.cloneNode(true);
                acceptBtn.parentNode.replaceChild(newAcceptBtn, acceptBtn);
                newAcceptBtn.addEventListener('click', function() {
                    if (document.body.contains(banner)) {
                        document.body.removeChild(banner);
                        console.log('Banner removed via accept button');
                    }
                });
            }
            
            if (rejectBtn) {
                const newRejectBtn = rejectBtn.cloneNode(true);
                rejectBtn.parentNode.replaceChild(newRejectBtn, rejectBtn);
                newRejectBtn.addEventListener('click', function() {
                    if (document.body.contains(banner)) {
                        document.body.removeChild(banner);
                        console.log('Banner removed via reject button');
                    }
                });
            }
        });
        
        // Also check for orphaned privacy settings dialogs
        const existingDialogs = document.querySelectorAll('#privacy-settings-dialog, .privacy-settings');
        existingDialogs.forEach(dialog => {
            const saveBtn = dialog.querySelector('#save-privacy-settings, [id*="save"]');
            if (saveBtn) {
                const newSaveBtn = saveBtn.cloneNode(true);
                saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
                newSaveBtn.addEventListener('click', function() {
                    if (document.body.contains(dialog)) {
                        document.body.removeChild(dialog);
                        console.log('Dialog removed via save button');
                    }
                });
            }
        });
    }, 1000);
});
