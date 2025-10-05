# 🚀 NASA Space Biology Knowledge Engine

> ⚡ **MAJOR UPDATE:** System optimized for **millisecond performance!** See [OPTIMIZATION_COMPLETE.md](OPTIMIZATION_COMPLETE.md)  
> � **NEW:** Authentication system with auto-learning preferences! See [AUTH_SYSTEM_SUMMARY.md](AUTH_SYSTEM_SUMMARY.md)  
> �📊 **New:** Real-time performance dashboard | 📡 **New:** Dynamic NASA data sources | 🏆 **Result:** 80x faster!

**Nakamas United - NASA Space Apps Challenge 2025**

An agentic AI system that synthesizes insights from over 600 space biology publications using a knowledge graph and advanced reasoning capabilities. Now with user authentication and automatic preference learning!

---

## 🎯 Project Overview

The NASA Space Biology Knowledge Engine is an intelligent research assistant that helps scientists, mission architects, and managers quickly find consensus, contradictions, and knowledge gaps across decades of space biology research. Using Google Gemini AI and a 5-agent orchestrator system, it provides evidence-based insights tailored to your role.

### Key Features

- **🤖 5-Agent AI System**: Librarian, Cartographer, Analyst, Communicator, Orchestrator
- **🧠 Google Gemini 2.0 Flash**: AI-powered dynamic analysis
- **🔐 Authentication**: Email/password login with JWT tokens
- **💾 Smart Memory**: LangChain conversation history for authenticated users
- **🎓 Auto-Learning**: System learns your preferred persona and favorite topics
- **🎭 Persona-Based Responses**: Tailored insights for Scientists, Architects, and Managers
- **📊 Real-Time Analysis**: Dynamic evidence from 607 NASA publications
- **🔍 Advanced Search**: Natural language queries with AI understanding
- **📝 Synthesized Briefs**: Consensus, contradictions, and knowledge gaps in one view
- **💬 AI Chatbot**: Context-aware chat assistant with memory

---

## 🆕 Authentication & Memory System

### Features:
- **Email/Password Authentication**: Secure JWT token-based auth
- **Auto-Learning Preferences**: No manual configuration needed
  - Tracks which persona you use most (Research Scientist, Manager, Mission Architect)
  - Learns your favorite topics from query patterns
  - Counts usage statistics automatically
- **Conversation Memory**: Chat history persists across sessions (LangChain)
- **Optional Login**: Can use app without account (guest mode)
- **Beautiful UI**: Modern glassmorphism login design

### Quick Start:
1. Open app at http://localhost:5173
2. Choose: Register, Login, or Continue without login
3. If logged in: Your preferences are automatically learned!
4. Check [QUICK_START_AUTH.md](QUICK_START_AUTH.md) for detailed guide

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Streamlit)                    │
│  • Command Bar  • Agent Activity Log  • Persona Selector    │
│  • Synthesized Briefs  • Graph Visualization                │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────────┐
│                    BACKEND (FastAPI)                        │
│  • /query endpoint  • /visualize endpoint  • /stats         │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼─────┐  ┌────▼────┐  ┌──────▼──────┐
│  Chimera    │  │  Tools  │  │   Neo4j     │
│   Agent     │──│ (Query  │──│  Knowledge  │
│ (LangChain) │  │  Graph) │  │    Graph    │
└─────────────┘  └─────────┘  └─────────────┘
```

### Technology Stack

- **Frontend**: Streamlit, streamlit-agraph
- **Backend**: FastAPI, Uvicorn
- **AI/ML**: LangChain, OpenAI GPT-4
- **Database**: Neo4j (AuraDB)
- **Data Processing**: Pandas, BeautifulSoup4

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Neo4j AuraDB account (free tier)
- OpenAI API key

### 1. Clone and Setup

```bash
# Navigate to project directory
cd "NASA Space Apps Challenge 2025/nasa-knowledge-engine"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-your-api-key-here

# Neo4j Database Configuration
NEO4J_URI=neo4j+s://xxxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password_here
```

**Getting Neo4j Credentials:**
1. Go to [Neo4j AuraDB](https://neo4j.com/cloud/aura/)
2. Create a free instance
3. Save the URI, Username, and Password

### 3. Ingest Data (One-Time Setup)

Place `SB_publication_PMC.csv` in the `data/` directory, then run:

```bash
cd scripts
python ingest_data.py
```

This will:
- Scrape publication content
- Extract structured data using LLM
- Populate the Neo4j knowledge graph

**Note**: This may take 30-60 minutes depending on the number of publications.

### 4. Start the Backend

```bash
cd backend
uvicorn main:app --reload
```

The backend API will be available at `http://127.0.0.1:8000`

**Test the backend:**
```bash
curl http://127.0.0.1:8000/health
```

### 5. Start the Frontend

Open a new terminal:

```bash
cd frontend
streamlit run app.py
```

The app will open in your browser at `http://localhost:8501`

---

## 📖 Usage Guide

### Querying the Knowledge Engine

1. **Select Your Persona**: Choose your role in the sidebar
   - **Research Scientist**: Detailed, technical insights
   - **Mission Architect**: Practical, system-level implications
   - **Manager**: High-level summaries and strategic insights

2. **Enter Your Question**: Type a research question in the command bar
   ```
   Example: "What is the consensus on how microgravity affects rodent vision?"
   ```

3. **Review the Agent Activity Log**: Watch the AI's reasoning process
   - Goal deconstruction
   - Tool selection
   - Query execution
   - Synthesis

4. **Read the Synthesized Brief**: Get structured insights
   - **Consensus**: Main findings with confidence level
   - **Contradiction Alert**: Conflicting evidence
   - **Knowledge Gap**: Areas needing more research
   - **Supporting Evidence**: Citations with URLs

5. **Explore Visualizations**: Click "Visualize Knowledge Graph" to see connections

### Example Questions

- "What genes are involved in muscle atrophy during spaceflight?"
- "How does space radiation affect plant growth?"
- "Are there contradictions in cardiovascular adaptation studies?"
- "What is known about immune system changes in microgravity?"

---

## 🏛️ Project Structure

```
nasa-knowledge-engine/
├── backend/
│   ├── main.py              # FastAPI app with endpoints
│   ├── agent_logic.py       # Chimera agent and master prompt
│   ├── knowledge_graph.py   # Neo4j connection handler
│   └── tools.py             # LangChain tools for querying
├── data/
│   └── SB_publication_PMC.csv  # Source data (not included)
├── frontend/
│   └── app.py               # Streamlit UI
├── scripts/
│   └── ingest_data.py       # Data ingestion script
├── .env                     # Environment variables (create this)
├── .env.example             # Template for .env
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 🔧 API Documentation

### Endpoints

#### `GET /`
Root endpoint with API info.

#### `GET /health`
Health check with database connection status.

#### `POST /query`
Query the Chimera agent.

**Request:**
```json
{
  "question": "What is the consensus on microgravity effects?",
  "persona": "Research Scientist"
}
```

**Response:**
```json
{
  "answer": "Synthesized markdown response...",
  "intermediate_steps": [...],
  "success": true,
  "publications": [...]
}
```

#### `POST /visualize`
Get graph visualization data.

**Request:**
```json
{
  "question": "microgravity bone loss"
}
```

**Response:**
```json
{
  "nodes": [...],
  "edges": [...]
}
```

#### `GET /stats`
Get knowledge graph statistics.

**Response:**
```json
{
  "publications": 600,
  "subjects": 45,
  "stressors": 12,
  "genes_proteins": 350
}
```

---

## 🧪 Testing

### Test the Backend

```bash
# Health check
curl http://127.0.0.1:8000/health

# Get stats
curl http://127.0.0.1:8000/stats

# Test query
curl -X POST http://127.0.0.1:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What studies mention mice?", "persona": "Research Scientist"}'
```

### Test the Frontend

1. Start both backend and frontend
2. Enter a test query
3. Verify the agent activity log shows reasoning steps
4. Check that the synthesized brief is properly formatted
5. Test the visualization feature

---

## 🎓 How It Works

### The Chimera Agent

Chimera is a LangChain-powered agent that follows a structured reasoning process:

1. **Deconstruct the Goal**: Break the question into sub-questions
2. **Formulate a Plan**: Determine which tools to use
3. **Execute Tool Calls**: Query the knowledge graph
4. **Synthesize the Answer**: Combine evidence into insights
5. **Format the Output**: Present as a structured brief

### The Knowledge Graph

The Neo4j graph contains:

- **Publications**: Scientific papers with titles and URLs
- **Subjects**: Organisms studied (Mice, Plants, Cells, etc.)
- **Stressors**: Conditions applied (Microgravity, Radiation, etc.)
- **GeneProteins**: Specific genes and proteins mentioned
- **Findings**: Key experimental results

**Relationships:**
- `(Publication)-[:STUDIES]->(Subject)`
- `(Publication)-[:APPLIES]->(Stressor)`
- `(Publication)-[:MENTIONS]->(GeneProtein)`
- `(Publication)-[:REPORTS]->(Finding)`

---

## 🐛 Troubleshooting

### Backend won't start
- Check that `.env` file exists with valid credentials
- Verify Neo4j connection: `curl http://127.0.0.1:8000/health`
- Check Python version: `python --version` (should be 3.9+)

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check `BACKEND_URL` in `frontend/app.py`
- Look for CORS errors in browser console

### No data in knowledge graph
- Run the ingestion script: `python scripts/ingest_data.py`
- Check that `SB_publication_PMC.csv` is in `data/` directory
- Verify Neo4j credentials in `.env`

### LLM errors
- Check OpenAI API key is valid
- Verify you have API credits
- Check rate limits

---

## 🚀 Deployment

### Deploy Backend (Railway/Render)

1. Create a `Procfile`:
   ```
   web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```

2. Add environment variables to the platform
3. Deploy from GitHub

### Deploy Frontend (Streamlit Cloud)

1. Push code to GitHub
2. Connect repository to Streamlit Cloud
3. Set secrets in Streamlit dashboard
4. Deploy

---

## 🏆 Hackathon Presentation Tips

### What to Demonstrate

1. **The Problem**: Information overload in space biology research
2. **The Solution**: Agentic AI with knowledge graph
3. **Live Demo**: 
   - Show a complex query
   - Highlight the agent's reasoning
   - Display consensus/contradictions/gaps
   - Visualize the knowledge graph
4. **Technical Architecture**: Show the system diagram
5. **Impact**: How this helps NASA missions

### Key Talking Points

- "Agentic AI that reasons, not just retrieves"
- "Evidence-based synthesis from 600+ publications"
- "Persona-based insights for different stakeholders"
- "Identifies contradictions and knowledge gaps"
- "Real-time visualization of research connections"

---

## 📄 License

This project was created for the NASA Space Apps Challenge 2025.

---

## 👥 Team: Nakamas United

Built with passion for space exploration and AI innovation.

---

## 🙏 Acknowledgments

- NASA Space Biology Program
- OpenAI for GPT-4 API
- Neo4j for AuraDB
- LangChain community

---

**🚀 Ready to ignite discovery!**
