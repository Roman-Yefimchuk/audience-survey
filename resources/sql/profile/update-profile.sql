UPDATE Profile
SET
name = :name
WHERE @rid IN $profileId

LET $profileId = (
    SELECT profile.@rid
    FROM User
    WHERE @rid = :userId
)