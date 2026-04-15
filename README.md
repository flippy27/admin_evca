# EVCA Admin Mobile App

React Native + Expo mobile application for managing EV charging infrastructure. Mirror of [ui-emobility-web](../ui-emobility-web) with complete feature parity.

## Quick Start

```bash
npm install
cp .env.example .env
npx expo start
```

## Status

✅ **Complete**: Authentication, routing, permission guards, UI components, API client, state management, TypeScript

🟡 **In Progress**: Real-time data, detail screens, form editing, reporting

❌ **Todo**: Tests, CI/CD, WebSocket updates, offline sync

## Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)** — Setup, config, debugging
- **[POSTMAN_COLLECTION.json](POSTMAN_COLLECTION.json)** — API endpoints
- **[.env.example](.env.example)** — Environment variables

## Key Features

- 📱 Charger management (list, detail, live data)
- 🏢 Site management with maps
- 👤 Authentication & permissions
- 📊 Reporting & analytics
- 🔐 AES-256 token encryption
- 🌍 Multi-language (ES/EN)
- 🧪 Mock API for development
- ✅ Full TypeScript type safety

## Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit for your setup
API_BASE_URL=http://localhost:3000
TOKEN_ENCRYPTION_KEY=your-key
```

## Development

### Without Backend (Mock API)
```env
ENABLE_MOCK_API=true
```

### With Local Backend
```env
API_BASE_URL=http://localhost:3000
ENABLE_MOCK_API=false
```

### With Remote Server
```env
API_BASE_URL=https://api.your-domain.com
```

## Structure

```
├── app/              # Expo Router screens
├── components/       # UI components
├── lib/
│   ├── api/         # API clients
│   ├── stores/      # State management
│   ├── hooks/       # Custom hooks
│   ├── types/       # TypeScript types
│   └── config/      # Configuration
└── assets/          # Images, fonts
```

## Support

See [DEVELOPMENT.md](DEVELOPMENT.md) for:
- Setup instructions
- Configuration options
- API testing with Postman
- Debugging tips
- File structure details
