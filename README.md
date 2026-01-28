# Game Night

Full-stack web aplikacija za upravljanje turnirima i rezultatima drustvenih igara.

## Tehnologije

- **Frontend:** React + TypeScript + Bootstrap
- **Backend:** Node.js + Express.js + TypeScript
- **Baza:** MySQL + Sequelize ORM
- **Auth:** JWT (JSON Web Tokens)
- **DevOps:** Docker + Docker Compose

## Pokretanje projekta

### Sa Docker-om (preporuceno)

```bash
# Pokretanje svih servisa
docker-compose up --build

# Backend: http://localhost:5000
# Frontend: http://localhost:3000
# MySQL: localhost:3306
```

### Bez Docker-a

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

### Migracije i Seed podaci

```bash
# U backend direktorijumu
npm run migrate
npm run seed
```

## Struktura projekta

```
game-night/
├── docker-compose.yml
├── backend/
│   ├── src/
│   │   ├── config/          # Konfiguracija baze
│   │   ├── models/          # Sequelize modeli
│   │   ├── controllers/     # API kontroleri
│   │   ├── routes/          # Express rute
│   │   ├── middleware/      # Auth middleware
│   │   ├── migrations/      # Database migracije
│   │   ├── seeds/           # Test podaci
│   │   └── app.ts           # Entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # React komponente
│   │   ├── pages/           # Stranice
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # Auth context
│   │   ├── services/        # API servis
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── Dockerfile
└── README.md
```

## Modeli baze podataka

1. **User** - Korisnici sistema (admin, player, guest)
2. **Season** - Sezone takmicenja
3. **Game** - Drustvene igre
4. **Event** - Game night dogadjaji
5. **Match** - Odigrane partije sa rezultatima
6. **Registration** - Prijave na dogadjaje
7. **EventGame** - Pivot tabela za Event-Game relaciju

## API Endpoints

### Auth
- `POST /api/auth/register` - Registracija
- `POST /api/auth/login` - Prijava
- `POST /api/auth/logout` - Odjava
- `GET /api/auth/me` - Trenutni korisnik

### Events
- `GET /api/events` - Lista dogadjaja
- `GET /api/events/:id` - Detalji dogadjaja
- `POST /api/events` - Kreiranje (admin)
- `PUT /api/events/:id` - Izmena (admin)
- `DELETE /api/events/:id` - Brisanje (admin)
- `POST /api/events/:id/register` - Prijava na dogadjaj
- `DELETE /api/events/:id/register` - Odjava sa dogadjaja

### Games
- `GET /api/games` - Lista igara
- `POST /api/games` - Dodavanje (admin)
- `PUT /api/games/:id` - Izmena (admin)
- `DELETE /api/games/:id` - Brisanje (admin)

### Matches
- `GET /api/matches` - Lista partija
- `POST /api/matches` - Unos rezultata (admin)
- `PUT /api/matches/:id` - Izmena (admin)
- `DELETE /api/matches/:id` - Brisanje (admin)

### Scoreboard
- `GET /api/scoreboard` - Rang lista
- `GET /api/scoreboard/games/:id` - Rang lista po igri
- `GET /api/scoreboard/seasons` - Lista sezona

### Users
- `GET /api/users/me` - Profil korisnika
- `GET /api/users/me/stats` - Statistika korisnika
- `PUT /api/users/me` - Azuriranje profila

## Tipovi korisnika

1. **Admin** - Puni pristup, upravljanje dogadjajima i unosom rezultata
2. **Player** - Prijava na dogadjaje, pregled statistike
3. **Guest** - Samo pregled, bez prijave na dogadjaje

## Test kredencijali (nakon seed-a)

- **Admin:** admin@gamenight.com / password123
- **Player:** marko@example.com / password123

## Funkcionalnosti

### Frontend
- Pretraga dogadjaja sa debounce-om
- Filtriranje rang liste po igri i sezoni
- Real-time form validacija
- Responzivan dizajn (Bootstrap)
- Protected routes za autentifikovane korisnike
- Admin panel sa CRUD operacijama

### Backend
- JWT autentifikacija
- Role-based access control
- RESTful API
- Sequelize ORM sa relacijama
- 3 tipa migracija (kreiranje, dodavanje kolone, izmena kolone)

## Development

### Environment varijable

Backend (`.env`):
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=gamenight
DB_USER=gamenight
DB_PASSWORD=gamenightpass
JWT_SECRET=your-secret-key
PORT=5000
```

Frontend:
```
REACT_APP_API_URL=http://localhost:5000/api
```
