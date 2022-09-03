from typing import Any, List, Union

from fastapi import APIRouter, Cookie, Query, Depends
from starlette import status
from starlette.requests import Request
from starlette.templating import Jinja2Templates
from starlette.websockets import WebSocket

from websockets_actions.fastapi.actions import WebSocketBroadcast

router = APIRouter()


@router.get('/')
async def home_page(request: Request) -> Jinja2Templates.TemplateResponse:
    template = Jinja2Templates(directory='templates')
    return template.TemplateResponse('index.html', {'request': request})


async def get_cookie_or_token(
    websocket: WebSocket,
    session: Union[str, None] = Cookie(default=None),
    token: Union[str, None] = Query(default=None),
):
    if session is None and token is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    return session or token


class ChatWebSockets(WebSocketBroadcast):
    actions: List[str] = ['join', 'send_message', 'close']

    async def join(self, websocket: WebSocket, data: Any) -> None:
        await self.manager.broadcast({'action': 'join', 'message': data.get('username')})

    async def send_message(self, websocket: WebSocket, data: Any) -> None:
        await self.manager.broadcast({
            'action': 'newMessage',
            'username': data.get('username'),
            'message': data.get('message')
        })

    async def close(self, websocket: WebSocket, data: Any | None = None) -> None:
        await super().on_disconnect(websocket, 1000)
        await self.manager.broadcast_exclude(
            [websocket],
            {'action': 'disconnect', 'message': data.get('username')}
        )

    async def __call__(self, websocket: WebSocket, token: str = Depends(get_cookie_or_token)):
        await super().__call__(websocket)
