"use client";
import styles from "./page.module.scss";
import { AppTopbar, BrandIcon, Button, H1, H2, Link, P } from "@primer-io/goat";
export default function Home() {
  return (
    <AppTopbar>
      <AppTopbar.Root className={styles.topbar}>

        <AppTopbar.Logo>
          <BrandIcon
            src="https://goat-assets.production.core.primer.io/brand/icon/primer.svg"
            size="large"
            className={styles.logo}
          />
          </AppTopbar.Logo>
          <H1 type="title-large">Primer Playground Repo</H1>
        <AppTopbar.Actions>
          <Button as='a' href="https://goat-primer-io.vercel.app/">Goat docs</Button>
        </AppTopbar.Actions>
      </AppTopbar.Root>

      <main className={styles.main}>
        <H2>Primer Playground Repo</H2>
        <img src="https://www.elegantthemes.com/blog/wp-content/uploads/2020/08/000-http-error-codes.png" alt="404" />
        <P>
          Check out the{" "}
          <Link href="https://goat-primer-io.vercel.app/">Goat docs</Link> for
          more info.
        </P>
      </main>
    </AppTopbar>
  );
}
