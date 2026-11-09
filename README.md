# Commercial cleaning bid estimator

Price a commercial cleaning contract from the hours it actually takes, not square footage alone.

**Try it:** https://cleaningbidestimator.vercel.app
**How we built it:** https://sovrenservices.com/work/cleaning-bid-estimator

## How the math works
1. Each area's square footage divided by its production rate (sq ft cleaned per labor hour) gives labor hours per night.
2. Hours per night times nights per month (52 weeks / 12) gives monthly labor hours.
3. Labor cost uses the loaded wage: wage plus payroll burden.
4. Supplies are a percentage of labor. Overhead is a percentage of labor plus supplies.
5. Price = cost / (1 - target margin).
6. The tool compares that price with your usual per-square-foot quote and shows the gap.

The default production rates are Sovren's starting assumptions. Calibrate them against your own timesheets.

All of it lives in [`src/lib/estimator.ts`](src/lib/estimator.ts), with tests in `src/lib/estimator.test.ts`.

## Run it
```sh
npm ci
npm run dev     # http://localhost:3000
npm test
npm run lint
npm run build
```

Built by [Sovren](https://sovrenservices.com).

## Using the tool

Add, rename and remove areas, enter your costs, and the bid updates as you type. The bid sheet shows how labor, supplies, overhead and profit add up to the price, and marks where your usual per-square-foot quote falls on that scale. Invalid inputs hide the price and disable exports instead of understating costs.

**Save draft** and **Load draft** keep one estimate in this browser. **Export CSV** includes inputs, cost details and assumptions. **Print or save as PDF** includes internal costs and margins, so review it before you send it to a client.

The components follow atomic design. See `AGENTS.md` for the structure.

See [the QA review](docs/QA.md) for earlier findings and validation evidence.
