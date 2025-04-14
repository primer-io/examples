import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
const config: Config = {
  title: 'Checkout Components Docs',
  tagline:
    'Shape extraordinary commerce experiences, process payments with precision, and accelerate growth without compromise.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://composable-checkout.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'primer.io', // Usually your GitHub org/user name.
  projectName: 'composable-checkout', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  noIndex: true,
  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      {
        hashed: true,
        indexBlog: false,
        indexPages: true,
        docsDir: './general-docs',
        forceIgnoreNoIndex: true,
      },
    ],
  ],
  markdown: {
    mermaid: true,
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          path: 'general-docs',
          routeBasePath: '',
        },
        pages: {
          path: 'src/pages',
          routeBasePath: '',
          include: ['**/*.{js,jsx,ts,tsx,md,mdx}'],
          mdxPageComponent: '@theme/MDXPage',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
    },
    announcementBar: {
      id: 'beta_announcement',
      content:
        '🚧 <b>Pilot Program:</b> Checkout Components are in beta. <a href="/pilot-program">Learn what this means</a>.',
      backgroundColor: '#FFF8E1', // Light yellow background
      textColor: '#856404', // Darker text for contrast
      isCloseable: false, // Ensure users always see this notice
    },
    navbar: {
      title: 'Checkout Components',
      logo: {
        alt: 'Composable Checkout Logo',
        src: 'https://goat-assets.production.core.primer.io/brand/icon/primer.svg',
        style: {
          color: '#FFA49B',
        },
      },
      hideOnScroll: false,
      items: [
        {
          to: '/pilot-program',
          label: 'Pilot',
          position: 'left',
          className: 'navbar-beta-item',
        },
        {
          type: 'docSidebar',
          sidebarId: 'documentation',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'api',
          position: 'left',
          label: 'API',
        },
        {
          href: '/showcase',
          label: 'Showcase',
          position: 'left',
        },
        {
          href: '/changelog',
          label: 'Changelog',
          position: 'left',
        },
        {
          href: 'https://primer.io/docs/',
          label: 'Primer Docs',
          position: 'right',
        },
        {
          href: 'https://github.com/primer-io/examples',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Primer. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.oneDark,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
