UPDATE Profile
SET
passwordHash = :passwordHash
WHERE @rid IN $profileId

LET $profileId = (
    SELECT profile.@rid
    FROM User
    WHERE @rid = :userId
)