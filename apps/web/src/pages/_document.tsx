import { baseTheme, darkTheme, lightTheme, root } from '@buildeross/zord'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import { DEFAULT_THEME_MODE, THEME_STORAGE_KEY } from 'src/theme/theme'

export default class MyDocument extends Document {
  render() {
    const themeInitScript = `
      (function() {
        var storageKey = '${THEME_STORAGE_KEY}';
        var defaultMode = '${DEFAULT_THEME_MODE}';
        var lightThemeClass = '${lightTheme}';
        var darkThemeClass = '${darkTheme}';
        var mode = defaultMode;

        try {
          var storedTheme = window.localStorage.getItem(storageKey);
          if (storedTheme === 'light' || storedTheme === 'dark') {
            mode = storedTheme;
          } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            mode = 'dark';
          }
        } catch (error) {}

        document.documentElement.dataset.themeMode = mode;
        document.documentElement.style.colorScheme = mode;

        var themeClass = mode === 'dark' ? darkThemeClass : lightThemeClass;
        document.body.classList.remove(lightThemeClass, darkThemeClass);
        document.body.classList.add(themeClass);
      })();
    `

    return (
      <Html>
        <Head>
          <link
            rel="preload"
            href="/fonts/pt-root-ui_bold.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/pt-root-ui_medium.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/pt-root-ui_regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        </Head>
        <body className={`${root} ${baseTheme} ${lightTheme}`} style={{ margin: 0 }}>
          <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
