# GitHub Pages Deployment Guide

This guide explains how to deploy your Tap & Merge game to GitHub Pages for free.

## Platform Choice

This game is designed for web deployment using GitHub Pages. For web-based games:

- You have more freedom in monetization methods
- You avoid app store billing requirements (since you're ads-only)
- You'll need a plan for driving traffic to your website
- You must still follow AdMob's web policies

## Prerequisites

1. A GitHub account
2. Git installed on your computer
3. The game files prepared for deployment
4. (Optional) AdMob account for monetization

## Deployment Steps

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., `tap-merge-game`)
4. Set visibility to "Public" (required for GitHub Pages)
5. Do NOT initialize with a README (we'll push our files)
6. Click "Create repository"

### Step 2: Push Files to GitHub

1. Open a terminal/command prompt in your game directory
2. Initialize git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Add the remote repository (replace `username` with your GitHub username):
   ```bash
   git remote add origin https://github.com/username/tap-merge-game.git
   ```
4. Push to GitHub:
   ```bash
   git branch -M main
   git push -u origin main
   ```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click "Save"
6. Wait a few minutes for GitHub to build and deploy your site

### Step 4: Access Your Game

Your game will be available at:
```
https://username.github.io/tap-merge-game/
```

Replace `username` with your GitHub username and `tap-merge-game` with your repository name.

### Step 5: Set Up AdMob (for monetization)

1. Register for AdMob at [admob.google.com](https://admob.google.com)
2. Follow the instructions in [ADMOB_SETUP.md](ADMOB_SETUP.md)
3. Update your code with your AdMob IDs:
   - Replace all instances of `ca-pub-XXXXXXXXXXXXXXXX` with your Publisher ID
   - Replace all ad unit IDs in `ads.js` and `index.html`
4. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Update AdMob integration"
   git push origin main
   ```
5. Your game will automatically redeploy with AdMob integration

## Custom Domain (Optional)

If you want to use a custom domain:

1. Purchase a domain from a registrar (e.g., Namecheap, GoDaddy)
2. Update the CNAME file in your repository with your domain:
   ```
   yourgame.example.com
   ```
3. Configure DNS settings with your domain registrar:
   - Add an A record pointing to `185.199.108.153`
   - Add an A record pointing to `185.199.109.153`
   - Add an A record pointing to `185.199.110.153`
   - Add an A record pointing to `185.199.111.153`
   - Or add a CNAME record pointing to `username.github.io`

## Automated Deployment with GitHub Actions

This repository includes a GitHub Actions workflow that automatically deploys your game when you push to the `main` branch.

The workflow:
1. Minifies JavaScript and CSS files
2. Optimizes the code for better performance
3. Deploys to GitHub Pages

To use it:
1. Make sure your repository is public
2. Push changes to the `main` branch
3. Go to the "Actions" tab to monitor deployment
4. Your site will automatically update

## CRITICAL AD-BASED MONETIZATION RISKS & PREVENTION

### Worst-Case Scenario

For ad-only games, the worst-case scenario is **getting banned from your ad network**, not chargebacks (which don't apply to ads).

**Cause:** Invalid click activity including:
- Clicking your own ads (even once to test)
- Incentivizing clicks ("click this ad for a reward")
- Player maliciously spamming clicks

**Result:** Permanent AdMob account disable and loss of ALL unpaid earnings.

### Prevention Measures

1. **NEVER click your own ads**
   - Use only test ads during development
   - Test ad units are implemented in the code
   - Real ad units should only be used in production

2. **Design to prevent accidental clicks**
   - Ads are clearly distinguishable from game content
   - No ads placed where they can be accidentally clicked
   - Interstitial ads only shown at natural break points

3. **No incentivized clicks**
   - Rewarded video ads are opt-in only
   - No rewards for clicking regular ads
   - Clear distinction between ad types

4. **Follow all policies exactly**
   - Review AdMob policies regularly
   - Ensure ad placement complies with guidelines
   - Monitor account for policy violations

## Action Plan for Success

1. **Build Core Gameplay First**
   - Focus on making the tap-merge loop fun and addictive
   - Gameplay > Monetization in early development

2. **Integrate AdMob Early**
   - Implement AdMob SDK with test ads
   - Plan rewarded video and interstitial placements

3. **Design for Ads**
   - Weave ad opportunities into core progression
   - Make ads feel like helpful bonuses, not interruptions

4. **Implement GDPR Compliance**
   - Already included in this project
   - Test thoroughly before launch

5. **Launch & Test**
   - Release to small audience first
   - Monitor AdMob dashboard for issues
   - Track RPM (Revenue per mille) by placement

6. **Optimize**
   - Double down on high-performing placements
   - Remove or tweak underperforming ads
   - Continuously improve based on data

## Ad-Based Monetization

After deployment, you can monetize your game with ads:

1. Register with AdMob (see [ADMOB_SETUP.md](ADMOB_SETUP.md))
2. Update your code with real ad unit IDs
3. Test that ads are displaying correctly
4. Monitor performance in the AdMob dashboard
5. Optimize ad placement for better revenue

Benefits of GitHub Pages for ad monetization:
- Free hosting for your game
- Custom domain support
- Automatic HTTPS for security
- Reliable uptime
- No additional server costs

## Performance Optimization

The deployment process includes:
- JavaScript minification
- CSS optimization
- File compression
- Caching strategies

## Security Features

Your deployed game includes:
- Base64 encoding for secure data transmission
- Transaction signing and verification
- Data integrity checks
- Secure session management

## Monitoring and Analytics

To monitor your deployed game:
1. Access the admin dashboard at `/admin.html`
2. View ad revenue stats and analytics
3. Monitor security status
4. Export data for analysis

## Updating Your Game

To update your deployed game:

1. Make changes to your local files
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update game features"
   git push origin main
   ```
3. If using GitHub Actions, the site will automatically update
4. If not using GitHub Actions, go to Settings > Pages and click "Run workflow"

## Troubleshooting

### Common Issues

1. **Site not updating**: 
   - Wait a few minutes for GitHub to process changes
   - Check the Actions tab for deployment status

2. **404 errors**:
   - Ensure your files are in the root directory
   - Check that you've selected the correct branch in Settings > Pages

3. **Ads not showing**:
   - Verify AdMob IDs are correctly implemented
   - Check the browser console for errors
   - Make sure your AdMob account is approved
   - Use test ad IDs during development

### Getting Help

If you encounter issues:
1. Check the GitHub Pages documentation
2. Review the deployment logs in the Actions tab
3. Verify your repository settings
4. Consult the AdMob documentation for ad-related issues

## Best Practices

1. **Regular Updates**: Keep your game fresh with new features
2. **Monitor Analytics**: Use the admin dashboard to track performance
3. **Security Checks**: Regularly test security features
4. **Performance Optimization**: Minify files and optimize assets
5. **Backup**: Keep a local backup of your repository
6. **Ad Optimization**: Test different ad placements for better revenue
7. **Policy Compliance**: Regularly review ad network policies
8. **Account Monitoring**: Watch for policy violations or invalid activity

## Next Steps

After deployment:
1. Share your game on social media
2. Submit to web game directories
3. Optimize ad placement for better revenue
4. Add more analytics tools
5. Create a marketing strategy

Your game is now live, accessible to players worldwide, and ready to generate ad revenue!