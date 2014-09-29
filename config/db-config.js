"use strict";

module.exports = {
    url: 'mongodb://localhost:27017/db/local',
    users: [
        {
            name: 'Роман Єфімчук',
            password: 'qwerty',
            role: 'admin'
        },
        {
            name: 'TEST_USER',
            password: 'TEST_USER',
            role: 'user'
        }
    ]
};