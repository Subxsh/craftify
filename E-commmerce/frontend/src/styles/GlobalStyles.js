import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    /* Primary Colors - Warm and Artisanal */
    --primary-color: #8B4513;
    --primary-light: #A0522D;
    --primary-dark: #654321;
    
    /* Secondary Colors - Complementary Earth Tones */
    --secondary-color: #D2691E;
    --secondary-light: #DEB887;
    --secondary-dark: #CD853F;
    
    /* Accent Colors */
    --accent-color: #DAA520;
    --accent-light: #F0E68C;
    --accent-dark: #B8860B;
    
    /* Neutral Colors */
    --white: #FFFFFF;
    --light-gray: #F8F9FA;
    --gray: #6C757D;
    --dark-gray: #495057;
    --black: #212529;
    
    /* Status Colors */
    --success: #28A745;
    --warning: #FFC107;
    --error: #DC3545;
    --info: #17A2B8;
    
    /* Typography */
    --font-primary: 'Poppins', sans-serif;
    --font-secondary: 'Playfair Display', serif;
    
    /* Font Sizes */
    --font-xs: 0.75rem;
    --font-sm: 0.875rem;
    --font-base: 1rem;
    --font-lg: 1.125rem;
    --font-xl: 1.25rem;
    --font-2xl: 1.5rem;
    --font-3xl: 1.875rem;
    --font-4xl: 2.25rem;
    --font-5xl: 3rem;
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    --spacing-3xl: 4rem;
    
    /* Border Radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-full: 9999px;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* Transitions */
    --transition-fast: 0.15s ease-in-out;
    --transition-normal: 0.3s ease-in-out;
    --transition-slow: 0.5s ease-in-out;
    
    /* Container Widths */
    --container-sm: 640px;
    --container-md: 768px;
    --container-lg: 1024px;
    --container-xl: 1280px;
    --container-2xl: 1536px;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-primary);
    font-size: var(--font-base);
    line-height: 1.6;
    color: var(--black);
    background-color: var(--white);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-secondary);
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: var(--spacing-md);
  }

  h1 { font-size: var(--font-4xl); }
  h2 { font-size: var(--font-3xl); }
  h3 { font-size: var(--font-2xl); }
  h4 { font-size: var(--font-xl); }
  h5 { font-size: var(--font-lg); }
  h6 { font-size: var(--font-base); }

  p {
    margin-bottom: var(--spacing-md);
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color var(--transition-fast);
    
    &:hover {
      color: var(--primary-dark);
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all var(--transition-fast);
  }

  input, textarea, select {
    font-family: inherit;
    outline: none;
    border: 1px solid var(--gray);
    border-radius: var(--radius-md);
    padding: var(--spacing-sm) var(--spacing-md);
    transition: border-color var(--transition-fast);
    
    &:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Utility Classes */
  .container {
    max-width: var(--container-xl);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }

  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }

  .hidden { display: none; }
  .block { display: block; }

  /* Responsive Design */
  @media (max-width: 768px) {
    :root {
      --font-4xl: 2rem;
      --font-3xl: 1.5rem;
      --font-2xl: 1.25rem;
    }
    
    .container {
      padding: 0 var(--spacing-sm);
    }
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--light-gray);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--gray);
    border-radius: var(--radius-full);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--dark-gray);
  }
`;

export default GlobalStyles;
