# Game Night

Platforma za organizaciju turnira i pracenje rezultata drustvenih igara.

## Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Sequelize** ORM + **MySQL**
- **JWT** autentifikacija (bcryptjs)
- **Swagger** API dokumentacija
- **Helmet** + **express-rate-limit** + **express-validator** (bezbednost)

### Frontend
- **React** + **TypeScript**
- **React Bootstrap** (UI)
- **Chart.js** (vizualizacija podataka)
- **Axios** (HTTP klijent)
- **React Router** (rutiranje)

### DevOps
- **Docker** + **Docker Compose**
- **GitHub Actions** CI/CD
- **Jest** + **Supertest** (testovi)

## Pokretanje projekta

### Preduslovi
- Docker i Docker Compose

### Pokretanje
```bash
cd game-night
docker-compose up --build
```

Aplikacija ce biti dostupna na:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Swagger Docs**: http://localhost:5000/api/docs

### Inicijalni podaci (seed)
```bash
docker exec -it gamenight-backend npm run seed
```

### Test nalozi
| Uloga  | Email                  | Lozinka      |
|--------|------------------------|--------------|
| Admin  | admin@gamenight.com    | password123  |
| Igrac  | marko@example.com      | password123  |
| Igrac  | ana@example.com        | password123  |
| Igrac  | petar@example.com      | password123  |
| Gost   | gost@example.com       | password123  |

## Struktura projekta

```
game-night/
├── backend/
│   └── src/
│       ├── config/         # Konfiguracija baze i Swagger-a
│       ├── controllers/    # Kontroleri (biznis logika)
│       ├── middleware/      # Auth i admin middleware
│       ├── migrations/     # Migracije baze (7 fajlova, 3 tipa)
│       ├── models/         # Sequelize modeli (5: User, Game, Event, Match, Registration)
│       ├── routes/         # API rute sa Swagger JSDoc
│       ├── seeds/          # Seed podaci
│       ├── __tests__/      # Jest testovi
│       └── app.ts          # Entry point
├── frontend/
│   └── src/
│       ├── components/     # Reusable komponente (5)
│       ├── context/        # Auth context
│       ├── hooks/          # Custom hooks
│       ├── pages/          # Stranice (8)
│       ├── services/       # API servisi
│       └── App.tsx         # Root komponenta
├── .github/workflows/      # CI/CD pipeline
├── docker-compose.yml      # Docker konfiguracija
└── README.md
```

## Modeli (5)
1. **User** - korisnici (admin, player, guest)
2. **Game** - drustvene igre
3. **Event** - dogadjaji (jedan event = jedna igra)
4. **Match** - rezultati partija
5. **Registration** - prijave na dogadjaje

## Migracije (3 tipa)
1. **CREATE TABLE** - kreiranje tabela (001-005)
2. **ADD COLUMN** - dodavanje kolone (006)
3. **MODIFY COLUMN** - izmena kolone (007)

## API Dokumentacija
Swagger UI dostupan na `/api/docs` nakon pokretanja backend-a.

### Glavni endpointi:
- `POST /api/auth/register` - Registracija
- `POST /api/auth/login` - Prijava
- `GET /api/events` - Lista dogadjaja
- `POST /api/events/:id/register` - Prijava na dogadjaj
- `GET /api/matches/leaderboard` - Rang lista
- `GET /api/external/bgg/search` - BoardGameGeek pretraga
- `GET /api/external/weather` - Vremenska prognoza

## Eksterni API-ji
1. **BoardGameGeek XML API** - pretraga i detalji drustvenih igara
2. **OpenWeatherMap API** - vremenska prognoza za lokaciju dogadjaja

## Bezbednost
- **Helmet** - HTTP security headers
- **express-rate-limit** - zastita od brute force napada
- **bcryptjs** - hesiranje lozinki
- **JWT** - autentifikacija tokenom
- **CORS** - kontrola pristupa

## Tipovi korisnika
1. **Admin** - Puni pristup, upravljanje dogadjajima i unosom rezultata
2. **Player** - Prijava na dogadjaje, pregled statistike
3. **Guest** - Samo pregled, bez prijave na dogadjaje

## Testovi
```bash
cd backend
npm test
```

## Environment varijable
```env
# Backend
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gamenight
DB_USER=gamenight
DB_PASSWORD=gamenightpass
JWT_SECRET=your-secret-key
PORT=5000
OPENWEATHER_API_KEY=your-api-key

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

## Razvoj bez Docker-a

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Migracije i Seed
```bash
cd backend
npm run migrate
npm run seed
```
