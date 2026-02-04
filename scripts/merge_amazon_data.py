import csv
import re
from pathlib import Path
import sys

# Constants
EXCHANGE_RATE_INR_TO_USD = 1 / 83.0  # Approx exchange rate
# Relative paths from scripts/ folder
INPUT_LARGE_DATASET = Path("../amazondataset2023/Amazon-Products.csv")
EXISTING_PRODUCTS_CSV = Path("../prisma/products.csv")
BACKUP_PRODUCTS_CSV = Path("../prisma/products.csv.bak")

def parse_price(price_str):
    """Parses '₹32,999' or similar to float USD."""
    if not price_str:
        return 0.0
    # Remove chars like ₹, ,
    clean_str = re.sub(r'[^\d.]', '', price_str)
    try:
        val_inr = float(clean_str)
        return round(val_inr * EXCHANGE_RATE_INR_TO_USD)
    except ValueError:
        return 0.0

def clean_text(text):
    if not text:
        return ""
    # Remove excessive quotes or newlines
    return text.replace('"', '').replace('\n', ' ').strip()

def generate_tags(row):
    """Generates tags from category and name keywords."""
    tags = set()
    
    # Add category words
    main_cat = str(row.get('main_category', '')).lower()
    sub_cat = str(row.get('sub_category', '')).lower()
    
    for part in main_cat.replace('&', ' ').split():
        if len(part) > 2: tags.add(part)
    for part in sub_cat.replace('&', ' ').split():
        if len(part) > 2: tags.add(part)
        
    # Add gender/age keywords if present (basic heuristics)
    name = str(row.get('name', '')).lower()
    if 'baby' in name or 'baby' in main_cat or 'baby' in sub_cat: tags.add('baby')
    if 'kids' in name: tags.add('kids')
    if 'women' in name: tags.add('women'); tags.add('fashion')
    if 'men' in name and 'women' not in name: tags.add('men'); tags.add('fashion')
    
    return "|".join(sorted(tags))

def main():
    # 1. Backup existing file
    if EXISTING_PRODUCTS_CSV.exists():
        print(f"Backing up {EXISTING_PRODUCTS_CSV} to {BACKUP_PRODUCTS_CSV}")
        # Using shutil or just read/write implementation
        import shutil
        shutil.copy2(EXISTING_PRODUCTS_CSV, BACKUP_PRODUCTS_CSV)
    
    # 2. Read existing data to keep
    existing_rows = []
    fieldnames = ["id", "title", "description", "category", "tags", "price_min", "price_max", "amazon_url", "image_url", "locale", "active"]
    
    if BACKUP_PRODUCTS_CSV.exists():
        with open(BACKUP_PRODUCTS_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            if reader.fieldnames:
                fieldnames = reader.fieldnames
            existing_rows = list(reader)

    print(f"Loaded {len(existing_rows)} existing rows.")

    # 3. Process new dataset
    new_rows = []
    skipped = 0
    
    if not INPUT_LARGE_DATASET.exists():
        print(f"Error: Input file {INPUT_LARGE_DATASET} not found.")
        print(f"Current working directory: {Path.cwd()}")
        return

    print(f"Processing {INPUT_LARGE_DATASET}...")
    
    # Increase field size limit for large CSV fields
    csv.field_size_limit(sys.maxsize)

    with open(INPUT_LARGE_DATASET, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            # Parse prices
            p_min = parse_price(row.get('discount_price'))
            p_max = parse_price(row.get('actual_price'))
            
            if p_min == 0 and p_max == 0:
                skipped += 1
                continue

            # Fix Price: ensure min <= max
            if p_min > p_max: p_min, p_max = p_max, p_min
            if p_min == 0: p_min = p_max
            
            # Map fields
            new_item = {
                "id": f"amz_2023_{i}",
                "title": clean_text(row.get('name', 'Unknown Product')),
                "description": clean_text(row.get('name', '')), # Use title as desc
                "category": f"{row.get('main_category', 'Other')}|{row.get('sub_category', 'General')}",
                "tags": generate_tags(row),
                "price_min": str(int(p_min)),
                "price_max": str(int(p_max)),
                "amazon_url": row.get('link', ''),
                "image_url": row.get('image', ''),
                "locale": "US", # Converted to USD
                "active": "true"
            }
            
            # Ensure all fieldnames exist in new_item
            final_item = {k: new_item.get(k, '') for k in fieldnames}
            new_rows.append(final_item)
            
            if i % 10000 == 0:
                print(f"Processed {i} rows...", end='\r')

    print(f"\nProcessed {len(new_rows)} new rows. Skipped {skipped} invalid rows.")
    
    # 4. Write merged data
    all_rows = existing_rows + new_rows
    
    with open(EXISTING_PRODUCTS_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)
        
    print(f"Successfully wrote {len(all_rows)} rows to {EXISTING_PRODUCTS_CSV}")

if __name__ == "__main__":
    main()
