import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, Form, useActionData, useLoaderData } from "react-router";

import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

export const meta = () => [
  { title: "CrownIQ — Keep your inventory healthy" },
  {
    name: "description",
    content: "A simple inventory health monitor for Shopify stores.",
  },
];

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;

  return (
    <main className={styles.index}>
      <nav className={styles.nav} aria-label="Main navigation">
        <a className={styles.brand} href="/" aria-label="CrownIQ home">
          <span className={styles.brandMark}>C</span>
          <span>CrownIQ</span>
        </a>
        <span className={styles.navNote}>Inventory health, made simple.</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Shopify inventory intelligence</p>
          <h1 className={styles.heading}>Know what needs attention before it costs you.</h1>
          <p className={styles.text}>
            CrownIQ gives your store a clear, calm view of inventory health — so
            you can fix issues before they become missed sales.
          </p>
          {showForm && (
            <Form className={styles.form} method="post">
              <label className={styles.label} htmlFor="shop">
                <span>Shopify store domain</span>
                <input
                  className={styles.input}
                  id="shop"
                  type="text"
                  name="shop"
                  placeholder="your-store.myshopify.com"
                  autoComplete="url"
                  aria-describedby="shop-help"
                />
                <span id="shop-help" className={styles.helpText}>
                  {errors?.shop ?? "Connect your store to get started."}
                </span>
              </label>
              <button className={styles.button} type="submit">
                Open CrownIQ <span aria-hidden="true">→</span>
              </button>
            </Form>
          )}
          <p className={styles.privacy}>Built for Shopify merchants who like a clean dashboard.</p>
        </div>
        <div className={styles.preview} aria-label="CrownIQ dashboard preview">
          <div className={styles.previewTop}>
            <span className={styles.previewTitle}>Inventory health</span>
            <span className={styles.status}><span className={styles.statusDot} /> Good</span>
          </div>
          <div className={styles.scoreRow}>
            <div><span className={styles.score}>92</span><span className={styles.scoreOutOf}>/100</span><p>Health score</p></div>
            <div className={styles.scoreRing}>92</div>
          </div>
          <div className={styles.previewLine}><span>Products scanned</span><strong>248</strong></div>
          <div className={styles.previewLine}><span>Issues to review</span><strong className={styles.warning}>03</strong></div>
          <div className={styles.previewLine}><span>Last checked</span><strong>Today, 9:42 AM</strong></div>
          <div className={styles.previewFooter}>View scan details <span aria-hidden="true">↗</span></div>
        </div>
      </section>

      <section className={styles.features} aria-labelledby="features-title">
        <div className={styles.sectionIntro}><p className={styles.eyebrow}>A better baseline</p><h2 id="features-title">Small checks. Fewer surprises.</h2></div>
        <ul className={styles.list}>
          <li><span className={styles.featureNumber}>01</span><strong>Spot hidden risks</strong><span>Catch blank SKUs, duplicate listings, and negative stock at a glance.</span></li>
          <li><span className={styles.featureNumber}>02</span><strong>Prioritize clearly</strong><span>See what needs attention first, without digging through reports.</span></li>
          <li><span className={styles.featureNumber}>03</span><strong>Stay in control</strong><span>Run a fresh scan whenever you need confidence in your catalog.</span></li>
        </ul>
      </section>

      <footer className={styles.footer}><span>© {new Date().getFullYear()} TallyTick</span><span>Simple tools for growing stores.</span></footer>
    </main>
  );
}
