# Commercial cleaning bid estimator

Price a commercial cleaning contract from the hours it actually takes, not square footage alone.

**Try it:** https://estimator.sovrenservices.com
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
