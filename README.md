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
### Fetch the records
```bash
yarn fetch
```
#### Output exmaple
```bash
yarn run v1.5.1
$ node scripts/fetch.js
1993-01-05, saved 93/001 to 1993-01-05.json
1993-01-07, saved 93/002 to 1993-01-07.json
1993-01-12, saved 93/003 to 1993-01-12.json
1993-01-14, saved 93/004 to 1993-01-14.json
1993-01-19, saved 93/005 to 1993-01-19.json
Successfully fetched 5 Mark Six records
```
Records will be stored in `$RECORDS_DIRECTORY`.
#### Data example
`1993-01-05.json`
```json
{
  "date": "1993-01-05",
  "number": "93/001",
  "result": {
    "extra": 33,
    "numbers": [
      1,
      8,
      13,
      24,
      35,
      43
    ]
  }
}
```
### Show statistics
```bash
yarn stats
```
#### Output example
```bash
yarn run v1.5.1
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
