SELECT expand(links)
FROM Lecture
WHERE @rid = :lectureId