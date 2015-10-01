SELECT expand(questions)
FROM Lecture 
WHERE @rid = :lectureId