UPDATE Lecture 
ADD links = (
    INSERT INTO Link
    SET
    title = :title,
    url = :url
)
RETURN AFTER @this.links
WHERE @rid = :lectureId