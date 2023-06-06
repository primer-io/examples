"use client";
import styles from "./page.module.scss";
import { AppTopbar, BrandIcon, H1, H2, Link, P } from "@primer-io/goat";
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
      </AppTopbar.Root>
      <main className={styles.main}>
        <H2>Primer Playground Repo</H2>
        <P>
          This is a playground repo for testing out Primer components and
          styles.
        </P>
        <P>
          Check out the{" "}
          <Link href="https://goat-primer-io.vercel.app/">Goat docs</Link> for
          more info.
        </P>
      </main>
    </AppTopbar>
  );
}
