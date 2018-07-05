# marker

HKJC Mark Six records scraper

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
yarn run v1.7.0
$ node scripts/fetch.js
1993-01-05, saved 93/001 to 1993-01-05.json
1993-01-07, saved 93/002 to 1993-01-07.json
1993-01-12, saved 93/003 to 1993-01-12.json
...
2018-06-30, saved 18/072 to 2018-06-30.json
2018-07-03, saved 18/073 to 2018-07-03.json
2018-07-05, saved 18/074 to 2018-07-05.json
Successfully fetched 3384 Mark Six records
✨  Done in 7.78s.
```

Records will be stored in `data/records/`.

#### Record example

`1993-01-05.json`

```json
{
  "date": "1993-01-05",
  "id": "93/001",
  "numbers": [
    1,
    8,
    13,
    24,
    35,
    43
  ],
  "special": 33
}
```

### Show statistics

```bash
yarn stats
```

#### Output example

```bash
yarn run v1.7.0
$ node scripts/stats.js
{ total: 3384,
  numbers:
   [ { number: 9, count: 461, percentage: 0.136 },
     { number: 22, count: 460, percentage: 0.135 },
     { number: 33, count: 455, percentage: 0.134 },
     ... ],
  special:
   [ { number: 14, count: 94, percentage: 0.027 },
     { number: 10, count: 89, percentage: 0.026 },
     { number: 38, count: 83, percentage: 0.024 },
     ... ],
  notInLast10: [ 4, 11, 14, 15, 19, 25, 26, 27, 36, 37, 43, 44, 47 ] }
✨  Done in 0.41s.
```

## Test

Not available

## License

No license

(All rights reserved)
