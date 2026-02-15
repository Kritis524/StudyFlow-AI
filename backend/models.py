# models.py
import re

def preprocess_syllabus(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9,\n ]', '', text)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return lines


def extract_topics(lines):
    syllabus = {}
    current_unit = "General Topics"

    for line in lines:
        if "unit" in line or "chapter" in line:
            current_unit = line.title()
            syllabus[current_unit] = []
        else:
            topics = [t.strip() for t in line.split(',')]
            syllabus.setdefault(current_unit, []).extend(topics)

    return syllabus
