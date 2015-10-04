UPDATE Lecture
SET
name = :name,
description = :description,
links = :links
WHERE @rid = :lectureId