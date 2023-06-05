'use client';
import styles from './page.module.scss'
import { BrandIcon, H1, Link, P } from "@primer-io/goat";
export default function Home() {
  return (
    <main className={styles.main}>
        <H1>Primer Playground Repo</H1>
        <P>
          This is a playground repo for testing out Primer components and styles.
        </P>
        <P>
          Check out the <Link href="https://goat-primer-io.vercel.app/">Goat docs</Link> for more info.
        </P>
        <BrandIcon src='https://goat-assets.production.core.primer.io/brand/icon/primer.svg' size='large' className={styles.logo} />
    </main>
  )
}
