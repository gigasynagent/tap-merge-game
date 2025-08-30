# GitHub Pages Deployment Guide

This guide explains how to deploy your Tap & Merge game to GitHub Pages for free.

## Prerequisites

1. A GitHub account
2. Git installed on your computer
3. The game files prepared for deployment

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
2. View transaction history and analytics
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

3. **Custom domain not working**:
   - Verify DNS settings with your domain registrar
   - Check that the CNAME file is correctly formatted

### Getting Help

If you encounter issues:
1. Check the GitHub Pages documentation
2. Review the deployment logs in the Actions tab
3. Verify your repository settings

## Best Practices

1. **Regular Updates**: Keep your game fresh with new features
2. **Monitor Analytics**: Use the admin dashboard to track performance
3. **Security Checks**: Regularly test security features
4. **Performance Optimization**: Minify files and optimize assets
5. **Backup**: Keep a local backup of your repository

## Next Steps

After deployment:
1. Share your game on social media
2. Submit to web game directories
3. Implement real payment processing
4. Add more analytics tools
5. Create a marketing strategy

Your game is now live and accessible to players worldwide!