#!/usr/bin/env python3
"""SSG demo seed data — inserts realistic athletes and brand partners into the
local Postgres DB used by the NIL API.

Idempotent: running it multiple times will upsert on natural keys (clerk_id
for users, user_id for profiles, composite keys for child tables).

Usage:
    pip install psycopg2-binary
    python seed_data.py

DB connection can be overridden via env vars: SSG_DB_HOST, SSG_DB_PORT,
SSG_DB_NAME, SSG_DB_USER, SSG_DB_PASSWORD. Defaults match
backend/docker-compose.yml (nil_db / nil_user / nil_password on localhost:5433).
"""

import json
import os
import uuid
from datetime import datetime, timezone

import psycopg2

DB_CONFIG = {
    "host": os.getenv("SSG_DB_HOST", "localhost"),
    "port": int(os.getenv("SSG_DB_PORT", "5433")),
    "dbname": os.getenv("SSG_DB_NAME", "nil_db"),
    "user": os.getenv("SSG_DB_USER", "nil_user"),
    "password": os.getenv("SSG_DB_PASSWORD", "nil_password"),
}

SEED_TAG = "seed-script"

ATHLETES = [
    {"clerk": "seed_athlete_001", "first": "Jayden", "last": "Williams",
     "gender": "Male", "hometown": "Washington", "home_state": "DC",
     "sport": "FOOTBALL", "position": "Quarterback",
     "school": "University of Maryland", "conference": "BIG_TEN",
     "class_year": "Junior", "major": "Communications", "gpa": 3.4,
     "bio": "Starting QB at UMD. DMV raised, built different.",
     "handle": "jay.dub10", "followers": 18000, "engagement": 4.2,
     "liked": ["ATHLETIC_APPAREL", "FAST_FOOD", "RESTAURANTS", "SPORTS_NUTRITION"],
     "themes": ["football", "dmv", "student athlete", "lifestyle"]},

    {"clerk": "seed_athlete_002", "first": "Taysia", "last": "Brooks",
     "gender": "Female", "hometown": "Baltimore", "home_state": "MD",
     "sport": "WOMENS_BASKETBALL", "position": "Guard",
     "school": "University of Maryland", "conference": "BIG_TEN",
     "class_year": "Sophomore", "major": "Kinesiology", "gpa": 3.7,
     "bio": "Point guard. Baltimore to College Park. Academic All-Big Ten.",
     "handle": "taybrooks3", "followers": 12000, "engagement": 5.8,
     "liked": ["HEALTHY_FOOD", "ATHLETIC_APPAREL", "SKINCARE", "RESTAURANTS"],
     "themes": ["basketball", "women in sport", "baltimore", "fashion"]},

    {"clerk": "seed_athlete_003", "first": "Marcus", "last": "Hollingsworth",
     "gender": "Male", "hometown": "Atlanta", "home_state": "GA",
     "sport": "FOOTBALL", "position": "Wide Receiver",
     "school": "Howard University", "conference": "MEAC",
     "class_year": "Senior", "major": "Business Marketing", "gpa": 3.2,
     "bio": "WR1 at the Mecca. ATL to DC. HBCU pride.",
     "handle": "hollywood_marc", "followers": 24000, "engagement": 6.1,
     "liked": ["ATHLETIC_APPAREL", "FAST_FOOD", "STREETWEAR", "RESTAURANTS"],
     "themes": ["hbcu", "football", "atlanta", "culture"]},

    {"clerk": "seed_athlete_004", "first": "Amari", "last": "Johnson",
     "gender": "Female", "hometown": "Chicago", "home_state": "IL",
     "sport": "TRACK_AND_FIELD", "position": "400m / 4x400 Relay",
     "school": "Howard University", "conference": "MEAC",
     "class_year": "Junior", "major": "Biology (Pre-Med)", "gpa": 3.9,
     "bio": "MEAC champ. Chicago-bred. Pre-med grind.",
     "handle": "amari.runs", "followers": 8000, "engagement": 7.2,
     "liked": ["SPORTS_NUTRITION", "HEALTHY_FOOD", "FITNESS_EQUIPMENT", "ATHLETIC_APPAREL"],
     "themes": ["track", "hbcu", "pre-med", "faith"]},

    {"clerk": "seed_athlete_005", "first": "Devon", "last": "Price",
     "gender": "Male", "hometown": "Detroit", "home_state": "MI",
     "sport": "MENS_BASKETBALL", "position": "Forward",
     "school": "Morgan State University", "conference": "MEAC",
     "class_year": "Junior", "major": "Communications", "gpa": 3.1,
     "bio": "6'7 forward. Detroit hooper. Morgan State.",
     "handle": "dpricemvp", "followers": 14000, "engagement": 5.3,
     "liked": ["ATHLETIC_APPAREL", "STREETWEAR", "FAST_FOOD", "GAMING"],
     "themes": ["basketball", "hbcu", "detroit", "hoops"]},

    {"clerk": "seed_athlete_006", "first": "Kendrick", "last": "Walters",
     "gender": "Male", "hometown": "Newark", "home_state": "NJ",
     "sport": "FOOTBALL", "position": "Linebacker",
     "school": "Morgan State University", "conference": "MEAC",
     "class_year": "Sophomore", "major": "Criminal Justice", "gpa": 3.0,
     "bio": "LB. Newark made. Morgan State Bear.",
     "handle": "kwalters44", "followers": 9000, "engagement": 4.8,
     "liked": ["FAST_FOOD", "RESTAURANTS", "ATHLETIC_APPAREL", "STREETWEAR"],
     "themes": ["football", "hbcu", "njersey", "hard work"]},

    {"clerk": "seed_athlete_007", "first": "Ny'lah", "last": "Thomas",
     "gender": "Female", "hometown": "Hampton", "home_state": "VA",
     "sport": "WOMENS_BASKETBALL", "position": "Guard",
     "school": "Hampton University", "conference": "CAA",
     "class_year": "Senior", "major": "Sports Management", "gpa": 3.5,
     "bio": "Hometown hero. Hampton Pirate. Leading scorer.",
     "handle": "nylahbuckets", "followers": 16000, "engagement": 6.4,
     "liked": ["HEALTHY_FOOD", "ATHLETIC_APPAREL", "HAIRCARE", "RESTAURANTS"],
     "themes": ["basketball", "hbcu", "hampton roads", "women's hoops"]},

    {"clerk": "seed_athlete_008", "first": "Dorian", "last": "Carter",
     "gender": "Male", "hometown": "Richmond", "home_state": "VA",
     "sport": "FOOTBALL", "position": "Defensive Back",
     "school": "Hampton University", "conference": "CAA",
     "class_year": "Junior", "major": "Finance", "gpa": 3.3,
     "bio": "Lockdown corner. RVA to Hampton. DB U.",
     "handle": "dcarter_ii", "followers": 7000, "engagement": 5.1,
     "liked": ["ATHLETIC_APPAREL", "FAST_FOOD", "RESTAURANTS", "GAMING"],
     "themes": ["football", "hbcu", "rva", "defense"]},

    {"clerk": "seed_athlete_009", "first": "Jasmine", "last": "Okafor",
     "gender": "Female", "hometown": "Upper Marlboro", "home_state": "MD",
     "sport": "TRACK_AND_FIELD", "position": "100m Hurdles",
     "school": "Towson University", "conference": "CAA",
     "class_year": "Senior", "major": "Public Health", "gpa": 3.6,
     "bio": "Hurdler. Nigerian-American. PG County pride.",
     "handle": "jas.hurdles", "followers": 22000, "engagement": 6.7,
     "liked": ["SPORTS_NUTRITION", "HEALTHY_FOOD", "ATHLETIC_APPAREL", "SKINCARE"],
     "themes": ["track", "dmv", "culture", "wellness"]},

    {"clerk": "seed_athlete_010", "first": "Ethan", "last": "Rivers",
     "gender": "Male", "hometown": "Annapolis", "home_state": "MD",
     "sport": "WRESTLING", "position": "149 lbs",
     "school": "University of Maryland", "conference": "BIG_TEN",
     "class_year": "Senior", "major": "Mechanical Engineering", "gpa": 3.8,
     "bio": "Big Ten wrestler. Engineering student. Annapolis local.",
     "handle": "rivers_149", "followers": 11000, "engagement": 4.5,
     "liked": ["SPORTS_NUTRITION", "FITNESS_EQUIPMENT", "HEALTHY_FOOD", "RESTAURANTS"],
     "themes": ["wrestling", "engineering", "dmv", "grind"]},

    {"clerk": "seed_athlete_011", "first": "Chris", "last": "Abernathy",
     "gender": "Male", "hometown": "Baltimore", "home_state": "MD",
     "sport": "MENS_BASKETBALL", "position": "Center",
     "school": "UMBC", "conference": "OTHER",
     "class_year": "Senior", "major": "Information Systems", "gpa": 3.4,
     "bio": "6'10 center. Baltimore native. UMBC Retriever.",
     "handle": "big_abe24", "followers": 5000, "engagement": 3.9,
     "liked": ["FAST_FOOD", "RESTAURANTS", "GAMING", "ATHLETIC_APPAREL"],
     "themes": ["basketball", "baltimore", "tech", "hoops"]},

    {"clerk": "seed_athlete_012", "first": "Malik", "last": "Dawson",
     "gender": "Male", "hometown": "Richmond", "home_state": "VA",
     "sport": "MENS_BASKETBALL", "position": "Point Guard",
     "school": "Virginia Commonwealth University", "conference": "OTHER",
     "class_year": "Junior", "major": "Sports Management", "gpa": 3.2,
     "bio": "Quick PG. Havoc defense. RVA stand up.",
     "handle": "malikdawson_", "followers": 28000, "engagement": 5.5,
     "liked": ["ATHLETIC_APPAREL", "STREETWEAR", "FAST_FOOD", "HEALTHY_FOOD"],
     "themes": ["basketball", "rva", "streetwear", "havoc"]},

    {"clerk": "seed_athlete_013", "first": "Isaiah", "last": "Beckett",
     "gender": "Male", "hometown": "Annapolis", "home_state": "MD",
     "sport": "WRESTLING", "position": "174 lbs",
     "school": "United States Naval Academy", "conference": "AAC",
     "class_year": "Senior", "major": "Political Science", "gpa": 3.7,
     "bio": "Midshipman. Wrestler. Service before self.",
     "handle": "beckett174", "followers": 6000, "engagement": 4.1,
     "liked": ["SPORTS_NUTRITION", "FITNESS_EQUIPMENT", "ATHLETIC_APPAREL", "RESTAURANTS"],
     "themes": ["wrestling", "military", "discipline", "dmv"]},

    {"clerk": "seed_athlete_014", "first": "Sofia", "last": "Mendez",
     "gender": "Female", "hometown": "Bethesda", "home_state": "MD",
     "sport": "WOMENS_SOCCER", "position": "Midfielder",
     "school": "University of Maryland", "conference": "BIG_TEN",
     "class_year": "Junior", "major": "International Relations", "gpa": 3.8,
     "bio": "Mid. Big Ten starter. Bilingual content creator.",
     "handle": "sofimendez10", "followers": 13000, "engagement": 5.9,
     "liked": ["HEALTHY_FOOD", "ATHLETIC_APPAREL", "SKINCARE", "RESTAURANTS"],
     "themes": ["soccer", "women's sports", "dmv", "latina"]},

    {"clerk": "seed_athlete_015", "first": "Tariq", "last": "Simmons",
     "gender": "Male", "hometown": "Philadelphia", "home_state": "PA",
     "sport": "TRACK_AND_FIELD", "position": "100m / 200m Sprints",
     "school": "Morgan State University", "conference": "MEAC",
     "class_year": "Sophomore", "major": "Communications", "gpa": 3.0,
     "bio": "Sprinter. Philly made. 10.3 personal best.",
     "handle": "tariq.runs", "followers": 10000, "engagement": 6.3,
     "liked": ["SPORTS_NUTRITION", "ATHLETIC_APPAREL", "STREETWEAR", "HEALTHY_FOOD"],
     "themes": ["track", "hbcu", "philly", "speed"]},

    {"clerk": "seed_athlete_016", "first": "Olivia", "last": "Grant",
     "gender": "Female", "hometown": "Ellicott City", "home_state": "MD",
     "sport": "SWIMMING", "position": "Freestyle",
     "school": "University of Maryland", "conference": "BIG_TEN",
     "class_year": "Senior", "major": "Biology", "gpa": 3.9,
     "bio": "Freestyle swimmer. Big Ten finalist. Med school bound.",
     "handle": "livgrant_swim", "followers": 4000, "engagement": 4.7,
     "liked": ["SPORTS_NUTRITION", "HEALTHY_FOOD", "SKINCARE", "FITNESS_EQUIPMENT"],
     "themes": ["swimming", "wellness", "pre-med", "dmv"]},

    {"clerk": "seed_athlete_017", "first": "Bryce", "last": "Donovan",
     "gender": "Male", "hometown": "Silver Spring", "home_state": "MD",
     "sport": "MENS_SOCCER", "position": "Forward",
     "school": "University of Maryland", "conference": "BIG_TEN",
     "class_year": "Junior", "major": "Finance", "gpa": 3.5,
     "bio": "Striker. Terp. Big Ten goals leader 2025.",
     "handle": "bdonovan9", "followers": 15000, "engagement": 5.2,
     "liked": ["ATHLETIC_APPAREL", "RESTAURANTS", "HEALTHY_FOOD", "FAST_FOOD"],
     "themes": ["soccer", "big ten", "dmv", "finance"]},

    {"clerk": "seed_athlete_018", "first": "Camille", "last": "Reynolds",
     "gender": "Female", "hometown": "Bowie", "home_state": "MD",
     "sport": "TRACK_AND_FIELD", "position": "Long Jump",
     "school": "University of Maryland", "conference": "BIG_TEN",
     "class_year": "Senior", "major": "Journalism", "gpa": 3.6,
     "bio": "Long jumper. NCAA regional qualifier. DMV storyteller.",
     "handle": "camille.jumps", "followers": 32000, "engagement": 7.8,
     "liked": ["ATHLETIC_APPAREL", "HEALTHY_FOOD", "SKINCARE", "HAIRCARE"],
     "themes": ["track", "women in sport", "dmv", "journalism"]},

    {"clerk": "seed_athlete_019", "first": "Jamal", "last": "Briscoe",
     "gender": "Male", "hometown": "Severn", "home_state": "MD",
     "sport": "FOOTBALL", "position": "Running Back",
     "school": "United States Naval Academy", "conference": "AAC",
     "class_year": "Sophomore", "major": "Systems Engineering", "gpa": 3.4,
     "bio": "Mid RB. Triple option grind. Severn-bred.",
     "handle": "jbriscoe21", "followers": 8000, "engagement": 4.6,
     "liked": ["FAST_FOOD", "RESTAURANTS", "SPORTS_NUTRITION", "ATHLETIC_APPAREL"],
     "themes": ["football", "military", "dmv", "option"]},

    {"clerk": "seed_athlete_020", "first": "Naomi", "last": "Phillips",
     "gender": "Female", "hometown": "Columbia", "home_state": "MD",
     "sport": "VOLLEYBALL", "position": "Outside Hitter",
     "school": "University of Maryland", "conference": "BIG_TEN",
     "class_year": "Junior", "major": "Psychology", "gpa": 3.7,
     "bio": "OH. Big Ten block party. Columbia MD grown.",
     "handle": "naomi.vb7", "followers": 17000, "engagement": 5.4,
     "liked": ["ATHLETIC_APPAREL", "HEALTHY_FOOD", "SKINCARE", "RESTAURANTS"],
     "themes": ["volleyball", "big ten", "dmv", "women's sport"]},

    {"clerk": "seed_athlete_021", "first": "Trey", "last": "Jackson",
     "gender": "Male", "hometown": "Towson", "home_state": "MD",
     "sport": "MENS_LACROSSE", "position": "Attack",
     "school": "University of Maryland", "conference": "BIG_TEN",
     "class_year": "Senior", "major": "Economics", "gpa": 3.5,
     "bio": "Attackman. Terp lax. Hometown kid living the dream.",
     "handle": "treyjax_lax", "followers": 9000, "engagement": 4.3,
     "liked": ["ATHLETIC_APPAREL", "RESTAURANTS", "SPORTS_EQUIPMENT", "HEALTHY_FOOD"],
     "themes": ["lacrosse", "big ten", "dmv", "terp nation"]},

    {"clerk": "seed_athlete_022", "first": "Leilani", "last": "Chen",
     "gender": "Female", "hometown": "Rockville", "home_state": "MD",
     "sport": "WOMENS_SOCCER", "position": "Forward",
     "school": "Towson University", "conference": "CAA",
     "class_year": "Sophomore", "major": "Nursing", "gpa": 3.8,
     "bio": "Forward. CAA rising star. Future RN.",
     "handle": "leilanichen", "followers": 7000, "engagement": 5.0,
     "liked": ["HEALTHY_FOOD", "SPORTS_NUTRITION", "SKINCARE", "ATHLETIC_APPAREL"],
     "themes": ["soccer", "wellness", "dmv", "asian american"]},

    {"clerk": "seed_athlete_023", "first": "Xavier", "last": "Kemp",
     "gender": "Male", "hometown": "Norfolk", "home_state": "VA",
     "sport": "WRESTLING", "position": "184 lbs",
     "school": "Hampton University", "conference": "CAA",
     "class_year": "Junior", "major": "Kinesiology", "gpa": 3.1,
     "bio": "Wrestler. Norfolk to Hampton. Grind mode.",
     "handle": "xkemp_wr", "followers": 3000, "engagement": 3.8,
     "liked": ["SPORTS_NUTRITION", "FITNESS_EQUIPMENT", "FAST_FOOD", "ATHLETIC_APPAREL"],
     "themes": ["wrestling", "hbcu", "hampton roads", "grind"]},

    {"clerk": "seed_athlete_024", "first": "Simone", "last": "Pierre",
     "gender": "Female", "hometown": "Wheaton", "home_state": "MD",
     "sport": "SWIMMING", "position": "Backstroke",
     "school": "Towson University", "conference": "CAA",
     "class_year": "Junior", "major": "Biochemistry", "gpa": 3.9,
     "bio": "Backstroker. Haitian-American. Scholar-athlete.",
     "handle": "simone.swims", "followers": 5000, "engagement": 4.2,
     "liked": ["HEALTHY_FOOD", "SKINCARE", "HAIRCARE", "SPORTS_NUTRITION"],
     "themes": ["swimming", "culture", "dmv", "stem"]},

    {"clerk": "seed_athlete_025", "first": "Julian", "last": "Okonkwo",
     "gender": "Male", "hometown": "College Park", "home_state": "MD",
     "sport": "MENS_BASKETBALL", "position": "Forward",
     "school": "Howard University", "conference": "MEAC",
     "class_year": "Senior", "major": "Business", "gpa": 3.3,
     "bio": "Nigerian-American forward. Howard Bison. MEAC bucket-getter.",
     "handle": "juokonkwo", "followers": 21000, "engagement": 6.2,
     "liked": ["ATHLETIC_APPAREL", "RESTAURANTS", "STREETWEAR", "HEALTHY_FOOD"],
     "themes": ["basketball", "hbcu", "culture", "africa"]},

    {"clerk": "seed_athlete_026", "first": "Aaliyah", "last": "Washington",
     "gender": "Female", "hometown": "Dover", "home_state": "DE",
     "sport": "WOMENS_BASKETBALL", "position": "Forward",
     "school": "Delaware State University", "conference": "MEAC",
     "class_year": "Junior", "major": "Social Work", "gpa": 3.4,
     "bio": "Stretch 4. Delaware raised. Hornet pride.",
     "handle": "aaliyahw_23", "followers": 11000, "engagement": 5.7,
     "liked": ["HEALTHY_FOOD", "HAIRCARE", "ATHLETIC_APPAREL", "RESTAURANTS"],
     "themes": ["basketball", "hbcu", "delaware", "community"]},

    {"clerk": "seed_athlete_027", "first": "Aiden", "last": "Morales",
     "gender": "Male", "hometown": "Miami", "home_state": "FL",
     "sport": "SWIMMING", "position": "Butterfly",
     "school": "Howard University", "conference": "MEAC",
     "class_year": "Sophomore", "major": "Marketing", "gpa": 3.2,
     "bio": "Fly swimmer. Miami to DC. HBCU swim representation.",
     "handle": "aidenfly", "followers": 4000, "engagement": 4.4,
     "liked": ["HEALTHY_FOOD", "SPORTS_NUTRITION", "ATHLETIC_APPAREL", "RESTAURANTS"],
     "themes": ["swimming", "hbcu", "miami", "latino"]},

    {"clerk": "seed_athlete_028", "first": "Zora", "last": "Bankston",
     "gender": "Female", "hometown": "Columbia", "home_state": "MD",
     "sport": "WOMENS_LACROSSE", "position": "Defender",
     "school": "Towson University", "conference": "CAA",
     "class_year": "Senior", "major": "Elementary Education", "gpa": 3.6,
     "bio": "Defender. Towson Tiger. Future teacher.",
     "handle": "zora.lax", "followers": 6000, "engagement": 4.8,
     "liked": ["HEALTHY_FOOD", "ATHLETIC_APPAREL", "RESTAURANTS", "SKINCARE"],
     "themes": ["lacrosse", "women's sport", "dmv", "education"]},

    {"clerk": "seed_athlete_029", "first": "Derrick", "last": "Ezeh",
     "gender": "Male", "hometown": "Bronx", "home_state": "NY",
     "sport": "FOOTBALL", "position": "Defensive Line",
     "school": "Morgan State University", "conference": "MEAC",
     "class_year": "Junior", "major": "Criminal Justice", "gpa": 3.0,
     "bio": "DL. Bronx-to-Baltimore. Nigerian heritage.",
     "handle": "dezeh90", "followers": 13000, "engagement": 5.0,
     "liked": ["FAST_FOOD", "RESTAURANTS", "ATHLETIC_APPAREL", "STREETWEAR"],
     "themes": ["football", "hbcu", "nyc", "culture"]},

    {"clerk": "seed_athlete_030", "first": "Kehinde", "last": "Ade",
     "gender": "Male", "hometown": "Takoma Park", "home_state": "MD",
     "sport": "TRACK_AND_FIELD", "position": "5000m / 10000m Distance",
     "school": "University of Maryland", "conference": "BIG_TEN",
     "class_year": "Senior", "major": "Computer Science", "gpa": 3.7,
     "bio": "Distance runner. Nigerian-American. CS major. Big Ten.",
     "handle": "kehinde.runs", "themes": ["track", "stem", "dmv", "culture"],
     "followers": 25000, "engagement": 6.8,
     "liked": ["SPORTS_NUTRITION", "HEALTHY_FOOD", "FITNESS_EQUIPMENT", "ATHLETIC_APPAREL"]},
]

BRANDS = [
    {"clerk": "seed_brand_ledo", "contact_first": "Jim", "contact_last": "Beall",
     "contact_title": "VP Marketing", "email": "partnerships@ledopizza.com",
     "company": "Ledo Pizza", "industry": "Food & Beverage",
     "category": "RESTAURANTS", "company_size": "500-1000",
     "website": "https://ledopizza.com",
     "description": "Maryland's original square pizza since 1955. Locally owned and operated across the DMV.",
     "target_audience": "College students, families, sports fans across the DMV region",
     "marketing_goals": "Drive foot traffic to DMV locations, build affinity with UMD and Towson student-athletes, own game-day pizza in Maryland.",
     "preferred_sports": ["Football", "Men's Basketball", "Women's Basketball", "Lacrosse"],
     "preferred_conferences": ["Big Ten", "CAA", "MEAC"],
     "min_followers": "5K", "max_followers": "50K",
     "interest_alignment": ["food", "dmv", "community", "family", "football", "hometown pride"],
     "content_preferences": ["Reels", "TikTok Videos", "In-Person Appearances", "Photo Posts"],
     "budget_per_athlete": "$2,000 - $5,000", "deal_duration": "3-6 months",
     "min_budget": 2000.0, "max_budget": 5000.0,
     "matching_notes": "Strong preference for athletes with genuine DMV ties and hometown pride. Game-day content performs well."},

    {"clerk": "seed_brand_playa", "contact_first": "Priya", "contact_last": "Shah",
     "contact_title": "Director of Partnerships", "email": "nil@playabowls.com",
     "company": "Playa Bowls", "industry": "Food & Beverage",
     "category": "HEALTHY_FOOD", "company_size": "1000-5000",
     "website": "https://playabowls.com",
     "description": "Açaí bowls, pitaya bowls, smoothies, and coconut bowls made fresh daily. Surf-inspired, health-focused.",
     "target_audience": "Gen Z wellness-minded students, female athletes, fitness-driven consumers 16-28",
     "marketing_goals": "Position Playa Bowls as the go-to post-workout fuel for college athletes. Grow brand awareness at mid-Atlantic schools.",
     "preferred_sports": ["Women's Basketball", "Women's Soccer", "Track and Field", "Swimming", "Volleyball", "Lacrosse"],
     "preferred_conferences": ["Big Ten", "CAA", "MEAC", "ACC"],
     "min_followers": "5K", "max_followers": "40K",
     "interest_alignment": ["wellness", "nutrition", "fitness", "lifestyle", "women's sport"],
     "content_preferences": ["Reels", "TikTok Videos", "Story Posts", "Recipe Content"],
     "budget_per_athlete": "$3,000 - $8,000", "deal_duration": "6 months",
     "min_budget": 3000.0, "max_budget": 8000.0,
     "matching_notes": "Prioritize athletes with wellness/nutrition content and strong female audience engagement."},

    {"clerk": "seed_brand_owala", "contact_first": "Kara", "contact_last": "Lindgren",
     "contact_title": "Athlete Marketing Manager", "email": "athletes@owala.com",
     "company": "Owala", "industry": "Consumer Products",
     "category": "FITNESS_EQUIPMENT", "company_size": "100-500",
     "website": "https://owalalife.com",
     "description": "Insulated water bottles built for people on the move. FreeSip spout, vibrant colors, hydration for life.",
     "target_audience": "Hydration-conscious athletes and students, Gen Z, workout enthusiasts",
     "marketing_goals": "Get Owala bottles visible in practice and training content. Drive trial via athlete endorsement.",
     "preferred_sports": ["Track and Field", "Swimming", "Women's Basketball", "Women's Soccer", "Wrestling", "Volleyball"],
     "preferred_conferences": ["Big Ten", "ACC", "CAA", "MEAC"],
     "min_followers": "3K", "max_followers": "35K",
     "interest_alignment": ["hydration", "fitness", "training", "wellness", "athletic apparel"],
     "content_preferences": ["Reels", "TikTok Videos", "In-Training Content", "Photo Posts"],
     "budget_per_athlete": "$5,000 - $12,000", "deal_duration": "6-12 months",
     "min_budget": 5000.0, "max_budget": 12000.0,
     "matching_notes": "Endurance and training-heavy sports are a strong fit. Athletes who show daily routines and hydration habits convert best."},

    {"clerk": "seed_brand_brusters", "contact_first": "Tom", "contact_last": "Bruster",
     "contact_title": "Regional Marketing", "email": "marketing@brusters.com",
     "company": "Bruster's Real Ice Cream", "industry": "Food & Beverage",
     "category": "RESTAURANTS", "company_size": "1000-5000",
     "website": "https://brusters.com",
     "description": "Real ice cream made fresh in-store daily. Family-owned, community-focused, 200+ locations.",
     "target_audience": "Families, student-athletes, community-minded audiences, team celebrations",
     "marketing_goals": "Build brand affinity with local college teams and student-athletes. Own the 'team treat' moment.",
     "preferred_sports": ["Football", "Men's Basketball", "Women's Basketball", "Lacrosse", "Volleyball"],
     "preferred_conferences": ["Big Ten", "CAA", "MEAC", "ACC"],
     "min_followers": "3K", "max_followers": "30K",
     "interest_alignment": ["family", "community", "team", "lifestyle", "celebration"],
     "content_preferences": ["Reels", "Photo Posts", "In-Person Appearances", "Team Content"],
     "budget_per_athlete": "$2,000 - $4,000", "deal_duration": "3 months",
     "min_budget": 2000.0, "max_budget": 4000.0,
     "matching_notes": "Family-friendly content required. Team celebration and community activation moments are the sweet spot."},

    {"clerk": "seed_brand_sistahs", "contact_first": "Ayana", "contact_last": "Carter",
     "contact_title": "Owner", "email": "hello@sistahssweets.com",
     "company": "Sistahs' Sweets", "industry": "Food & Beverage",
     "category": "LOCAL_BUSINESS", "company_size": "1-10",
     "website": "https://sistahssweets.com",
     "description": "Black-woman-owned bakery in Baltimore. Signature cupcakes, custom cakes, and desserts rooted in family recipes.",
     "target_audience": "Baltimore community, HBCU students, Black college athletes, culturally-connected consumers",
     "marketing_goals": "Raise profile beyond Baltimore, connect with HBCU and DMV athletes who reflect our community.",
     "preferred_sports": ["Women's Basketball", "Track and Field", "Men's Basketball", "Football"],
     "preferred_conferences": ["MEAC", "CAA", "Big Ten"],
     "min_followers": "2K", "max_followers": "25K",
     "interest_alignment": ["community", "culture", "baltimore", "hbcu", "women-owned", "family"],
     "content_preferences": ["Reels", "Photo Posts", "Story Posts", "In-Person Appearances"],
     "budget_per_athlete": "$1,000 - $3,000", "deal_duration": "3 months",
     "min_budget": 1000.0, "max_budget": 3000.0,
     "matching_notes": "Culturally aligned HBCU athletes and Baltimore-area athletes are the top priority. Community storytelling over polished ads."},
]


USER_UPSERT = """
INSERT INTO users (
    id, clerk_id, email, email_verified, first_name, last_name, status,
    created_at, updated_at, created_by, updated_by, version
) VALUES (%s, %s, %s, %s, %s, %s, 'ACTIVE', %s, %s, %s, %s, 0)
ON CONFLICT (clerk_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = EXCLUDED.updated_at,
    updated_by = EXCLUDED.updated_by
RETURNING id;
"""

ATHLETE_PROFILE_UPSERT = """
INSERT INTO athlete_profiles (
    id, user_id, display_name, gender, hometown, home_state, bio,
    sport, position, school, conference, class_year, major, gpa,
    contact_email,
    has_existing_deals, is_active, is_accepting_deals, is_verified,
    profile_completeness_score,
    created_at, updated_at, created_by, updated_by, version
) VALUES (%s, %s, %s, %s, %s, %s, %s,
          %s, %s, %s, %s, %s, %s, %s,
          %s,
          false, true, true, false,
          85,
          %s, %s, %s, %s, 0)
ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    gender = EXCLUDED.gender,
    hometown = EXCLUDED.hometown,
    home_state = EXCLUDED.home_state,
    bio = EXCLUDED.bio,
    sport = EXCLUDED.sport,
    position = EXCLUDED.position,
    school = EXCLUDED.school,
    conference = EXCLUDED.conference,
    class_year = EXCLUDED.class_year,
    major = EXCLUDED.major,
    gpa = EXCLUDED.gpa,
    contact_email = EXCLUDED.contact_email,
    updated_at = EXCLUDED.updated_at,
    updated_by = EXCLUDED.updated_by
RETURNING id;
"""

ATHLETE_PREFS_UPSERT = """
INSERT INTO athlete_preferences (
    id, athlete_profile_id, liked_categories, content_themes,
    willing_to_travel, accepts_product_only,
    created_at, updated_at, created_by, updated_by, version
) VALUES (%s, %s, %s, %s, true, true, %s, %s, %s, %s, 0)
ON CONFLICT (athlete_profile_id) DO UPDATE SET
    liked_categories = EXCLUDED.liked_categories,
    content_themes = EXCLUDED.content_themes,
    updated_at = EXCLUDED.updated_at,
    updated_by = EXCLUDED.updated_by;
"""

SOCIAL_UPSERT = """
INSERT INTO athlete_social_accounts (
    id, athlete_profile_id, platform, handle, profile_url,
    is_verified, is_connected, followers, engagement_rate,
    created_at, updated_at, created_by, updated_by, version
) VALUES (%s, %s, 'INSTAGRAM', %s, %s, false, false, %s, %s,
          %s, %s, %s, %s, 0)
ON CONFLICT (athlete_profile_id, platform) DO UPDATE SET
    handle = EXCLUDED.handle,
    profile_url = EXCLUDED.profile_url,
    followers = EXCLUDED.followers,
    engagement_rate = EXCLUDED.engagement_rate,
    updated_at = EXCLUDED.updated_at,
    updated_by = EXCLUDED.updated_by;
"""

BRAND_PROFILE_UPSERT = """
INSERT INTO brand_profiles (
    id, user_id, company_name, industry, brand_category, company_size,
    website, description,
    contact_first_name, contact_last_name, contact_title, contact_email,
    target_audience, marketing_goals, budget_range,
    preferred_sports, preferred_conferences, min_followers, max_followers,
    interest_alignment, content_preferences, budget_per_athlete, deal_duration,
    matching_notes,
    minimum_budget, maximum_budget,
    is_active, is_verified, is_accepting_applications, profile_completeness_score,
    created_at, updated_at, created_by, updated_by, version
) VALUES (%s, %s, %s, %s, %s, %s,
          %s, %s,
          %s, %s, %s, %s,
          %s, %s, %s,
          %s, %s, %s, %s,
          %s, %s, %s, %s,
          %s,
          %s, %s,
          true, true, true, 90,
          %s, %s, %s, %s, 0)
ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    industry = EXCLUDED.industry,
    brand_category = EXCLUDED.brand_category,
    website = EXCLUDED.website,
    description = EXCLUDED.description,
    target_audience = EXCLUDED.target_audience,
    marketing_goals = EXCLUDED.marketing_goals,
    preferred_sports = EXCLUDED.preferred_sports,
    preferred_conferences = EXCLUDED.preferred_conferences,
    min_followers = EXCLUDED.min_followers,
    max_followers = EXCLUDED.max_followers,
    interest_alignment = EXCLUDED.interest_alignment,
    content_preferences = EXCLUDED.content_preferences,
    budget_per_athlete = EXCLUDED.budget_per_athlete,
    deal_duration = EXCLUDED.deal_duration,
    matching_notes = EXCLUDED.matching_notes,
    minimum_budget = EXCLUDED.minimum_budget,
    maximum_budget = EXCLUDED.maximum_budget,
    updated_at = EXCLUDED.updated_at,
    updated_by = EXCLUDED.updated_by;
"""


def seed_athlete(cur, a, now):
    email = f"seed+{a['clerk']}@ssgdemo.local"
    cur.execute(USER_UPSERT, (
        str(uuid.uuid4()), a["clerk"], email, True,
        a["first"], a["last"],
        now, now, SEED_TAG, SEED_TAG,
    ))
    user_id = cur.fetchone()[0]

    cur.execute(ATHLETE_PROFILE_UPSERT, (
        str(uuid.uuid4()), user_id,
        f"{a['first']} {a['last']}", a["gender"], a["hometown"], a["home_state"], a["bio"],
        a["sport"], a["position"], a["school"], a["conference"],
        a["class_year"], a["major"], a["gpa"],
        email,
        now, now, SEED_TAG, SEED_TAG,
    ))
    athlete_profile_id = cur.fetchone()[0]

    cur.execute(ATHLETE_PREFS_UPSERT, (
        str(uuid.uuid4()), athlete_profile_id,
        json.dumps(a["liked"]), json.dumps(a["themes"]),
        now, now, SEED_TAG, SEED_TAG,
    ))

    cur.execute(SOCIAL_UPSERT, (
        str(uuid.uuid4()), athlete_profile_id,
        a["handle"], f"https://instagram.com/{a['handle']}",
        a["followers"], a["engagement"],
        now, now, SEED_TAG, SEED_TAG,
    ))


def seed_brand(cur, b, now):
    cur.execute(USER_UPSERT, (
        str(uuid.uuid4()), b["clerk"], b["email"], True,
        b["contact_first"], b["contact_last"],
        now, now, SEED_TAG, SEED_TAG,
    ))
    user_id = cur.fetchone()[0]

    cur.execute(BRAND_PROFILE_UPSERT, (
        str(uuid.uuid4()), user_id,
        b["company"], b["industry"], b["category"], b["company_size"],
        b["website"], b["description"],
        b["contact_first"], b["contact_last"], b["contact_title"], b["email"],
        b["target_audience"], b["marketing_goals"], b["budget_per_athlete"],
        json.dumps(b["preferred_sports"]), json.dumps(b["preferred_conferences"]),
        b["min_followers"], b["max_followers"],
        json.dumps(b["interest_alignment"]), json.dumps(b["content_preferences"]),
        b["budget_per_athlete"], b["deal_duration"],
        b["matching_notes"],
        b["min_budget"], b["max_budget"],
        now, now, SEED_TAG, SEED_TAG,
    ))


def main():
    print(f"Connecting to {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']} as {DB_CONFIG['user']}")
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    now = datetime.now(timezone.utc)

    try:
        with conn.cursor() as cur:
            for i, a in enumerate(ATHLETES, 1):
                seed_athlete(cur, a, now)
                print(f"  athlete {i:02d}/{len(ATHLETES)}: {a['first']} {a['last']} ({a['school']}, {a['sport']})")
            for i, b in enumerate(BRANDS, 1):
                seed_brand(cur, b, now)
                print(f"  brand   {i}/{len(BRANDS)}: {b['company']}")
        conn.commit()
        print(f"\nSeeded {len(ATHLETES)} athletes and {len(BRANDS)} brands.")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
