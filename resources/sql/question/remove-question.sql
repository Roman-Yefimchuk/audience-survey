UPDATE Lecture 
REMOVE questions = (
    DELETE FROM Question
    RETURN BEFORE
    WHERE @rid = :questionId
)
WHERE @rid = :lectureId