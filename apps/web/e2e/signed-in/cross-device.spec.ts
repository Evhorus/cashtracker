import { expect, test, type Page } from "@playwright/test";

import {
  createEnvelope,
  deleteEnvelope,
  nameRe,
  uniqueName,
} from "../support/fixtures";

/**
 * Two screens, one account.
 *
 * This is a finance app: what one screen writes has to be what the other
 * reads on its very next load, with no stale window. Each test opens a
 * second page - the "phone" - and has it load the page BEFORE the write,
 * then reload after it. A page that was already rendered once is the case
 * that matters; a first load would read fresh from the backend even with
 * a broken cache.
 *
 * What this proves is the behaviour: after a write on one screen, the
 * other shows it on its next load. What it does NOT prove is that a cache
 * regression would be caught here - it was checked, and with `no-store`
 * replaced by `force-cache` and `refreshDashboard()` emptied, in both
 * `next dev` and a production build, these tests still passed (the cache
 * key includes the Authorization header, so a stale entry was never
 * reused). The cache itself is guarded structurally instead, by
 * src/shared/lib/data-freshness.test.ts, which does fail on that mutation.
 * Do not read a green run of this file as "no cache can go stale".
 */

test.describe.configure({ mode: "serial" });

const ENVELOPE = uniqueName("device");
const LIMIT = "100000";

const listUrl = `/dashboard/envelopes?search=${encodeURIComponent(ENVELOPE)}`;
const link = (page: Page) => page.getByRole("link", { name: nameRe(ENVELOPE) });
const card = (page: Page) =>
  link(page).locator("xpath=ancestor::*[self::article or self::div][1]");

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage();
  try {
    await deleteEnvelope(page, ENVELOPE);
  } finally {
    await page.close();
  }
});

test("an envelope created on one device is on the other's next load", async ({
  page,
}) => {
  const phone = await page.context().newPage();
  try {
    await phone.goto(listUrl);
    await expect(link(phone)).toHaveCount(0);

    await createEnvelope(page, ENVELOPE, LIMIT);

    await phone.reload();
    await expect(link(phone)).toBeVisible();
  } finally {
    await phone.close();
  }
});

test("an expense added on one device moves the totals on the other", async ({
  page,
}) => {
  const phone = await page.context().newPage();
  try {
    // The phone has already rendered the envelope with nothing spent.
    await phone.goto(listUrl);
    await expect(link(phone)).toBeVisible();
    await expect(card(phone).getByText("0%", { exact: true })).toBeVisible();

    await page.goto(listUrl);
    await link(page).click();
    await page.waitForURL(/\/dashboard\/envelope\//);
    await page.getByRole("button", { name: /agregar gasto/i }).click();
    await page.getByLabel(/nombre del gasto/i).fill("e2e expense");
    await page.getByLabel(/^monto/i).fill("25000");
    await page
      .getByRole("button", { name: /guardar|crear/i })
      .last()
      .click();
    await expect(page.getByText(/gasto creado/i)).toBeVisible();

    // The percentage is derived from the re-read spend, so it can only
    // be right if the phone really asked the backend again.
    await phone.reload();
    await expect(card(phone).getByText("25%", { exact: true })).toBeVisible();
    await expect(card(phone).getByText(/25\.000/)).toBeVisible();
  } finally {
    await phone.close();
  }
});

test("an envelope deleted on one device is gone on the other", async ({
  page,
}) => {
  const phone = await page.context().newPage();
  try {
    await phone.goto(listUrl);
    await expect(link(phone)).toBeVisible();

    await deleteEnvelope(page, ENVELOPE);

    await phone.reload();
    await expect(link(phone)).toHaveCount(0);
  } finally {
    await phone.close();
  }
});
