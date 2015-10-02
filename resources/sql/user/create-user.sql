INSERT INTO User
SET 
genericId = :genericId,
rating = :rating,
registeredDate = :registeredDate,
profile = (
    INSERT INTO Profile
    SET
    name = :profile.name,
    passwordHash = :profile.passwordHash,
    email = :profile.email,
    isEmailVerified = :profile.isEmailVerified
),
role = :role,
authorizationProvider = :authorizationProvider