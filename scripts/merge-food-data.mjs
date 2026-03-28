#!/usr/bin/env node

/**
 * Merges individual restaurant food.json files into regional food.json files.
 *
 * For each region listed in data/index.json, reads the restaurant index
 * (data/{region}/index.json) and each restaurant's food.json, then writes
 * a merged regional food.json to src/react-app/public/data/{region}/food.json.
 *
 * Usage:
 *   node scripts/merge-food-data.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const PUBLIC_DATA_DIR = join(ROOT, 'src', 'react-app', 'public', 'data');

const regionsIndex = JSON.parse(readFileSync(join(DATA_DIR, 'index.json'), 'utf-8'));

for (const region of regionsIndex.regions) {
  const regionDir = join(DATA_DIR, region.id);
  const restaurantsIndex = JSON.parse(readFileSync(join(regionDir, 'index.json'), 'utf-8'));

  const allItems = [];

  for (const restaurant of restaurantsIndex.restaurants) {
    const foodPath = join(regionDir, restaurant.id, 'food.json');
    const foodData = JSON.parse(readFileSync(foodPath, 'utf-8'));

    for (const item of foodData.items) {
      allItems.push({ ...item, restaurant: restaurant.name });
    }
  }

  const regionFood = {
    region: region.name,
    items: allItems,
  };

  const outPath = join(PUBLIC_DATA_DIR, region.id, 'food.json');
  writeFileSync(outPath, JSON.stringify(regionFood, null, 2) + '\n');

  console.log(`Merged ${allItems.length} items from ${restaurantsIndex.restaurants.length} restaurants into ${outPath}`);
}
