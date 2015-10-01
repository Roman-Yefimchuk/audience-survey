UPDATE Lecture 
ADD questions = (
    INSERT INTO Question
    SET
    title = :title,
    creationDate = :creationDate,
    type = :type,
    data = :data
)
RETURN AFTER @this.questions WHERE @rid = :lectureId