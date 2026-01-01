# Celebrity Birthdays Database

This directory contains a template structure for populating celebrity birthdays for all 365 days of the year.

## Files

- **`celebrities_database.py`** - Main database template with all 365 days
- **`seed_celebrities_for_today.py`** - Script to add celebrities for today's date
- **`seed_all_celebrities.py`** - Script to seed all celebrities from the database template

## How to Populate the Database

### Step 1: Research Celebrity Birthdays

Use reliable sources to find accurate celebrity birthdays:
- **Wikipedia**: https://en.wikipedia.org/wiki/Category:Births_by_month
  - Navigate to specific dates like "January 1 births"
- **IMDb**: https://www.imdb.com/search/name/?birth_date=YYYY-MM-DD
- **Biography.com**: Search for celebrities and verify their birth dates
- **Britannica**: Reliable historical and biographical information

### Step 2: Add Celebrities to `celebrities_database.py`

Open `celebrities_database.py` and find the date you want to populate. For example, for January 15:

```python
(1, 15): [
    {
        "name": "Martin Luther King Jr.",
        "photo_url": "https://images.unsplash.com/photo-...",
        "description": "American civil rights leader and Nobel Peace Prize winner",
        "birth_year": 1929
    },
    {
        "name": "Another Celebrity",
        "photo_url": "https://images.unsplash.com/photo-...",
        "description": "Brief description",
        "birth_year": 1980
    },
],
```

**Important Guidelines:**
- ✅ Only add **verified, accurate** information
- ✅ Use reliable photo sources (Unsplash, Wikipedia, official sources)
- ✅ Include a brief but informative description
- ✅ Add birth year when available
- ❌ **DO NOT** guess or make up data
- ❌ **DO NOT** use unverified sources

### Step 3: Seed the Database

#### Option A: Add celebrities for today only
```bash
python database/seed_celebrities_for_today.py
```

#### Option B: Add all celebrities from the database template
```bash
# First, do a dry run to see what would be added
python database/seed_all_celebrities.py --dry-run

# Then actually add them
python database/seed_all_celebrities.py
```

## Checking Database Status

To see how many dates are populated:

```bash
python database/celebrities_database.py
```

This will show:
- Total dates in template (366, including leap year)
- How many dates are populated
- Total number of celebrities
- Percentage populated

## Example: Populating a Date

Let's say you want to add celebrities for January 1:

1. **Research**: Go to Wikipedia "January 1 births" page
2. **Select 3-5 famous people** with verified birthdays
3. **Find photos**: Use Unsplash or Wikipedia for photo URLs
4. **Add to database**:

```python
(1, 1): [
    {
        "name": "Betsy Ross",
        "photo_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        "description": "American upholsterer credited with making the first American flag",
        "birth_year": 1752
    },
    {
        "name": "J. D. Salinger",
        "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        "description": "American writer, author of 'The Catcher in the Rye'",
        "birth_year": 1919
    },
    # Add more as needed...
],
```

5. **Run the seed script**:
```bash
python database/seed_celebrities_for_today.py
```

## Tips for Efficient Population

1. **Start with major dates**: Populate holidays and well-known dates first
2. **Work month by month**: Focus on one month at a time
3. **Verify everything**: Double-check birth dates from multiple sources
4. **Use consistent photo sources**: Stick to Unsplash or Wikipedia for consistency
5. **Keep descriptions concise**: 1-2 sentences maximum
6. **Prioritize well-known celebrities**: Focus on people most users would recognize

## Photo URLs

Recommended sources for celebrity photos:
- **Unsplash**: `https://images.unsplash.com/photo-[id]?w=400&h=400&fit=crop`
- **Wikipedia**: Use the direct image URL from Wikipedia pages
- **UI Avatars**: `https://ui-avatars.com/api/?name=[Name]&size=400` (fallback)

## Current Status

As of now, only **December 31** is populated with 3 celebrities as an example. The rest of the 365 days are empty and ready to be populated gradually.

## Need Help?

If you're unsure about a celebrity's birth date:
1. Check multiple sources
2. When in doubt, leave it empty
3. It's better to have fewer accurate entries than many incorrect ones

