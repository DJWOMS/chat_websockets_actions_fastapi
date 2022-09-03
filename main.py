from fastapi.applications import FastAPI
from fastapi.staticfiles import StaticFiles

from src.endpoints import router, ChatWebSockets

app = FastAPI(debug=True)


app.include_router(router)
app.mount('/static', app=StaticFiles(directory='static'))
app.add_api_websocket_route('/ws', ChatWebSockets())
