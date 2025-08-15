// Cloudflare Workers 환경에서 itty-router를 CDN을 통해 import합니다.
import { Router } from 'https://esm.sh/itty-router@4.0.12';

// 라우터 인스턴스를 생성합니다.
const router = Router();

// JSON 문자열에서 유효한 JSON 부분만 추출하는 유틸리티 함수
// Node.js 코드의 로직을 그대로 유지했습니다.
function extractJsonSubstring(text) {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        return text.substring(startIndex, endIndex + 1);
    }
    
    const arrayStartIndex = text.indexOf('[');
    const arrayEndIndex = text.lastIndexOf(']');
    if (arrayStartIndex !== -1 && arrayEndIndex !== -1 && arrayEndIndex > arrayStartIndex) {
        return text.substring(arrayStartIndex, arrayEndIndex + 1);
    }

    return null;
}

// EUC-KR 인코딩 및 퍼센트 인코딩 함수
// iconv-lite 대신 Workers 환경에서 직접 구현합니다.
function percentEncodeEucKr(text) {
    const encoder = new TextEncoder('euc-kr');
    const encoded = encoder.encode(text);
    let result = '';
    for (const byte of encoded) {
        result += '%' + byte.toString(16).padStart(2, '0').toUpperCase();
    }
    return result;
}

// Base64 인코딩 함수
// Node.js의 Buffer를 대체합니다.
function base64Encode(str) {
    return btoa(str);
}


// '/api/schoolnumber'에 대한 POST 요청 처리
router.post('/api/schoolnumber', async (request) => {
    try {
        const data = await request.json();
        const encodedString = percentEncodeEucKr(data.school);
        
        const response = await fetch(`http://comci.net:4082/36179?17384l${encodedString}`);
        if (!response.ok) {
            return new Response(JSON.stringify({ error: `HTTP error! status: ${response.status}` }), {
                headers: { 'Content-Type': 'application/json' },
                status: response.status
            });
        }
        
        const text = await response.text();
        const jsonSubstring = extractJsonSubstring(text);
        
        if (!jsonSubstring) {
            return new Response(JSON.stringify({ error: "응답에서 유효한 JSON 부분을 찾을 수 없습니다." }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            });
        }

        const jsonData = JSON.parse(jsonSubstring);
        return new Response(JSON.stringify(jsonData), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        console.error("Fetch 요청 또는 JSON 파싱 오류:", error.message);
        return new Response(JSON.stringify({ error: "Fetch 요청 중 오류가 발생했습니다." }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
});


// '/api/school/:id'에 대한 GET 요청 처리
router.get('/api/school/:id', async (request) => {
    try {
        const schoolnumber = request.params.id;
        const base64Str = base64Encode(`73629_${schoolnumber}_0_1`);

        const response = await fetch(`http://comci.net:4082/36179?${base64Str}`);
        if (!response.ok) {
            return new Response(JSON.stringify({ error: `HTTP error! status: ${response.status}` }), {
                headers: { 'Content-Type': 'application/json' },
                status: response.status
            });
        }
        
        const text = await response.text();
        const jsonSubstring = extractJsonSubstring(text);

        if (!jsonSubstring) {
            return new Response(JSON.stringify({ error: "응답에서 유효한 JSON 부분을 찾을 수 없습니다." }), {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            });
        }

        const jsonData = JSON.parse(jsonSubstring);
        return new Response(JSON.stringify(jsonData), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        console.error("Fetch 요청 또는 JSON 파싱 오류:", error.message);
        return new Response(JSON.stringify({ error: "Fetch 요청 중 오류가 발생했습니다." }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
});

// 모든 API 요청을 처리하는 핸들러
export default {
    fetch: router.handle
};
