# marker
HKJC Mark Six records crawler
## Development
 - Copy `.env.example` as `.env`, modify as needed
```bash
yarn install
```
## Build
Build the browser helper files
```bash
yarn build
```
## Usage
### Crawl the data
```bash
yarn fetch
```
#### Example output
```bash
$ node scripts/fetch.js
1993-01-05, saved 93/001
1993-01-07, saved 93/002
1993-01-12, saved 93/003
1993-01-14, saved 93/004
1993-01-19, saved 93/005
Successfully fetched 5 Mark Six records
```
### Show statistics
```bash
yarn stats
```
#### Example output
```bash
$ node scripts/stats.js
{ numbers:
   [ { number: 9, count: 460, percentage: 0.136 },
     { number: 22, count: 459, percentage: 0.136 },
     { number: 33, count: 450, percentage: 0.133 }
     ... ],
  extra:
   [ { number: 14, count: 94, percentage: 0.027 },
     { number: 10, count: 88, percentage: 0.026 },
     { number: 38, count: 83, percentage: 0.024 }
     ... ],
  notInLast10: [ 2, 10, 15, 17, 20, 24, 26, 27, 34, 35, 38, 39, 41, 48 ] }
```
## Test
Not available
## License
No license
