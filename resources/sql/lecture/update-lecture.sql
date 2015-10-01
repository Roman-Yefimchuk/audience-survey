UPDATE Lecture
SET
name = :name,
description = :description,
WHERE @rid = :lectureId