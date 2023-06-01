'use client';
import styles from './page.module.scss'
import {BrandIcon, H1} from "@primer-io/goat";
export default function Home() {
  return (
    <main className={styles.main}>
        <H1>Primer Playground Repo</H1>
        <BrandIcon src='https://goat-assets.production.core.primer.io/brand/icon/primer.svg' size='large' className={styles.logo} />
    </main>
  )
}
