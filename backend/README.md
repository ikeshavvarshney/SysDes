SysBackend – System Design Simulator Backend
Overview

This is the backend for the System Design Simulator project.
It provides REST APIs for user authentication, system designs, components, commits, templates, and security.
The project is currently under development.

Features (Current)

User authentication (register, login, JWT-based)

CRUD operations for designs and components

Commit history for designs (multi-user support)

Templates for pre-built system designs

Security tracking for designs (active protections, detected attacks)

Tech Stack

Node.js, Express.js

MongoDB with Mongoose

bcryptjs for password hashing

jsonwebtoken for authentication

nodemon for development

API Endpoints

Users

POST /api/users/register → Register a new user

POST /api/users/login → Login and get JWT token

GET /api/users/me → Get logged-in user profile (JWT required)

Designs

POST /api/designs → Create a new design

GET /api/designs → Get all designs for the logged-in user

GET /api/designs/:id → Get a specific design by ID

PUT /api/designs/:id → Update a design (components, connections, etc.)

DELETE /api/designs/:id → Delete a design

Components

POST /api/components → Add a new component to a design

GET /api/components/:id → Get details of a component

PUT /api/components/:id → Update a component (metrics, health, etc.)

DELETE /api/components/:id → Delete a component

Commits

POST /api/commits → Push a commit snapshot of a design

GET /api/commits/:designId → Get all commits for a design

Templates

GET /api/templates → Get all system design templates

Security

POST /api/security → Update security protections for a design

GET /api/security/:designId → Get security status of a design