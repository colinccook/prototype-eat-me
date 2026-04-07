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

function getLocalDateString() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const regionsIndex = JSON.parse(readFileSync(join(DATA_DIR, 'index.json'), 'utf-8'));
const today = getLocalDateString();

for (const region of regionsIndex.regions) {
  const regionDir = join(DATA_DIR, region.id);
  const restaurantsIndex = JSON.parse(readFileSync(join(regionDir, 'index.json'), 'utf-8'));

  const allItems = [];

  for (const restaurant of restaurantsIndex.restaurants) {
    const foodPath = join(regionDir, restaurant.id, 'food.json');
    let foodData;
    try {
      foodData = JSON.parse(readFileSync(foodPath, 'utf-8'));
    } catch (err) {
      console.error(`Error reading ${foodPath} for restaurant "${restaurant.name}": ${err.message}`);
      process.exit(1);
    }

    for (const item of foodData.items) {
      if (item.archiveDate != null) {
        continue;
      }

      allItems.push({
        ...item,
        ingestionDate: item.ingestionDate ?? today,
        restaurant: restaurant.name,
      });
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
