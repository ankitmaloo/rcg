# Rapid Campaign Generator - Backend

FastAPI backend service for generating marketing campaign assets using Google Gemini AI.

## Architecture

### File Structure

```
backend/
├── main.py           # FastAPI application with API endpoints
├── ai_assist.py      # AI assistant module with Gemini API integration
├── requirements.txt  # Python dependencies
└── .env             # Environment variables (not in repo)
```

### Key Features

1. **Organized Code Structure**
   - `ai_assist.py`: All AI-related logic isolated in a dedicated module
   - `main.py`: API endpoints and request handling
   - Clean separation of concerns

2. **Threading Support**
   - Thread pool with minimum 4 workers (configured based on CPU count)
   - Each API request runs in a separate thread for parallel processing
   - Efficient handling of multiple concurrent requests from UI

3. **Streaming Support**
   - All endpoints have streaming variants (`*-stream`)
   - Real-time response delivery as AI generates content
   - Server-Sent Events (SSE) for live updates

4. **Dual API Modes**
   - Non-streaming: Wait for complete response
   - Streaming: Receive chunks as they're generated

## API Endpoints

### Non-Streaming Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Detailed health with thread pool status |
| `/generate-campaign-assets` | POST | Generate complete campaign assets |
| `/generate-image-asset` | POST | Generate hero image from prompt |
| `/generate-landing-page-variant` | POST | Generate A/B test variant |

### Streaming Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/generate-campaign-assets-stream` | POST | Stream campaign assets generation |
| `/generate-image-asset-stream` | POST | Stream image generation |
| `/generate-landing-page-variant-stream` | POST | Stream variant generation |

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Run the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Thread Pool Configuration

The backend automatically configures a thread pool with:
- **Minimum**: 4 workers
- **Actual**: max(4, CPU count)

This ensures parallel processing of multiple UI requests without blocking.

## AI Assistant Module

### AIAssistant Class

Located in `ai_assist.py`, provides:

#### Methods

- `generate_campaign_assets(prompt, brand_kit)` - Generate complete campaign
- `generate_campaign_assets_stream(prompt, brand_kit)` - Streaming variant
- `generate_image_asset(prompt)` - Generate image
- `generate_image_asset_stream(prompt)` - Streaming variant
- `generate_landing_page_variant(brand_name, content)` - A/B variant
- `generate_landing_page_variant_stream(brand_name, content)` - Streaming variant

#### Internal Helpers

- `_build_campaign_prompt(brand_kit)` - Construct campaign prompt
- `_build_variant_prompt(brand_name, content)` - Construct variant prompt

## Usage Examples

### Non-Streaming Request

```python
POST /generate-campaign-assets
{
  "prompt": "Launch campaign for eco-friendly water bottles",
  "brandKit": {
    "name": "EcoFlow",
    "primaryColor": "#00AA88",
    "secondaryColor": "#FFD700"
  }
}
```

### Streaming Request

```javascript
// Frontend code
const response = await fetch('http://localhost:8000/generate-campaign-assets-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, brandKit })
});

const reader = response.body.getReader();
// Process chunks as they arrive...
```

## Response Format

### Non-Streaming
Standard JSON response with complete data.

### Streaming
Server-Sent Events format:
```
data: {"chunk": "partial json content..."}

data: {"chunk": "more content..."}

data: {"error": "error message"} // if error occurs
```

## Error Handling

All endpoints include comprehensive error handling:
- Try-catch blocks around AI operations
- Detailed error messages in logs
- HTTP 500 errors with descriptive details
- Streaming errors sent via SSE

## Performance

- **Parallel Processing**: Multiple requests handled simultaneously
- **Async/Await**: Non-blocking I/O operations
- **Thread Pool**: Efficient resource utilization
- **Streaming**: Reduced time-to-first-byte

## Development

### Adding New Endpoints

1. Add AI logic to `ai_assist.py`
2. Create endpoint in `main.py`
3. Add Pydantic models if needed
4. Update this README

### Testing

```bash
# Test health check
curl http://localhost:8000/health

# Test campaign generation
curl -X POST http://localhost:8000/generate-campaign-assets \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "brandKit": {"name": "Test"}}'
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

## Dependencies

- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **google-generativeai**: Gemini AI SDK
- **pydantic**: Data validation
- **python-dotenv**: Environment config

## License

MIT
