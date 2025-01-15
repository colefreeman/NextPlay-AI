video-platform/
├── Assets/
│   ├── images/
│   │   ├── logo.svg 🔑
│   │   ├── default-avatar.png 🔑
│   │   └── placeholder-thumbnail.jpg 🔑
│   └── icons/
│       ├── upload.svg
│       ├── play.svg
│       └── settings.svg

├── services/
│   ├── api-gateway/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── apollo.ts 🔑      # Apollo Server configuration
│   │   │   │   ├── auth.ts 🔑        # Auth middleware config
│   │   │   │   └── cors.ts 🔑        # CORS configuration
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts 🔑        # JWT verification
│   │   │   │   ├── rateLimit.ts      # Rate limiting
│   │   │   │   └── logging.ts        # Request logging
│   │   │   ├── schema/
│   │   │   │   ├── index.ts 🔑       # Schema stitching
│   │   │   │   ├── user.ts 🔑        # User type definitions
│   │   │   │   └── video.ts 🔑       # Video type definitions
│   │   │   └── index.ts 🔑           # Main entry point
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── user-service/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts 🔑    # Database configuration
│   │   │   │   └── auth.ts 🔑        # Auth providers config
│   │   │   ├── controllers/
│   │   │   │   ├── auth.ts 🔑        # Auth controller
│   │   │   │   └── user.ts 🔑        # User management
│   │   │   ├── models/
│   │   │   │   ├── User.ts 🔑        # User model
│   │   │   │   └── Profile.ts        # Profile model
│   │   │   ├── services/
│   │   │   │   ├── auth.ts 🔑        # Auth business logic
│   │   │   │   └── user.ts 🔑        # User business logic
│   │   │   └── index.ts 🔑
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── video-service/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── storage.ts 🔑     # Storage configuration
│   │   │   │   └── encoding.ts 🔑    # Video encoding config
│   │   │   ├── controllers/
│   │   │   │   ├── upload.ts 🔑      # Upload handling
│   │   │   │   └── stream.ts 🔑      # Streaming controller
│   │   │   ├── models/
│   │   │   │   ├── Video.ts 🔑       # Video model
│   │   │   │   └── Comment.ts        # Comments model
│   │   │   ├── services/
│   │   │   │   ├── encoding.ts 🔑    # Video processing
│   │   │   │   ├── storage.ts 🔑     # File storage
│   │   │   │   └── streaming.ts 🔑   # Streaming service
│   │   │   └── index.ts 🔑
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/
│       ├── src/
│       │   ├── types/
│       │   │   ├── user.ts 🔑        # User interfaces
│       │   │   └── video.ts 🔑       # Video interfaces
│       │   └── utils/
│       │       ├── logger.ts 🔑       # Logging utility
│       │       └── validation.ts 🔑   # Shared validations
│       ├── package.json
│       └── tsconfig.json

├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx 🔑
│   │   │   │   ├── Input.tsx 🔑
│   │   │   │   └── Modal.tsx 🔑
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx 🔑
│   │   │   │   ├── Sidebar.tsx 🔑
│   │   │   │   └── Footer.tsx
│   │   │   └── video/
│   │   │       ├── Player.tsx 🔑
│   │   │       ├── Thumbnail.tsx 🔑
│   │   │       └── UploadForm.tsx 🔑
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx 🔑
│   │   │   │   └── Register.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── index.tsx 🔑
│   │   │   │   ├── Videos.tsx 🔑
│   │   │   │   └── Upload.tsx 🔑
│   │   │   └── home/
│   │   │       └── index.tsx 🔑
│   │   ├── services/
│   │   │   ├── api.ts 🔑             # Base API config
│   │   │   ├── auth.ts 🔑            # Auth API calls
│   │   │   └── video.ts 🔑           # Video API calls
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx 🔑
│   │   │   └── VideoContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts 🔑
│   │   │   └── useVideo.ts 🔑
│   │   ├── utils/
│   │   │   ├── formatters.ts 🔑
│   │   │   └── validators.ts 🔑
│   │   ├── App.tsx 🔑
│   │   ├── index.tsx 🔑
│   │   └── routes.tsx 🔑
│   ├── public/
│   │   ├── index.html 🔑
│   │   └── favicon.ico
│   ├── package.json
│   └── tsconfig.json

├── infrastructure/
│   ├── docker/
│   │   └── docker-compose.yml 🔑
│   └── kubernetes/ 📌
│       ├── api-gateway.yml
│       ├── user-service.yml
│       └── video-service.yml

├── .gitignore 🔑
├── README.md 🔑
└── package.json 🔑