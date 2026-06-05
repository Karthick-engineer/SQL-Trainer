import json

difficulties = ["Easy", "Medium", "Hard"]
categories = ["Basic SELECT", "Filtering", "Aggregations", "Joins", "Subqueries", "Window Functions"]

# Sherlock themed narrative
narratives = [
    "The Case of the Missing Diamond",
    "The Cipher in the Shadows",
    "The Phantom of Baker Street",
    "The Midnight Train Mystery",
    "The Secret of the Old Manor",
    "The Scandal at the Docks"
]

questions = []
for i in range(1, 101):
    difficulty = difficulties[(i-1) % 3]
    category = categories[(i-1) % 6]
    narrative = narratives[(i-1) % 6]

    q = {
        "id": i,
        "title": f"Mystery #{i}: {narrative}",
        "description": f"Detective, we need your help with {narrative}. This is an {difficulty.lower()} investigation requiring you to use {category}.",
        "lesson": f"In this case, we'll practice {category}. Remember that efficiently querying the database can save valuable time in an investigation.",
        "difficulty": difficulty,
        "setup_sql": "",
        "expected_query": "",
        "solutions": [],
        "hint": "Analyze the schema carefully before making your deduction."
    }

    if category == "Basic SELECT":
        q["description"] += " Retrieve the list of suspects from the registry."
        q["setup_sql"] = "CREATE TABLE suspects (id INTEGER, name VARCHAR, alibi VARCHAR); INSERT INTO suspects VALUES (1, 'Prof. Moriarty', 'At the university'), (2, 'Irene Adler', 'Opera rehearsal'), (3, 'Col. Moran', 'Playing cards');"
        q["expected_query"] = "SELECT * FROM suspects;"
        q["solutions"] = [
            {"query": "SELECT * FROM suspects;", "description": "The most straightforward way to list everyone.", "efficiency": "Fastest"}
        ]
        q["lesson"] = "Basic SELECT statements are the foundation of any investigation. Use SELECT * to gather all available intelligence on a subject."
    elif category == "Filtering":
        q["description"] += " We need to find suspects who have an alibi related to the opera."
        q["setup_sql"] = "CREATE TABLE suspects (id INTEGER, name VARCHAR, alibi VARCHAR); INSERT INTO suspects VALUES (1, 'Prof. Moriarty', 'At the university'), (2, 'Irene Adler', 'Opera rehearsal'), (3, 'Col. Moran', 'Playing cards');"
        q["expected_query"] = "SELECT name FROM suspects WHERE alibi LIKE '%Opera%';"
        q["solutions"] = [
            {"query": "SELECT name FROM suspects WHERE alibi LIKE '%Opera%';", "description": "Using LIKE for pattern matching is optimal here.", "efficiency": "Fastest"},
            {"query": "SELECT name FROM suspects WHERE alibi = 'Opera rehearsal';", "description": "Exact match if you know the exact alibi, but less flexible.", "efficiency": "Fast"}
        ]
        q["lesson"] = "Filtering with WHERE clauses lets you narrow down your list of suspects based on specific clues."
    elif category == "Aggregations":
        q["description"] += " Calculate the total value of the stolen artifacts."
        q["setup_sql"] = "CREATE TABLE stolen_items (id INTEGER, artifact VARCHAR, value INTEGER); INSERT INTO stolen_items VALUES (1, 'Ruby Necklace', 5000), (2, 'Gold Pocket Watch', 1200), (3, 'Silver Cufflinks', 300);"
        q["expected_query"] = "SELECT SUM(value) AS total_value FROM stolen_items;"
        q["solutions"] = [
            {"query": "SELECT SUM(value) AS total_value FROM stolen_items;", "description": "Using SUM() aggregates the total efficiently.", "efficiency": "Fastest"}
        ]
        q["lesson"] = "Aggregations like SUM, COUNT, and AVG help you understand the scale of the crime."
    elif category == "Joins":
        q["description"] += " Connect the suspects to the locations they were seen at."
        q["setup_sql"] = "CREATE TABLE suspects (id INTEGER, name VARCHAR); CREATE TABLE sightings (suspect_id INTEGER, location VARCHAR); INSERT INTO suspects VALUES (1, 'Moriarty'), (2, 'Adler'); INSERT INTO sightings VALUES (1, 'Reichenbach Falls'), (2, 'Scandalous Photo Studio');"
        q["expected_query"] = "SELECT suspects.name, sightings.location FROM suspects JOIN sightings ON suspects.id = sightings.suspect_id;"
        q["solutions"] = [
            {"query": "SELECT suspects.name, sightings.location FROM suspects JOIN sightings ON suspects.id = sightings.suspect_id;", "description": "Inner join matches records existing in both tables.", "efficiency": "Fastest"},
            {"query": "SELECT name, location FROM suspects, sightings WHERE suspects.id = sightings.suspect_id;", "description": "Implicit join syntax, generally discouraged but works.", "efficiency": "Slower"}
        ]
        q["lesson"] = "Joins are how we connect different pieces of evidence to form a complete picture of the events."
    elif category == "Subqueries":
        q["description"] += " Identify suspects who were seen at locations where a crime occurred."
        q["setup_sql"] = "CREATE TABLE suspects (id INTEGER, name VARCHAR); CREATE TABLE sightings (suspect_id INTEGER, location VARCHAR); CREATE TABLE crimes (location VARCHAR, type VARCHAR); INSERT INTO suspects VALUES (1, 'Moriarty'), (2, 'Adler'); INSERT INTO sightings VALUES (1, 'Bank'), (2, 'Opera'); INSERT INTO crimes VALUES ('Bank', 'Robbery');"
        q["expected_query"] = "SELECT name FROM suspects WHERE id IN (SELECT suspect_id FROM sightings WHERE location IN (SELECT location FROM crimes));"
        q["solutions"] = [
            {"query": "SELECT DISTINCT s.name FROM suspects s JOIN sightings si ON s.id = si.suspect_id JOIN crimes c ON si.location = c.location;", "description": "Joins are often faster than nested subqueries for this type of operation.", "efficiency": "Fastest"},
            {"query": "SELECT name FROM suspects WHERE id IN (SELECT suspect_id FROM sightings WHERE location IN (SELECT location FROM crimes));", "description": "Nested subqueries, logical but can be slower on large datasets.", "efficiency": "Slower"}
        ]
        q["lesson"] = "Subqueries allow you to nest investigations within investigations. Sometimes, though, joining the evidence directly is faster."
    elif category == "Window Functions":
        q["description"] += " Determine the chronological order of crimes in each district."
        q["setup_sql"] = "CREATE TABLE crimes (id INTEGER, district VARCHAR, date VARCHAR); INSERT INTO crimes VALUES (1, 'West End', '1890-01-01'), (2, 'East End', '1890-01-02'), (3, 'West End', '1890-01-03');"
        q["expected_query"] = "SELECT id, district, date, RANK() OVER (PARTITION BY district ORDER BY date) as chronological_order FROM crimes;"
        q["solutions"] = [
            {"query": "SELECT id, district, date, RANK() OVER (PARTITION BY district ORDER BY date) as chronological_order FROM crimes;", "description": "Using RANK() provides the ordering efficiently.", "efficiency": "Fastest"}
        ]
        q["lesson"] = "Window functions help us see patterns over time or across different categories without losing the detail of individual events."

    # Add variety based on ID to make them distinct
    q["description"] += f" Clue #{i}."

    questions.append(q)

with open('src/data/questions.json', 'w') as f:
    json.dump(questions, f, indent=2)

print("Generated Sherlock questions!")
