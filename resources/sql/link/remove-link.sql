UPDATE Lecture 
REMOVE links = (
    DELETE FROM Link
    RETURN BEFORE
    WHERE @rid = :linkId
)
WHERE @rid = :lectureId