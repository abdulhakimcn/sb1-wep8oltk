# Dr.Zone AI Platform

Dr.Zone AI is a comprehensive digital platform designed exclusively for medical professionals. It provides a secure environment for doctors to connect, share knowledge, and access specialized tools.

## Features

- **MyZone**: Social feed for medical professionals
- **ZoneTube**: Medical videos and educational content
- **ZoneCast**: Medical podcasts from expert doctors
- **ChatZone**: Secure messaging for doctors
- **ZoneGBT**: AI-powered medical assistant
- **Multiple authentication methods**: Email and Phone authentication

## Technology Stack

- React with TypeScript
- Tailwind CSS for styling
- Supabase for backend and authentication
- Vite for build tooling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/abdulhakimch/hakeemzone.com.git
   cd hakeemzone.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Authentication

The platform supports multiple authentication methods:

- **Email/Password**: Standard authentication with email verification
- **Phone Authentication**: OTP-based authentication using phone numbers
  - Test phone numbers:
    - +967774168043 (Yemen)
    - +8613138607996 (China)
  - Test verification code: 123456

## Deployment

To deploy the application:

```bash
./deploy.sh
```

This script will build the application and push it to the connected repository.

## License

© 2023-2025 HakeemZone. All rights reserved.