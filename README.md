# Invoicely | Premium Invoice Maker 🚀

Invoicely is a professional, lightweight, and secure Progressive Web App (PWA) designed to help small businesses and freelancers create beautiful invoices in seconds. No signup, no tracking, and 100% private.

![Invoicely Preview](https://cdn-icons-png.flaticon.com/512/2910/2910791.png)

## ✨ Features

- **Professional Branding**: Upload your logo and custom signature.
- **Custom Themes**: Change the accent color to match your brand.
- **Tax Systems**: Supports both simple tax and GST (CGST/SGST/IGST).
- **Payment Integration**: Generate UPI QR codes automatically based on your total amount.
- **PWA Ready**: Install it on your phone or desktop for offline use.
- **Local Storage**: Your drafts are automatically saved to your browser's local storage.
- **Flexible Export**: Download as PDF, Print directly, or export data to CSV.
- **Dark Mode**: Beautiful, easy-on-the-eyes interface for late-night billing.
- **History Management**: Revisit and re-edit your last 10 saved invoices.

## 🛠️ Technology Stack

- **HTML5 & Semantic Tags**: For structure and SEO.
- **Vanilla CSS3**: With modern features like CSS Variables and Glassmorphism.
- **Vanilla JavaScript (ES6+)**: For logic and state management.
- **Lucide Icons**: For clean, consistent iconography.
- **html2pdf.js**: For high-quality PDF generation.
- **Service Workers**: For offline capabilities and PWA support.

## 🚀 How to Host

This is a static web application, meaning it doesn't need a backend server. You can host it for free on many platforms:

### Option 1: Vercel (Recommended)
1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com).
3. It will automatically detect the static files and deploy them.

### Option 2: Netlify
1. Drag and drop the project folder onto the [Netlify Drop](https://app.netlify.com/drop) page.
2. Or connect your GitHub repository for automatic deployments.

### Option 3: GitHub Pages
1. Go to your repository **Settings** -> **Pages**.
2. Select the branch (usually `main`) and the path (`/root`).
3. Click Save. Your site will be live at `https://<username>.github.io/<repo-name>/`.

## 📂 Project Structure

- `index.html`: The main entry point and UI structure.
- `style.css`: All styling, including theming and responsiveness.
- `script.js`: Core logic, state management, and event handling.
- `manifest.json`: Web app manifest for PWA installation.
- `sw.js`: Service worker for offline caching.

## 🔒 Privacy

Invoicely is built with privacy in mind. All data entered stays in your browser's local storage and is never sent to any server.

---

Made with ❤️ for the developer community.
