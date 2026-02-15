# scheduler.py

def estimate_complexity(topics):
    weighted_topics = {}

    for unit, topic_list in topics.items():
        weighted_topics[unit] = []
        for topic in topic_list:
            if any(word in topic for word in ["algorithm", "coding", "design"]):
                weight = 3
            elif any(word in topic for word in ["numerical", "problem"]):
                weight = 2
            else:
                weight = 1

            weighted_topics[unit].append((topic, weight))

    return weighted_topics


def generate_schedule(weighted_topics, days, hours_per_day):
    schedule = {}
    day = 1
    daily_hours = 0

    for unit, topics in weighted_topics.items():
        for topic, weight in topics:
            if day > days:
                break

            schedule.setdefault(f"Day {day}", []).append(
                f"{topic} ({weight} hrs)"
            )

            daily_hours += weight
            if daily_hours >= hours_per_day:
                day += 1
                daily_hours = 0

    return schedule
