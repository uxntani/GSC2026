function allocateResources(classes, teachers, rooms) {
    let schedule = [];

    // Sort by priority first (High → Low)
    const priorityMap = { High: 3, Medium: 2, Low: 1 };
    classes.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority]);

    for (let cls of classes) {
        let bestOption = null;
        let maxScore = -1;

        for (let teacher of teachers) {

            if (teacher.subject !== cls.subject) continue;

            for (let room of rooms) {

                if (room.capacity < cls.students) continue;

                for (let slot of teacher.availableSlots) {

                    let score = 0;

                    // 🧠 1. Perfect capacity match
                    let capacityDiff = room.capacity - cls.students;
                    score += 50 - capacityDiff; // smaller difference = better

                    // 🧠 2. Priority weight
                    score += priorityMap[cls.priority] * 20;

                    // 🧠 3. Check conflicts
                    let conflict = schedule.find(s =>
                        s.time === slot &&
                        (s.teacher === teacher.name || s.room === room.roomNumber)
                    );

                    if (conflict) {
                        score -= 100; // heavy penalty
                    }

                    // 🧠 Choose best
                    if (score > maxScore) {
                        maxScore = score;
                        bestOption = {
                            subject: cls.subject,
                            teacher: teacher.name,
                            room: room.roomNumber,
                            time: slot,
                            priority: cls.priority,
                            score: score
                        };
                    }
                }
            }
        }

        if (bestOption && bestOption.score > 0) {
            schedule.push(bestOption);
        } else {
            schedule.push({
                subject: cls.subject,
                message: "Could not allocate"
            });
        }
    }

    return schedule;
}

module.exports = allocateResources;