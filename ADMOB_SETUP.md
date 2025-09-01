# AdMob Setup Guide for Tap & Merge Game

This guide explains how to set up AdMob for your web-based tap-merge game.

## Platform Choice

This game is designed for web deployment using GitHub Pages. For web-based games:

- You have more freedom in monetization methods
- You avoid app store billing requirements (since you're ads-only)
- You'll need a plan for driving traffic to your website
- You must still follow AdMob's web policies

## Prerequisites

1. Google account
2. Website where the game will be hosted
3. Completed GDPR compliance setup (see [GDPR_COMPLIANCE.md](GDPR_COMPLIANCE.md))

## Registration Steps

1. Go to [AdMob](https://admob.google.com/) and sign in with your Google account
2. Click "Get started" and follow the registration process
3. Provide required information:
   - Your website URL
   - Content category (Games)
   - Language
   - Contact information (as an individual)
4. No company registration required - you can register as an individual

## Creating Ad Units

After registration, create ad units for your game:

1. In your AdMob dashboard, click "Apps" then "Add app"
2. Select "Add new app" and enter your website URL
3. Choose "HTML/AMP" as the platform
4. Create ad units:
   - Banner: For top/bottom of screen
   - Interstitial: For natural break points in gameplay
   - Rewarded: For optional coin rewards

## Implementation

The game already includes AdMob integration with test ad units. To use real ads:

1. Replace the test Publisher ID in [index.html](index.html):
   ```html
   <!-- Replace ca-pub-XXXXXXXXXXXXXXXX with your actual Publisher ID -->
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```

2. Replace the test ad unit IDs in [ads.js](ads.js):
   ```javascript
   // Replace with your actual ad unit IDs after signing up
   banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
   interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
   rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
   native: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'
   ```

## CRITICAL AD SAFETY & POLICY COMPLIANCE

### Worst-Case Scenario Prevention

**NEVER click your own ads!** This is the most important rule to prevent account banning.

Violating this rule results in:
- Permanent AdMob account ban
- Loss of all unpaid earnings
- No recovery possible

### Prevention Measures

1. **Always use test ads during development:**
   - Test ad units are already implemented in the code
   - Never use real ad units during development/testing

2. **Design for accidental click prevention:**
   - Ads are placed away from game controls
   - Clear visual distinction between ads and game elements
   - Interstitial ads only shown at natural break points

3. **No incentivized clicks:**
   - Rewarded ads are opt-in only
   - No rewards for clicking regular ads
   - Clear distinction between ad types

4. **Follow AdMob policies:**
   - Review [AdMob policies](https://support.google.com/admob/answer/6128543) regularly
   - Ensure ad placement complies with guidelines
   - Monitor account for policy violations

## GDPR & Privacy Compliance

Since you're showing ads, you are collecting data and must comply with privacy laws:

1. Implement a cookie consent banner (already included in [cookie-consent.js](cookie-consent.js))
2. Get user consent before showing personalized ads
3. Provide a privacy policy (see [privacy-policy.html](privacy-policy.html))
4. Allow users to opt out of personalized ads

Failure to comply will result in AdMob account banning.

## Payment Thresholds

AdMob has a payment threshold of $100. This means:
- You earn money as users view/click ads
- Payments are made when your earnings reach $100
- No upfront payment required from you
- You can register as an individual without a company

## Testing Your Implementation

1. Use the test ad units during development
2. Verify ad placement doesn't interfere with gameplay
3. Test consent banner functionality
4. Check privacy policy link works
5. Validate analytics tracking

## Monitoring Performance

After deployment:

1. Monitor your AdMob dashboard regularly
2. Track RPM (Revenue per mille/1000 impressions)
3. Identify best performing ad placements
4. Optimize based on performance data
5. Watch for policy violations

## Best Practices

1. Focus on core gameplay first - make the tap-merge loop fun and addictive
2. Integrate AdMob early in the process
3. Weave ad opportunities into core progression naturally
4. Make ads feel like helpful bonuses, not annoying interruptions
5. Implement GDPR compliance before launch
6. Launch to a small audience first for testing
7. Optimize based on real performance data

## Troubleshooting

### Common Issues

1. **Ads not showing:**
   - Verify Publisher ID and ad unit IDs are correct
   - Check browser console for errors
   - Ensure your AdMob account is approved

2. **Policy violations:**
   - Review AdMob policy documentation
   - Check ad placement and design
   - Verify GDPR compliance implementation

3. **Low revenue:**
   - Test different ad placements
   - Monitor RPM metrics in AdMob dashboard
   - Optimize based on user engagement data

### Getting Help

If you encounter issues:
1. Check the AdMob Help Center
2. Review policy documentation
3. Verify your implementation matches guidelines
4. Contact AdMob support if needed