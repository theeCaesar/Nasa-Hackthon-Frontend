# Space Biology Knowledge Engine – Backend Service

This repository contains a Node.js/Express backend that powers a rich set of AI‑assisted features for the **NASA Space Apps Challenge 2025** entry *“Build a Space Biology Knowledge Engine”*.  The service exposes RESTful endpoints for summarisation, semantic search, conversational assistance, plain‑language explanations, study card generation and statistical analysis over a curated dataset of NASA bioscience publications.  A matching front‑end can consume these APIs to render an advanced dashboard with charts, graphs and AI‑generated insights.

## 🧬 Key features

| Feature | Description | Endpoints |
| --- | --- | --- |
| **AI Summariser** | Produces concise, bullet‑point summaries of publications in either an expert or student tone.  Summaries are cached in the database for reuse and can be regenerated on demand. | `GET /api/v1/summarize/:id?style=expert|student&force=true` and `POST /api/v1/summarize` |
| **Semantic Search** | Searches publications using vector embeddings.  Queries are embedded via OpenAI’s Ada model and compared against pre‑computed embeddings of each title.  Results are ranked by cosine similarity.  Optional query parameters let you filter by publication year (`year`) or restrict results to your own custom resources (`own=true`). | `GET /api/v1/search?q=...&limit=10&year=YYYY&own=true` |
| **Chatbot** | Wraps summarisation and search into a conversational assistant.  Given a conversation history, the assistant finds the most relevant papers, summarises them on the fly and uses them as context when replying. | `POST /api/v1/chat` |
| **Plain‑language Explainer** | The summariser supports an optional `style` flag (`expert` or `student`).  When set to `student` the response is simplified for a non‑expert audience. | `GET/POST /api/v1/summarize` |
| **Study Card Generator** | Generates question–answer pairs to help users learn from a publication.  Cards can optionally be exported to a PDF. | `GET /api/v1/cards/:id?count=5&pdf=true` |
| **Graph & Stats Endpoint** | Produces aggregated statistics for the dashboard (e.g. total publications, counts by year, most frequent words across titles). | `GET /api/v1/analysis/stats` |
| **Authentication & User Resources** | Users can register (`signup`) and log in (`login`) using a username and password.  Once authenticated they may add their own resources (title and link) which behave like NASA publications in all AI operations.  Resources are private to the owner but can be included in search results via `own=true`. | `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`, `POST /api/v1/users/resources`, `GET /api/v1/users/resources`, `DELETE /api/v1/users/resources/:id` |
| **Contact Form** | Submit feedback or support requests.  Authenticated users may omit their email; anonymous users must provide one. | `POST /api/v1/contact` |

## 🛠️ Prerequisites

1. **Node.js 18+** and **npm** installed.
2. **MongoDB** instance.  A local MongoDB server or a cloud service such as MongoDB Atlas will work.  The connection string is configured in `config.env`.
3. **OpenAI API key**.  Sign up for an API key at [platform.openai.com](https://platform.openai.com/) and add it to `config.env`.
4. **JWT secret**.  Generate a long random string and set `JWT_SECRET` in `config.env`; set `JWT_EXPIRES_IN` to control token lifetime (e.g. `30d`).

## 🚀 Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `config.env` and fill in the required values:

   ```ini
   PORT=5001
   MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/spacebio
   OPENAI_API_KEY=sk-...
   ```

3. **Import the dataset**

   The project includes a script to download the latest CSV of space biology publications from GitHub and import it into MongoDB.  The default source is [theeCaesar/SB_publication_PMC.csv](https://github.com/theeCaesar/SB_publication_PMC.csv)【522284923456706†L0-L10】.  Run the import script once before starting the server:

   ```bash
   npm run import:data
   ```

   You can override the URL in `utils/importData.js` if a newer dataset becomes available.  The script only inserts new entries and will skip duplicates on subsequent runs.

4. **Create your first account**

   To interact with personal resources you need a user account.  Use a tool like Postman or `curl` to call the signup endpoint:

   ```bash
   curl -X POST http://localhost:5001/api/v1/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"username": "alice", "email": "alice@example.com", "password": "secret"}'
   ```

   The response will include a JWT token.  Save it – you'll need to include it in the `Authorization` header (`Bearer <token>`) for authenticated requests.

5. **Start the server**

   ```bash
   npm start
   ```

   The API will be available at `http://localhost:5001/` (or the port you set).

## 📚 Example usage

### Summarise a publication

Fetch a summary for a publication by its MongoDB identifier.  You can toggle the tone via the `style` query parameter (`expert` is the default and `student` produces a simpler explanation).  Setting `force=true` regenerates the summary even if it already exists.

```
GET /api/v1/summarize/651234fc9b1b9fb0218e1234?style=student&force=true

Response:
{
  "title": "Microgravity induces pelvic bone loss through osteoclastic activity …",
  "summary": "• Microgravity reduces bone formation and increases bone resorption.\n• Osteoclast activation via CDKN1a/p21 is a key mechanism.\n• Results highlight the need for countermeasures to protect astronaut skeletal health.",
  "style": "student"
}
```

You can also post arbitrary text:

```
POST /api/v1/summarize
Content‑Type: application/json

{
  "title": "Effects of space radiation on cardiovascular health",
  "text": "Space radiation exposure is a major concern …",
  "style": "expert"
}
```

### Perform a semantic search

```
GET /api/v1/search?q=stem%20cell%20regeneration&limit=5

Response:
{
  "query": "stem cell regeneration",
  "count": 5,
  "results": [
    {
      "id": "65123abc9b1b9fb0218e5678",
      "title": "Stem Cell Health and Tissue Regeneration in Microgravity",
      "link": "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11988870/",
      "score": 0.83
    },
    …
  ]
}
```

You can refine search results using optional filters:

* `year=YYYY` – only consider publications from a specific year (if a year has been parsed for that record).
* `own=true` – restrict the results to your custom resources.  This requires a valid JWT token in the `Authorization` header.

For example, to search only your own resources from 2023:

```
GET /api/v1/search?q=biofilm&own=true&year=2023
Authorization: Bearer <your-token>
```

### Chat with the knowledge engine

Send an array of messages following OpenAI’s chat format.  The assistant will search for relevant papers based on the latest user message, summarise them, and answer.  The response also includes a list of sources used.

```
POST /api/v1/chat
Content‑Type: application/json

{
  "messages": [
    { "role": "user", "content": "How does microgravity affect bone density in astronauts?" }
  ],
  "top_k": 2
}

Response:
{
  "response": "Microgravity leads to rapid bone loss by decreasing osteoblast activity and …",
  "sources": [
    { "id": "651234…", "title": "Mice in Bion‑M 1 space mission: training and selection", "link": "https://…" },
    { "id": "651235…", "title": "Microgravity induces pelvic bone loss through osteoclastic …", "link": "https://…" }
  ]
}
```

### Generate study cards

```
GET /api/v1/cards/651234fc9b1b9fb0218e1234?count=3&pdf=true

Response:
{
  "id": "651234fc9b1b9fb0218e1234",
  "title": "Mice in Bion‑M 1 space mission: training and selection",
  "cards": [
    { "question": "What was the purpose of training mice for the Bion‑M 1 mission?", "answer": "To ensure animals acclimated to launch stress and microgravity." },
    …
  ],
  "pdfUrl": "/study_cards_651234fc9b1b9fb0218e1234.pdf"
}
```

### Retrieve statistics

```
GET /api/v1/analysis/stats

Response:
{
  "totalPublications": 608,
  "yearCounts": { "2014": 25, "2015": 31, … },
  "topWords": [
    { "word": "microgravity", "count": 54 },
    { "word": "genes", "count": 31 },
    …
  ]
}
```

### Register and log in

Create a new user account with a username and password (email is optional):

```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret"
}

Response:
{
  "status": "success",
  "token": "<jwt-token>",
  "data": {
    "user": {
      "id": "65c…",
      "username": "alice",
      "email": "alice@example.com"
    }
  }
}
```

Log in with existing credentials:

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "secret"
}

Response:
{
  "status": "success",
  "token": "<jwt-token>",
  "data": { "user": { … } }
}
```

Include the returned token as a Bearer token in the `Authorization` header for any authenticated requests.

### Manage your own resources

Add a custom resource:

```
POST /api/v1/users/resources
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "title": "Review of algae growth in microgravity",
  "link": "https://doi.org/10.1000/example"
}

Response:
{
  "status": "success",
  "data": {
    "resource": {
      "_id": "6512…",
      "title": "Review of algae growth in microgravity",
      "link": "https://doi.org/10.1000/example",
      "user": "65c…",
      "createdAt": "2025-10-05T…"
    }
  }
}
```

List your resources:

```
GET /api/v1/users/resources
Authorization: Bearer <your-token>

Response:
{
  "status": "success",
  "count": 2,
  "data": {
    "resources": [ { … }, … ]
  }
}
```

Delete a resource:

```
DELETE /api/v1/users/resources/6512…
Authorization: Bearer <your-token>

Response: 204 No Content
```

### Send a contact message

```
POST /api/v1/contact
Content-Type: application/json

{
  "email": "visitor@example.com",
  "message": "I love this project!"
}

// If authenticated you may omit the email field:
POST /api/v1/contact
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "message": "Please add more plant biology papers."
}

Response:
{
  "status": "success",
  "data": { "id": "6512…" }
}
```

## 📬 Postman collection

A Postman collection (`postman_collection.json`) is provided in this repository.  Import it into Postman to explore and test each endpoint quickly.  The collection defines example requests and demonstrates how to pass query parameters and request bodies.

## 🧱 Project structure

```
space-biology-engine/
├── controllers/        # Route handlers for each feature
├── models/             # Mongoose schemas for publications, users and contact messages
├── routes/             # Express routers defining API endpoints
├── utils/              # OpenAI wrapper, scraping helper and import script
├── data/               # CSV dataset (downloaded on import)
├── public/             # Generated PDFs and other static assets
├── app.js              # Express app configuration
├── server.js           # Server bootstrap and DB connection
├── config.env          # Environment variables (fill this out!)
└── README.md           # This documentation
```

## 🔒 Notes on security and privacy

All AI capabilities rely on the OpenAI API; your prompts and titles are transmitted to OpenAI’s servers for processing.  Do not submit sensitive or proprietary information.  The provided `config.env` file intentionally omits secret keys – please supply your own credentials and keep them private.  The dataset imported from GitHub contains only publication titles and links; the full article text is fetched directly from the publisher at request time and is not stored persistently.

## 📄 License

This project is released under the MIT License.  It is intended for educational purposes within the NASA Space Apps Challenge and carries no warranty.#   N a s a - H a c k t h o n - F r o n t e n d  
 