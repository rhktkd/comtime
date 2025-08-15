// app.js에 있는 express 앱을 불러옵니다.
import app from '../app.js'; 

// Express 미들웨어를 Cloudflare Functions에 맞게 변환하는 헬퍼 함수
const toWebRequest = (request) => {
  const url = new URL(request.url);
  const webRequest = new Request(request.url, request);
  webRequest.headers = request.headers;
  webRequest.body = request.body;
  return webRequest;
};

// 모든 요청을 처리하는 함수
export async function onRequest({ request, next }) {
  const expressRequest = toWebRequest(request);
  const expressResponse = {};

  return new Promise((resolve) => {
    // Express 앱을 실행하고 응답을 resolve합니다.
    app(expressRequest, expressResponse, () => {
      resolve(new Response(expressResponse.body, {
        status: expressResponse.statusCode,
        headers: expressResponse.headers,
      }));
    });
  });
}